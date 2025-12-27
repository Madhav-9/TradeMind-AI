import { GoogleGenAI } from "@google/genai";
import { Stock } from "../types";

export const getTechnicalAnalysis = async (stock: Stock): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const historyStr = stock.history.map(h => h.price).join(', ');
  const prompt = `
    Perform a short-term technical analysis for ${stock.name} (${stock.symbol}).
    Current Price: ${stock.price}
    Change: ${stock.changePercent}%
    Recent Price Data points (last 20 mins): [${historyStr}]
    
    Identify:
    1. Support and Resistance levels.
    2. Short-term trend (Bullish/Bearish/Neutral).
    3. Suggested Momentum.
    
    Keep it professional, concise (under 150 words), and add a disclaimer that this is AI-generated.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating analysis. Please check your API Key configuration.";
  }
};

export const getFundamentalAnalysis = async (stock: Stock): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Provide a fundamental snapshot for ${stock.name} (${stock.symbol}) listed in the ${stock.market} market.
    Focus on:
    1. Business Model.
    2. Key recent strengths or risks.
    3. Sector outlook (${stock.sector}).
    
    Do not use live earnings data unless known. Keep it under 150 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: prompt,
    });
    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating analysis. Please check your API Key configuration.";
  }
};

export const chatWithAI = async (message: string, context?: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const systemInstruction = `You are TradeMind AI, a helpful financial assistant. 
    ${context ? `Context: User is currently viewing: ${context}` : ''}
    DISCLAIMER: Mention you are an AI and this is not financial advice.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: message,
            config: {
                systemInstruction: systemInstruction,
            }
        });
        return response.text || "I couldn't process that request.";
    } catch (e) {
        return "I am having trouble connecting. Please check your API Key configuration.";
    }
}