import { prompt } from "enquirer";

export const askConfirm = async (config: { message: string }) => {
  const response = await prompt<{ confirm: boolean }>({
    type: "confirm",
    name: "confirm",
    message: config.message,
  });

  return response.confirm;
};
