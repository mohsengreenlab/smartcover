import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "" 
});

export async function generateCoverLetter(prompt: string, userApiKey?: string): Promise<string> {
  try {
    // Use user's API key if provided, otherwise use environment key
    const apiKey = userApiKey || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error("No Gemini API key available. Please provide an API key.");
    }

    // Log minimal info for debugging
    console.log("Generating cover letter with model: gemini-1.5-flash");

    const geminiAI = new GoogleGenAI({ apiKey });

    const response = await geminiAI.models.generateContent({
      model: "gemini-1.5-flash",
      contents: prompt,
    });

    const generatedText = response.text;
    
    if (!generatedText) {
      throw new Error("No content generated from Gemini API");
    }

    return generatedText;
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error(`Failed to generate cover letter: ${JSON.stringify(error)}`);
  }
}

export function replacePlaceholders(template: string, company: { name: string; jobTitle: string; jobDescription: string }): string {
  return template
    .replace(/{COMPANY_NAME}/g, company.name)
    .replace(/{JOB_TITLE}/g, company.jobTitle)
    .replace(/{JOB_DESCRIPTION}/g, company.jobDescription);
}
