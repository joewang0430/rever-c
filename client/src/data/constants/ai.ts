export interface AIInfo {
    id: string;
    name: string;
    description: string;
};

export const aiList: Record<string, AIInfo> = {
  "gemma3n:e4b": {
    id: "gemma3n:e4b",
    name: "AI Gemma",
    description: "Your AI classmate, powered by Gemma-3n-4B"
  },
};