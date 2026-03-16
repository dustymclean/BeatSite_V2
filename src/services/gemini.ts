import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface GenerationParams {
  description: string;
  bpm: number;
  energy: number; // 0 to 1
  mood: string;
  genre: string;
  style: string;
  imageContext?: string; // base64 image data
}

export async function generateWebsite(params: GenerationParams) {
  const { description, bpm, energy, mood, genre, style, imageContext } = params;

  const systemInstruction = `
    You are an expert web designer and developer. 
    You create stunning, modern, single-page websites using React and Tailwind CSS.
    
    The user will provide a description, "musical metadata" (BPM, Energy, Mood, Genre), a "Visual Style Preset", and optionally an image for "Visual Style Transfer".
    
    STYLE PRESETS:
    - 'minimalist': Clean, lots of whitespace, subtle typography, monochromatic or very restrained color palette.
    - 'futuristic': Dark mode by default, glassmorphism, neon accents, high-tech UI elements, glowing borders.
    - 'retro': 80s/90s aesthetic, pixel art elements, vibrant/clashing colors, bold geometric shapes, CRT scanline effects.
    - 'organic': Soft rounded corners, earthy tones, nature-inspired textures, fluid/blob shapes, gentle transitions.
    - 'corporate': Professional, blue/gray/white palette, clear hierarchy, trust-building elements (testimonials, logos), structured grids.

    GENRE-SPECIFIC AESTHETICS (Blend with Style Preset):
    - 'electronic': Synthesizer-inspired UI, frequency-based patterns.
    - 'jazz': Sophisticated, rhythmic but smooth, smoky atmosphere.
    - 'rock': High energy, raw, impactful.
    - 'classical': Elegant, timeless, structured.
    - 'hip-hop': Street-style, bold, rhythmic.
    - 'indie': Hand-crafted, unique, personal.

    REAL-TIME BEAT SYNCHRONIZATION:
    - The component will receive a 'useBeat' hook as a prop.
    - 'useBeat()' returns { energy: number (0-1), frequencies: number[], isBeat: boolean }.
    - Use this hook to make the website ALIVE and REACTIVE to the music.
    - Examples:
      - Pulse elements on 'isBeat'.
      - Change background opacity or color based on 'energy'.
      - Animate a visualizer or background shapes using 'frequencies'.
      - Use 'motion' from 'framer-motion' for these reactive animations.
    
    DESIGN RULES:
    1. BPM-Driven Animations:
       - Use the provided BPM (${bpm}) for base animation durations (e.g., 60/BPM).
       - Combine base BPM timing with real-time 'useBeat' data for maximum immersion.
    
    2. AI Content Generation:
       - Generate REAL, relevant placeholder text for all sections based on the description and mood.
       - Suggest appropriate stock image categories (using unsplash/picsum keywords).
    
    TECHNICAL RULES:
    - Return ONLY a valid, self-contained React component named 'GeneratedSite'.
    - The component MUST accept 'useBeat' as a prop.
    - Use Tailwind CSS for ALL styling.
    - Do not include any imports other than 'React', 'motion' from 'framer-motion', and 'lucide-react' icons.
    - Assume Tailwind CSS and framer-motion are available globally.
    - The site MUST be fully responsive.
    
    IMPORTANT: Return the code as a string within a JSON object.
  `;

  const promptParts: any[] = [
    {
      text: `
        Description: ${description}
        Style Preset: ${style}
        Musical Context:
        - BPM: ${bpm}
        - Energy: ${energy.toFixed(2)}
        - Mood: ${mood}
        - Genre: ${genre}
        
        Generate the 'GeneratedSite' component now. Ensure it uses the 'useBeat' hook to react to the audio in real-time.
      `
    }
  ];

  if (imageContext) {
    promptParts.push({
      inlineData: {
        mimeType: "image/jpeg",
        data: imageContext.split(',')[1] || imageContext
      }
    });
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: { parts: promptParts },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          code: {
            type: Type.STRING,
            description: "The React component code for the generated website.",
          },
          explanation: {
            type: Type.STRING,
            description: "A brief explanation of how the music and image influenced the design.",
          }
        },
        required: ["code", "explanation"],
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Invalid response from AI");
  }
}
