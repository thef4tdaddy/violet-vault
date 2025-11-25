import { lazy, ComponentType } from "react";
import logger from "../common/logger";

interface ModuleWithDefault {
  default?: ComponentType<unknown> | unknown;
  [key: string]: unknown;
}

const lazyImport = <T extends ComponentType<unknown>>(factory: () => Promise<ModuleWithDefault>) =>
  lazy<T>(() =>
    factory().then((module: ModuleWithDefault): { default: T } => {
      const Component = module.default || module;
      if (typeof Component !== "function" && typeof Component !== "object") {
        logger.error("Invalid lazy component", { module });
        // Return a placeholder component when lazy loading fails
        const PlaceholderComponent = (() => null) as unknown as T;
        return { default: PlaceholderComponent };
      }
      return { default: Component as T };
    })
  );

export default lazyImport;
