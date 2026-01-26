import { GoogleGenAI, Type } from "@google/genai";
import { BattleState, AiMoveResponse } from "../types";
import { TYPE_CHART } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAiMove(battleState: BattleState): Promise<AiMoveResponse> {
  const model = "gemini-3-flash-preview";

  const prompt = `
    You are playing a Pokemon battle.
    You are controlling: ${battleState.opponentPokemon.name} (HP: ${battleState.opponentHp}/${battleState.opponentPokemon.maxHp}, Type: ${battleState.opponentPokemon.type}).
    Your opponent is: ${battleState.playerPokemon.name} (HP: ${battleState.playerHp}/${battleState.playerPokemon.maxHp}, Type: ${battleState.playerPokemon.type}).
    
    Here are your available moves:
    ${battleState.opponentPokemon.moves.map((m, i) => `${i}: ${m.name} (Type: ${m.type}, Power: ${m.power})`).join('\n')}
    
    Type effectiveness chart reminder:
    Water > Fire
    Fire > Grass
    Grass > Water
    Electric > Water
    
    Select the best move index (0-3) to defeat the opponent. Consider type effectiveness.
    Also provide a short, exciting, in-character commentary (max 1 sentence) as if the Pokemon or its trainer is speaking.
    The response must be a JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            moveIndex: { type: Type.INTEGER, description: "The index of the move to use (0-3)." },
            commentary: { type: Type.STRING, description: "Short battle commentary." },
          },
          required: ["moveIndex", "commentary"],
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
       throw new Error("Empty response from Gemini");
    }
    const result = JSON.parse(jsonText) as AiMoveResponse;
    
    // Validate move index
    if (result.moveIndex < 0 || result.moveIndex >= battleState.opponentPokemon.moves.length) {
      return { moveIndex: 0, commentary: "..." }; // Fallback
    }
    
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback simple AI
    const randomIndex = Math.floor(Math.random() * battleState.opponentPokemon.moves.length);
    return {
      moveIndex: randomIndex,
      commentary: `${battleState.opponentPokemon.name} attacks wildly!`
    };
  }
}
