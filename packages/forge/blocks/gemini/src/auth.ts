import { createAuth, option } from "@typebot.io/forge";

export const auth = createAuth({
  type: "encryptedCredentials",
  name: "Google Gemini account",
  schema: option.object({
    apiKey: option.string.layout({
      label: "API key",
      isRequired: true,
      inputType: "password",
      helperText:
        "You can generate an API key [here](https://aistudio.google.com/app/apikey).",
      placeholder: "AIza...",
      withVariableButton: false,
      isDebounceDisabled: true,
    }),
  }),
});

