import { VALID_ACTIONS } from "@ooneex/routing";
import { prompt } from "enquirer";
import { AssertRouteAction } from "../constraints/AssertRouteAction";

export const askRouteAction = async (config: { message: string; initial?: string }) => {
  const response = await prompt<{ action: string }>({
    type: "autocomplete",
    name: "action",
    message: config.message,
    initial: config.initial,
    choices: VALID_ACTIONS.map((action) => action),
    validate: (value) => {
      const constraint = new AssertRouteAction();
      const result = constraint.validate(value);

      if (!result.isValid) {
        return result.message || "Route action is invalid";
      }

      return true;
    },
  });

  return response.action;
};
