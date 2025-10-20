
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { Evaluation } from '../types';

export async function getTalStyleAnalysis(fen: string, evaluation: Evaluation, bestMove: string | null): Promise<string> {
  if (!process.env.API_KEY) {
    return "API_KEY environment variable not set. Please set it to use Gemini analysis.";
  }
  if (!bestMove) {
    return "The engine has not yet found a best move to analyze.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are a chess commentator embodying the spirit of the brilliant and aggressive grandmaster Mikhail Tal.
    Analyze the following chess position from his perspective. Your commentary should be fiery, creative, and focus on creating complexity and chaos on the board.

    Current Position (FEN): ${fen}

    Engine Evaluation:
    - Material Advantage: ${evaluation.material}
    - King Safety Score: ${evaluation.kingSafety}
    - Overall Score: ${evaluation.total.toFixed(2)} (from the current player's perspective)

    The engine's recommended move is: ${bestMove}

    Your Task:
    In 1-2 short paragraphs, provide a dramatic and insightful analysis.
    1.  Start by describing the position in your characteristic, attacking style.
    2.  Explain why the move "${bestMove}" is the correct choice, not just for sterile positional reasons, but because it drags the opponent into a "dark forest where 2+2=5, and the path out is only big enough for one."
    3.  Dismiss boring, safe alternatives. Emphasize intuition, attack, and complexity over simple material gain.
    `;
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "There was an error generating the analysis. The machine spirits are displeased.";
  }
}
