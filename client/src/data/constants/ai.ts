export interface AIInfo {
    id: string;
    name: string;
    shortDescription: string;
    description: string;
    rating: string;
    image: string;
    available: boolean;
    disabledReason?: string;
};

export const aiList: Record<string, AIInfo> = {
  "deepseek-v3": {
    id: "deepseek-v3",
    name: "DeepSeek V3",
    shortDescription: "Deepseek's model",
    description: "Mixture-of-Experts language model from DeepSeek",
    rating: "(200)",
    image: `svgs/ai/deepseek-v3.svg`,
    available: true,
  },
  "gemini-2pt5": {
    id: "gemini-2pt5",
    name: "Gemini 2.5",
    shortDescription: "Google's model",
    description: "Powerful comprehensive language model by Google",
    rating: "(200)",
    image: `svgs/ai/gemini-2pt5.svg`,
    available: false,
    disabledReason: "Unavailable due to exceeding request frequency",
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