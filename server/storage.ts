import {
  users,
  companies,
  userSessions,
  coverLetters,
  type User,
  type InsertUser,
  type Company,
  type InsertCompany,
  type UserSession,
  type InsertUserSession,
  type CoverLetter,
  type InsertCoverLetter,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserCustomPrompt(userId: string, customPrompt: string): Promise<User>;
  
  // Company operations
  createCompanies(companies: InsertCompany[]): Promise<Company[]>;
  getCompaniesByBatch(userId: string, batch: string): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  
  // User session operations
  getUserSession(userId: string): Promise<UserSession | undefined>;
  upsertUserSession(session: InsertUserSession): Promise<UserSession>;
  
  // Cover letter operations
  createCoverLetter(coverLetter: InsertCoverLetter): Promise<CoverLetter>;
  getCoverLettersByUser(userId: string): Promise<CoverLetter[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserCustomPrompt(userId: string, customPrompt: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ customPrompt, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async createCompanies(companyData: InsertCompany[]): Promise<Company[]> {
    const createdCompanies = await db
      .insert(companies)
      .values(companyData)
      .returning();
    return createdCompanies;
  }

  async getCompaniesByBatch(userId: string, batch: string): Promise<Company[]> {
    return await db
      .select()
      .from(companies)
      .where(and(eq(companies.userId, userId), eq(companies.uploadBatch, batch)))
      .orderBy(companies.rowIndex);
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async getUserSession(userId: string): Promise<UserSession | undefined> {
    const [session] = await db
      .select()
      .from(userSessions)
      .where(eq(userSessions.userId, userId));
    return session;
  }

  async upsertUserSession(sessionData: InsertUserSession): Promise<UserSession> {
    const existing = await this.getUserSession(sessionData.userId);
    
    if (existing) {
      const [updated] = await db
        .update(userSessions)
        .set({ ...sessionData, updatedAt: new Date() })
        .where(eq(userSessions.userId, sessionData.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(userSessions)
        .values(sessionData)
        .returning();
      return created;
    }
  }

  async createCoverLetter(coverLetterData: InsertCoverLetter): Promise<CoverLetter> {
    const [coverLetter] = await db
      .insert(coverLetters)
      .values(coverLetterData)
      .returning();
    return coverLetter;
  }

  async getCoverLettersByUser(userId: string): Promise<CoverLetter[]> {
    return await db
      .select()
      .from(coverLetters)
      .where(eq(coverLetters.userId, userId))
      .orderBy(desc(coverLetters.createdAt));
  }
}

export const storage = new DatabaseStorage();
