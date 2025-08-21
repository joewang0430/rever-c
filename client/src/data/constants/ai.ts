export interface AIInfo {
    id: string;
    name: string;
    shortDescription: string;
    description: string;
    rating: string;
    image: string;
    available: boolean;
};

export const aiList: Record<string, AIInfo> = {
  // "gemma3n:e4b": {
  //   id: "gemma3n:e4b",
  //   name: "AI Gemma",
  //   shortDescription: "tbd",
  //   description: "Your AI classmate, powered by Gemma-3n-4B",
  //   rating: "(200)",
  //   image: ``,
  //   available: false,
  // },
  "deepseek-r1": {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    shortDescription: "Deepseek's model",
    description: "Open source, reasoning language model from DeepSeek",
    rating: "(200)",
    image: `svgs/ai/deepseek-r1.svg`,
    available: true,
  },
  "gemini-2pt5": {
    id: "gemini-2pt5",
    name: "Gemini 2.5",
    shortDescription: "Google's model",
    description: "Powerful language model developed by Google",
    rating: "(200)",
    image: `svgs/ai/gemini-2pt5.svg`,
    available: true,
  },
  "qwen-3": {
    id: "qwen-3",
    name: "Qwen 3",
    shortDescription: "Alibaba's model",
    description: "Alibaba's next-generation language model",
    rating: "(200)",
    image: `svgs/ai/qwen-3.svg`,
    available: true,
  },
};