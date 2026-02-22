
import { GoogleGenAI, Type } from "@google/genai";
import { KTUActivityCategory } from "../types.ts";

// Safety check for process.env to prevent ReferenceError in browser ESM environments
const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

/**
 * Uses Gemini to suggest a KTU Activity Category based on a certificate title.
 */
export async function suggestCategory(title: string): Promise<KTUActivityCategory> {
  if (!title || title.length < 3) return KTUActivityCategory.TECHNICAL_FESTS;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Categorize this student activity title into one of the KTU categories: ${Object.values(KTUActivityCategory).join(", ")}. Title: "${title}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description: "The matched KTU activity category",
            }
          },
          required: ["category"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    const matched = Object.values(KTUActivityCategory).find(c => c.toLowerCase() === result.category?.toLowerCase());
    
    return matched || KTUActivityCategory.TECHNICAL_FESTS;
  } catch (error) {
    console.error("AI Categorization failed:", error);
    return KTUActivityCategory.TECHNICAL_FESTS;
  }
}
