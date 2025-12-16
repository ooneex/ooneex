import { VALID_NAMESPACES } from "@ooneex/routing";
import { prompt } from "enquirer";
import { AssertRouteNamespace } from "../constraints/AssertRouteNamespace";

export const askRouteNamespace = async (config: { message: string; initial?: string }) => {
  const response = await prompt<{ namespace: string }>({
    type: "autocomplete",
    name: "namespace",
    message: config.message,
    initial: config.initial,
    choices: VALID_NAMESPACES.map((namespace) => namespace),
    validate: (value) => {
      const constraint = new AssertRouteNamespace();
      const result = constraint.validate(value);

      if (!result.isValid) {
        return result.message || "Route namespace is invalid";
      }

      return true;
    },
  });

  return response.namespace;
};
