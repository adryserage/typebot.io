export const geminiModels = [
  "gemini-2.0-flash-exp",
  "gemini-1.5-pro-latest",
  "gemini-1.5-flash-latest",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-pro",
];

export const defaultGeminiMaxTokens = 1024;

export const modelsWithImageUrlSupport = ["gemini-1.5*", "gemini-2.0*"];

export const supportedImageTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

export const maxToolRoundtrips = 10;

