import { prompt } from "enquirer";

export const askDestination = async (config: { message: string; initial?: string }) => {
  const response = await prompt<{ destination: string }>({
    type: "input",
    name: "destination",
    message: config.message,
    initial: config.initial || ".",
    validate: (value) => {
      if (!value || value.trim() === "") {
        return "Destination path is required";
      }

      return true;
    },
  });

  return response.destination;
};
