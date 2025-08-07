import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import multer from "multer";
import XLSX from "xlsx";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import { generateCoverLetter, replacePlaceholders } from "./services/gemini";

// Session configuration
const pgStore = connectPg(session);
const sessionStore = new pgStore({
  conString: process.env.DATABASE_URL,
  createTableIfMissing: false,
  ttl: 7 * 24 * 60 * 60 * 1000, // 1 week
  tableName: "sessions",
});

// Multer configuration for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: any) => {
  if (req.session && (req.session as any).userId) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "fallback-session-secret-for-development",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  }));

  // Auth routes
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Create session
      (req.session as any).userId = user.id;
      
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session
      (req.session as any).userId = user.id;
      
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Invalid login data" });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ id: user.id, email: user.email, name: user.name });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // File upload route
  app.post('/api/upload-excel', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = (req.session as any).userId;
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data.length < 2) {
        return res.status(400).json({ message: "Excel file must contain at least one data row" });
      }

      const batchId = randomUUID();
      const companies = [];

      console.log(`Processing Excel file with ${data.length} total rows (including header)`);

      // Skip header row and process data
      for (let i = 1; i < data.length; i++) {
        const row = data[i] as any[];
        
        console.log(`Row ${i}:`, row);
        
        // Check if row has at least 4 columns and all required fields are non-empty
        const hasRequiredFields = row && 
          row.length >= 4 && 
          row[0] !== undefined && row[0] !== null && String(row[0]).trim() !== '' &&
          row[1] !== undefined && row[1] !== null && String(row[1]).trim() !== '' &&
          row[2] !== undefined && row[2] !== null && String(row[2]).trim() !== '' &&
          row[3] !== undefined && row[3] !== null && String(row[3]).trim() !== '';
        
        if (hasRequiredFields) {
          const company = {
            userId,
            name: String(row[0]).trim(),
            applicationLink: String(row[1]).trim(),
            jobDescription: String(row[2]).trim(),
            jobTitle: String(row[3]).trim(),
            rowIndex: i - 1,
            uploadBatch: batchId,
          };
          
          console.log(`Adding company ${i}:`, company.name);
          companies.push(company);
        } else {
          console.log(`Skipping row ${i}: missing required fields`);
        }
      }

      console.log(`Total companies found: ${companies.length}`);

      if (companies.length === 0) {
        return res.status(400).json({ message: "No valid company data found in Excel file" });
      }

      // Save companies to database
      const savedCompanies = await storage.createCompanies(companies);

      // Update user session with new batch
      await storage.upsertUserSession({
        userId,
        currentBatch: batchId,
        currentCompanyIndex: 0,
      });

      res.json({ 
        message: `Successfully uploaded ${savedCompanies.length} companies`,
        batchId,
        totalCompanies: savedCompanies.length 
      });
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ message: "Failed to process Excel file" });
    }
  });

  // Get user companies
  app.get('/api/companies', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const userSession = await storage.getUserSession(userId);
      
      if (!userSession?.currentBatch) {
        return res.json({ companies: [], currentIndex: 0 });
      }

      const companies = await storage.getCompaniesByBatch(userId, userSession.currentBatch);
      
      // Get user to access custom prompt
      const user = await storage.getUser(userId);
      
      res.json({ 
        companies,
        currentIndex: userSession.currentCompanyIndex || 0,
        promptTemplate: user?.customPrompt || "My name is Max, I have over 9 years of experience as software QS/Tester. Generate a customized cover letter for {COMPANY_NAME} based on its job description: {JOB_DESCRIPTION} for the job title: {JOB_TITLE}."
      });
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  // Update user session
  app.patch('/api/user-session', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { currentCompanyIndex, promptTemplate } = req.body;

      const updateData: any = { userId };
      
      if (currentCompanyIndex !== undefined) updateData.currentCompanyIndex = currentCompanyIndex;

      const userSession = await storage.upsertUserSession(updateData);
      
      // If promptTemplate is provided, update it in users table
      if (promptTemplate !== undefined) {
        await storage.updateUserCustomPrompt(userId, promptTemplate);
      }
      
      res.json(userSession);
    } catch (error) {
      console.error("Error updating user session:", error);
      res.status(500).json({ message: "Failed to update user session" });
    }
  });

  // Generate cover letter
  app.post('/api/generate-cover-letter', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const { companyId } = req.body;

      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }

      // Get company data
      const company = await storage.getCompany(companyId);
      if (!company || company.userId !== userId) {
        return res.status(404).json({ message: "Company not found" });
      }

      // Get user for custom prompt
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const promptTemplate = user.customPrompt || 
        "My name is Max, I have over 9 years of experience as software QS/Tester. Generate a customized cover letter for {COMPANY_NAME} based on its job description: {JOB_DESCRIPTION} for the job title: {JOB_TITLE}.";

      // Replace placeholders in prompt
      const populatedPrompt = replacePlaceholders(promptTemplate, {
        name: company.name,
        jobTitle: company.jobTitle,
        jobDescription: company.jobDescription,
      });

      // Generate cover letter using Gemini (server-side API key only)
      const coverLetterContent = await generateCoverLetter(populatedPrompt);

      // Save generated cover letter
      const coverLetter = await storage.createCoverLetter({
        userId,
        companyId,
        content: coverLetterContent,
        prompt: populatedPrompt,
      });

      res.json({ 
        content: coverLetterContent,
        prompt: populatedPrompt,
        id: coverLetter.id 
      });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Failed to generate cover letter" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
