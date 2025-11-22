import { createBlock } from "@typebot.io/forge";
import { createChatCompletion } from "./actions/createChatCompletion";
import { generateVariables } from "./actions/generateVariables";
import { auth } from "./auth";
import { GeminiLogo } from "./logo";

export const geminiBlock = createBlock({
  id: "gemini",
  name: "Gemini",
  tags: ["ai", "chat", "completion", "google", "gemini"],
  LightLogo: GeminiLogo,
  auth,
  actions: [createChatCompletion, generateVariables],
  docsUrl: "https://docs.typebot.io/editor/blocks/integrations/gemini",
});

