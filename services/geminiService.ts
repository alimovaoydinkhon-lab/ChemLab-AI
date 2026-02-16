import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ExperimentData, Role, CanvasItem, Language } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const languageNames: Record<Language, string> = {
  en: 'English',
  ru: 'Russian',
  kk: 'Kazakh'
};

/**
 * Generates structured experiment data based on a topic name.
 */
export const generateExperimentDetails = async (topic: string, role: Role, language: Language): Promise<ExperimentData> => {
  const modelId = role === 'teacher' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  const langName = languageNames[language];
  
  const systemInstruction = role === 'teacher' 
    ? `You are a senior chemistry methodology expert aiding university professors. Provide detailed, rigorous academic content with pedagogical notes. Output in ${langName}.`
    : `You are a helpful chemistry tutor for students. Provide clear, simplified, safety-first step-by-step instructions. Output in ${langName}.`;

  const prompt = `Generate a chemistry experiment guide for: "${topic}". 
  The content MUST be in ${langName} language.
  
  Crucially, provide an 'initialAssembly' list representing the correct setup of the equipment. 
  For 'initialAssembly', provide 'x' and 'y' coordinates as percentages (0-100) of a 2D canvas (0,0 is top-left).
  Position the items logically to form a proper diagram (e.g., Bunsen burner at the bottom (y~80), Flask above it (y~60), Stand holding them).
  
  Return a strictly valid JSON object with the following schema (keys must be in English, values in ${langName}):
  {
    "title": "Experiment Title",
    "objective": "Clear objective",
    "equipment": ["Item 1", "Item 2"],
    "reagents": ["Chemical 1", "Chemical 2"],
    "steps": ["Step 1", "Step 2"],
    "safety": ["Precaution 1"],
    "errors": ["Common error 1"],
    "initialAssembly": [
      { "name": "Item Name", "x": 50, "y": 80 }
    ]
  }`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            objective: { type: Type.STRING },
            equipment: { type: Type.ARRAY, items: { type: Type.STRING } },
            reagents: { type: Type.ARRAY, items: { type: Type.STRING } },
            steps: { type: Type.ARRAY, items: { type: Type.STRING } },
            safety: { type: Type.ARRAY, items: { type: Type.STRING } },
            errors: { type: Type.ARRAY, items: { type: Type.STRING } },
            initialAssembly: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  x: { type: Type.NUMBER, description: "X position percentage 0-100" },
                  y: { type: Type.NUMBER, description: "Y position percentage 0-100" }
                },
                required: ["name", "x", "y"]
              }
            }
          },
          required: ["title", "objective", "equipment", "reagents", "steps", "safety", "errors", "initialAssembly"]
        }
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText) as ExperimentData;
  } catch (error) {
    console.error("Experiment generation failed:", error);
    throw new Error("Failed to generate experiment data.");
  }
};

/**
 * Analyzes the visual assembly based on item coordinates.
 */
export const analyzeAssembly = async (
  experimentTitle: string,
  items: CanvasItem[],
  containerWidth: number,
  containerHeight: number,
  language: Language
): Promise<{ feedback: string; isCorrect: boolean }> => {
  
  const langName = languageNames[language];

  // Normalize coordinates for the AI
  const layoutDescription = items.map(item => 
    `- ${item.name} at position (x: ${Math.round(item.x)}, y: ${Math.round(item.y)})`
  ).join('\n');

  const prompt = `
    I am simulating a 2D lab assembly check for the experiment: "${experimentTitle}".
    The canvas size is ${containerWidth}x${containerHeight}. Origin (0,0) is top-left.
    
    The user has placed the following items:
    ${layoutDescription}

    Analyze if this spatial arrangement makes sense for the experiment.
    For example, a burner should be below a flask. A funnel should be above a container.
    
    If it looks correct, return specific praise.
    If incorrect, explain why (e.g., "The burner is above the flask, which is dangerous").
    
    Provide the feedback in ${langName}.

    Output strictly JSON:
    {
      "isCorrect": boolean,
      "feedback": "string message"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isCorrect: { type: Type.BOOLEAN },
            feedback: { type: Type.STRING }
          }
        }
      }
    });
    
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Assembly analysis failed", error);
    return { isCorrect: false, feedback: "AI Analysis unavailable." };
  }
};

/**
 * Context-aware chat for the specific experiment.
 */
export const sendExperimentChatMessage = async (
  history: { role: string; text: string }[],
  newMessage: string,
  experimentContext: ExperimentData,
  role: Role,
  language: Language
): Promise<string> => {
  
  const langName = languageNames[language];

  const systemInstruction = role === 'teacher'
    ? `You are a methodology expert. Answer questions about the current experiment with academic rigour. Answer in ${langName}.`
    : `You are a lab tutor. Answer questions simply and safely, focusing on the current experiment. Answer in ${langName}.`;

  const contextStr = `Current Experiment: ${experimentContext.title}. 
  Objective: ${experimentContext.objective}. 
  Reagents: ${experimentContext.reagents.join(', ')}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        { role: 'user', parts: [{ text: `Context: ${contextStr}` }] }, // Prime context
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: newMessage }] }
      ],
      config: { systemInstruction }
    });

    return response.text || "No response received.";
  } catch (error) {
    console.error("Chat failed:", error);
    return "I am having trouble connecting to the lab assistant.";
  }
};

/**
 * General Chatbot using Gemini 3 Pro
 */
export const sendGeneralChatMessage = async (
    history: { role: string; text: string }[],
    newMessage: string,
    language: Language
): Promise<string> => {
    
    const langName = languageNames[language];
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [
                ...history.map(msg => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                })),
                { role: 'user', parts: [{ text: newMessage }] }
            ],
            config: {
                systemInstruction: `You are a helpful chemistry AI assistant. Answer general chemistry questions in ${langName}.`
            }
        });
        return response.text || "No response.";
    } catch (error) {
        console.error("General chat failed", error);
        return "Service unavailable.";
    }
};

/**
 * Image Editing using Gemini 2.5 Flash Image
 */
export const editLabImage = async (
  base64Image: string,
  promptText: string
): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image
            }
          },
          { text: promptText }
        ]
      }
    });

    // We need to parse candidates to find the image part
    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    return null;
  } catch (error) {
    console.error("Image edit failed:", error);
    throw error;
  }
};