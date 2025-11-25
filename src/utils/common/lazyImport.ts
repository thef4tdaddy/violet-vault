import { lazy, ComponentType } from "react";
import logger from "../common/logger";

interface ModuleWithDefault {
  default?: ComponentType<unknown> | unknown;
  [key: string]: unknown;
}

const lazyImport = <T extends ComponentType<unknown>>(factory: () => Promise<ModuleWithDefault>) =>
  lazy(() =>
    factory().then((module: ModuleWithDefault) => {
      const Component = module.default || module;
      if (typeof Component !== "function" && typeof Component !== "object") {
        logger.error("Invalid lazy component", { module });
        return { default: () => null };
      }
      return { default: Component as T };
    })
  );

export default lazyImport;
