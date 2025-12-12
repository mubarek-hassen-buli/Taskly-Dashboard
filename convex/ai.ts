import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateTasks = action({
  args: {
    prompt: v.string(),
    currentDate: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable not set");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-2.5-flash - the current stable, production-ready model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
You are a helpful task management assistant.
Your goal is to extract structured tasks from the user's natural language input.
The user is providing this input on: ${args.currentDate}.

Return a JSON object with a "tasks" key containing an array of task objects.
Each task object MUST have:
- title: string (concise summary)
- description: string (detailed explanation, default to empty string if none)
- priority: "Low Priority" | "Medium" | "High" | "Urgent" (infer from context, default "Medium")
- dueDate: number | null (timestamp in milliseconds, infer from context like "tomorrow", "next friday", etc.)

Example Output:
{
  "tasks": [
    {
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "priority": "Medium",
      "dueDate": 1715423232000
    }
  ]
}

If the user input is nonsense or not related to tasks, return an empty array.
Response must be valid JSON.
`;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
      ],
    });

    let text = "";
    try {
      const result = await chat.sendMessage(args.prompt);
      text = result.response.text();
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      if (error.message?.includes("429") || error.status === 429) {
        throw new Error("AI service is currently busy (Rate Limit Exceeded). Please try again in a moment.");
      }
      
      throw new Error("Failed to communicate with AI service.");
    }

    console.log("Gemini Response:", text);

    try {
      // Clean the response (sometimes markdown code blocks are included)
      const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanedText);
      
      if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
        throw new Error("Invalid response format");
      }

      // Basic validation/sanitization
      const validTasks = parsed.tasks.map((t: any) => ({
        title: typeof t.title === 'string' ? t.title : "New Task",
        description: typeof t.description === 'string' ? t.description : "",
        priority: ["Low Priority", "Medium", "High", "Urgent"].includes(t.priority) ? t.priority : "Medium",
        dueDate: typeof t.dueDate === 'number' ? t.dueDate : undefined,
      }));

      return validTasks;

    } catch (e) {
      console.error("Failed to parse AI response:", e);
      throw new Error("Failed to generate tasks from AI response");
    }
  },
});
