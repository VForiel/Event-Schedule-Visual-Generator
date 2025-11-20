import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSpaceBackground = async (): Promise<string> => {
  try {
    // Using imagen-4.0-generate-001 for high quality images
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: 'A professional scientific poster background, astrophysics theme, deep space, dark blue and purple nebula, distant stars, clean void areas for text overlay, subtle geometric constellation lines, high resolution, minimal aesthetic',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '3:4', 
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes = response.generatedImages[0].image.imageBytes;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};