import { prompt } from "enquirer";

export const askDestination = async (config: { message: string }) => {
  const response = await prompt<{ destination: string }>({
    type: "input",
    name: "destination",
    message: config.message,
    initial: process.cwd(),
    validate: (value) => {
      if (!value || value.trim() === "") {
        return "Destination path is required";
      }

      return true;
    },
  });

  return response.destination;
};
