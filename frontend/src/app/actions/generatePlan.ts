'use server';

import { genAI } from "@/lib/gemini";

// Temporary mock input based on user's feedback
const MOCK_INPUT = `
CS 101:
Midterm on April 5
Topics: Arrays, Linked Lists, Recursion

BIO 200:
Homework due March 30
Topics: Cell structure, DNA replication
`;

const SYSTEM_PROMPT = `
You are an expert study planner for college students.
Your goal is to take unstructured course notes, syllabi, and deadlines, and output a structured JSON study plan.

The JSON MUST conform to this exact structure:
{
  "title": "Study Plan",
  "overview": "Brief summary of what the student should focus on based on the provided input",
  "tasks": [
    {
      "course": "String - The name of the course",
      "task": "String - The specific action to take",
      "priority": "high | medium | low",
      "estimated_time": "String - e.g., '2 hours'",
      "deadline": "String - YYYY-MM-DD",
      "reason": "String - Why this task is important"
    }
  ]
}
`;

export interface StudyPlanTask {
  course: string;
  task: string;
  priority: string;
  estimated_time: string;
  deadline: string;
  reason: string;
}

export interface StudyPlanResponse {
  title: string;
  overview: string;
  tasks: StudyPlanTask[];
}

export async function generateStudyPlan(rawInput: string = MOCK_INPUT): Promise<StudyPlanResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `${SYSTEM_PROMPT}\n\nHere is the raw input:\n${rawInput}`;
    
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2,
        }
    });

    const response = result.response;
    const text = response.text();
    
    // Parse it to ensure it's valid JSON before sending to client
    const jsonPlan = JSON.parse(text);
    return jsonPlan;

  } catch (error) {
    console.error("Failed to generate plan:", error);
    throw new Error("Failed to generate study plan from Gemini");
  }
}
