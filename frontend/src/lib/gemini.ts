import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not defined');
}

// Initialize the Google Generative AI client
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
