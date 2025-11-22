export const geminiModels = [
  "gemini-3-pro-preview",
  "gemini-2.5-pro",
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-exp",
];

export const defaultGeminiMaxTokens = 1024;

export const modelsWithImageUrlSupport = [
  "gemini-3-pro*",
  "gemini-2.5*",
  "gemini-2.0*",
];

export const supportedImageTypes = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

export const maxToolRoundtrips = 10;
