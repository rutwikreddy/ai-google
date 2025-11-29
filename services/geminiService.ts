import { GoogleGenAI, Type } from "@google/genai";
import { ParsedResume } from "../types";

// Initialize the Gemini Client
// IMPORTANT: process.env.API_KEY is assumed to be available
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Parses a resume (PDF or Text) into a structured JSON format.
 */
export const parseResume = async (base64Data: string, mimeType: string): Promise<ParsedResume> => {
  const prompt = `
    You are an expert HR AI Resume Parser. 
    Analyze the provided resume document and extract structured data.
    
    1. Extract personal details, skills, work experience, and education.
    2. Estimate a skill proficiency level (0-100) based on context (years of experience, project complexity).
    3. Identify key strengths and potential weaknesses/gaps.
    4. Provide an overall "profile completeness" score (0-100).
    
    Return ONLY valid JSON matching the specified schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                linkedin: { type: Type.STRING },
                summary: { type: Type.STRING }
              },
              required: ["name", "email", "summary"]
            },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  level: { type: Type.NUMBER },
                  category: { type: Type.STRING }
                }
              }
            },
            experience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING },
                  company: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  description: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  degree: { type: Type.STRING },
                  school: { type: Type.STRING },
                  year: { type: Type.STRING }
                }
              }
            },
            overallScore: { type: Type.NUMBER },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as ParsedResume;

  } catch (error) {
    console.error("Error parsing resume:", error);
    throw error;
  }
};

/**
 * Chat with the resume context (RAG-like behavior using long context window).
 */
export const chatWithResume = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  base64Data: string,
  mimeType: string
): Promise<string> => {
  
  // We construct a specific system instruction that includes the document context
  // This simulates RAG by retrieving the relevant document (the resume) and putting it into context.
  const systemInstruction = `
    You are a helpful HR Assistant. 
    You have access to a candidate's resume. 
    Answer the user's questions specifically based on the provided resume document.
    If the information is not in the resume, explicitly say so.
    Be professional, concise, and helpful.
  `;

  // For the first message in a session, we need to pass the file content.
  // In a persistent chat session using the SDK, we would typically upload the file via File API
  // or pass it in the history.
  // For simplicity in this stateless service call (or managed state), we will 
  // treat this as a single turn generation if we aren't using the stateful 'chat' object,
  // OR we pass the file in the first turn of the history manually.
  
  // Strategy: We will use generateContent for each turn to fully control the context injection,
  // effectively rebuilding the "RAG" context each time.
  
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        {
            role: 'user',
            parts: [
                {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Data
                    }
                },
                { text: "Here is the resume context for our conversation."}
            ]
        },
        {
            role: 'model',
            parts: [{ text: "Understood. I have analyzed the resume. What would you like to know?" }]
        },
        ...history.map(h => ({
            role: h.role,
            parts: h.parts
        })),
        {
            role: 'user',
            parts: [{ text: message }]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
};
