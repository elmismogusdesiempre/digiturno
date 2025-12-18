import { GoogleGenAI, Type } from "@google/genai";

// Ensure API Key is available
const API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- FREE TIER GUARANTEE CONFIGURATION ---
// We explicitly use the 'Flash' series models which are designed for high efficiency 
// and serve as the default for the free tier on Google AI Studio.
const MODELS = {
  TEXT: 'gemini-2.5-flash',       // Efficient text generation
  IMAGE: 'gemini-2.5-flash-image' // Efficient image generation
};

// QUOTA MANAGEMENT SYSTEM
const QUOTA_KEY = 'digiturno_ai_daily_usage';
// Conservative limit to ensure safety within standard free tier limits
// (e.g. 15 RPM or 1500 RPD depending on specific region/tier details)
const MAX_DAILY_REQUESTS = 50; 

interface QuotaData {
  date: string;
  count: number;
}

export const getQuotaUsage = (): { count: number; limit: number; remaining: number } => {
  const today = new Date().toDateString();
  const stored = localStorage.getItem(QUOTA_KEY);
  let count = 0;

  if (stored) {
    const data: QuotaData = JSON.parse(stored);
    if (data.date === today) {
      count = data.count;
    } else {
      // Reset if old date found during read
      localStorage.setItem(QUOTA_KEY, JSON.stringify({ date: today, count: 0 }));
    }
  } else {
    // Initialize if empty
     localStorage.setItem(QUOTA_KEY, JSON.stringify({ date: today, count: 0 }));
  }

  return {
    count,
    limit: MAX_DAILY_REQUESTS,
    remaining: Math.max(0, MAX_DAILY_REQUESTS - count)
  };
};

const checkAndIncrementQuota = (): void => {
  const usage = getQuotaUsage();
  
  if (usage.count >= usage.limit) {
    throw new Error("QUOTA_EXCEEDED");
  }

  const today = new Date().toDateString();
  localStorage.setItem(QUOTA_KEY, JSON.stringify({
    date: today,
    count: usage.count + 1
  }));
};

/**
 * Generates an image for the display screen (e.g., ads, calming scenery)
 * GUARANTEE: Uses gemini-2.5-flash-image (Free/Flash tier compatible)
 */
export const generateDisplayImage = async (prompt: string): Promise<string | null> => {
  if (!API_KEY) return null;

  try {
    checkAndIncrementQuota();

    const response = await ai.models.generateContent({
      model: MODELS.IMAGE,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
          // imageSize is NOT supported in Flash tier, removed to ensure compatibility
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error: any) {
    if (error.message === "QUOTA_EXCEEDED") {
      throw error;
    }
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};

/**
 * Generates news or informational content for the ticker using Search Grounding
 * Context: COLOMBIA / SPANISH
 * GUARANTEE: Uses gemini-2.5-flash
 */
export const generateTickerInfo = async (topic: string): Promise<string> => {
  if (!API_KEY) return "Bienvenido a nuestro centro de atención. Por favor espere su turno.";

  try {
    checkAndIncrementQuota();

    const response = await ai.models.generateContent({
      model: MODELS.TEXT,
      contents: `Find the latest top 3 very short headlines relevant to Colombia about: ${topic}. Respond in Spanish. Format them as a single line string separated by " | ". Do not use markdown.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    
    return response.text?.trim() || "Información no disponible por el momento.";
  } catch (error: any) {
    if (error.message === "QUOTA_EXCEEDED") {
       throw error;
    }
    console.error("Gemini Search Error:", error);
    return "Bienvenido a DigiTurno. Por favor esté atento a la pantalla.";
  }
};

/**
 * Generates structured slide content + image for the bottom slider
 * GUARANTEE: Uses gemini-2.5-flash and gemini-2.5-flash-image
 */
export const generateSlideContent = async (topic: string): Promise<{ headline: string, lines: string[], imageUrl: string | null } | null> => {
    if (!API_KEY) return null;

    try {
        checkAndIncrementQuota();

        // 1. Generate Text Content (JSON)
        const textResponse = await ai.models.generateContent({
            model: MODELS.TEXT,
            contents: `Generate a short news slide about "${topic}" specifically for a Colombian audience. 
            Return a JSON object with:
            - "headline": Short catchy title in Spanish.
            - "lines": Array of 3 short sentences providing context in Spanish.
            - "imagePrompt": An English prompt to generate a relevant photorealistic image for this news, aspect ratio 1:1.`,
            config: {
                responseMimeType: "application/json"
            }
        });

        const jsonText = textResponse.text;
        if (!jsonText) return null;
        
        const data = JSON.parse(jsonText);

        // 2. Generate Image based on the prompt from the text model
        let imageUrl = null;
        if (data.imagePrompt) {
            try {
                const imageResponse = await ai.models.generateContent({
                    model: MODELS.IMAGE,
                    contents: { parts: [{ text: data.imagePrompt }] },
                    config: { imageConfig: { aspectRatio: "1:1" } }
                });
                
                for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
                    if (part.inlineData) {
                        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
                        break;
                    }
                }
            } catch (imgError) {
                console.error("Slide Image Gen Failed", imgError);
                imageUrl = "https://picsum.photos/400/400"; // Fallback
            }
        }

        return {
            headline: data.headline,
            lines: data.lines.slice(0, 3),
            imageUrl: imageUrl
        };

    } catch (error: any) {
        if (error.message === "QUOTA_EXCEEDED") {
            throw error;
        }
        console.error("Gemini Slide Gen Error", error);
        return null;
    }
};

/**
 * Finds a relevant map link for the location
 * GUARANTEE: Uses gemini-2.5-flash with Google Maps Tool
 */
export const findLocationMap = async (query: string): Promise<string | null> => {
    if (!API_KEY) return null;

    try {
        checkAndIncrementQuota();

        const response = await ai.models.generateContent({
            model: MODELS.TEXT,
            contents: `Find the location of ${query} in Colombia.`,
            config: {
                tools: [{ googleMaps: {} }]
            }
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
             // Try to find a map URI
             for (const chunk of chunks) {
                 if (chunk.web?.uri && chunk.web.uri.includes('google.com/maps')) {
                     return chunk.web.uri;
                 }
             }
        }
        return null;
    } catch (error: any) {
        if (error.message === "QUOTA_EXCEEDED") {
            throw error;
        }
        console.error("Gemini Maps Error", error);
        return null;
    }
}