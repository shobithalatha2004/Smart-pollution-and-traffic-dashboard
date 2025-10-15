
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAiInstance = (): GoogleGenAI | null => {
    // FIX: Lazily initialize the GoogleGenAI client to ensure API_KEY is present.
    if (ai) {
        return ai;
    }
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API_KEY is not set. AI features will not work.");
        return null;
    }
    ai = new GoogleGenAI({ apiKey });
    return ai;
};

export const getAIAnalysis = async (prompt: string): Promise<string> => {
  const aiInstance = getAiInstance();
  if (!aiInstance) {
    return Promise.resolve("AI functionality is disabled because the API key is not configured.");
  }
  
  try {
    const response: GenerateContentResponse = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Manually parse the response to avoid issues with the .text getter in some environments
    const firstCandidate = response.candidates?.[0];
    const firstPart = firstCandidate?.content?.parts?.[0];

    if (firstPart && 'text' in firstPart && typeof firstPart.text === 'string') {
      return firstPart.text;
    }
    
    console.warn("No text part found in Gemini response.", response);
    return "AI analysis could not be retrieved or the response was empty.";

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get analysis from AI model.");
  }
};