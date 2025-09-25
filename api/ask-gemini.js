// Using require for Node.js environment compatibility in serverless functions
const { GoogleGenAI } = require("@google/genai");

// This code will run on a server (e.g., Vercel) - not in the user's browser
module.exports = async (request, response) => {
  // Ensure the request is a POST request only
  if (request.method !== 'POST') {
    response.setHeader('Allow', ['POST']);
    return response.status(405).json({ message: `Method ${request.method} Not Allowed` });
  }

  try {
    // 1. Read the prompt from the request coming from the Frontend
    const { prompt } = request.body;

    if (!prompt) {
      return response.status(400).json({ error: 'Prompt is required' });
    }
    
    // 2. Safely initialize the GenAI client with the API key from environment variables
    // The API_KEY is set in the server environment variables.
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set on the server.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // 3. Send the request to Gemini from the server using the SDK
    const geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });

    const textResponse = geminiResponse.text;

    // 4. Send the final answer back to the Frontend
    return response.status(200).json({ response: textResponse });

  } catch (error) {
    console.error("Internal Server Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return response.status(500).json({ message: 'Internal Server Error', error: errorMessage });
  }
};
