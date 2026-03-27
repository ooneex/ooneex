import { prompt } from "enquirer";
import { AssertName } from "../constraints/AssertName";

export const askDestination = async (config: { message: string; initial?: string }) => {
  const assertName = new AssertName();

  const response = await prompt<{ destination: string }>({
    type: "input",
    name: "destination",
    message: config.message,
    initial: config.initial || ".",
    validate: (value) => {
      const result = assertName.validate(value);
      if (!result.isValid) {
        return result.message || "Invalid destination";
      }

      return true;
    },
  });

  return response.destination;
};
