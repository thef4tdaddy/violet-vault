import React, { lazy, ComponentType, ReactElement } from "react";
import logger from "../common/logger";

interface ModuleWithDefault {
  default?: ComponentType<unknown> | unknown;
  [key: string]: unknown;
}

/**
 * Creates a placeholder component that renders null
 * Used as fallback when lazy loading fails
 */
const createPlaceholderComponent = <T extends ComponentType<unknown>>(): T => {
  const PlaceholderComponent: React.FC<unknown> = () => null as ReactElement | null;
  return PlaceholderComponent as T;
};

const lazyImport = <T extends ComponentType<unknown>>(factory: () => Promise<ModuleWithDefault>) =>
  lazy<T>(() =>
    factory().then((module: ModuleWithDefault): { default: T } => {
      const Component = module.default || module;
      if (typeof Component !== "function" && typeof Component !== "object") {
        logger.error("Invalid lazy component", { module });
        // Return a placeholder component when lazy loading fails
        return { default: createPlaceholderComponent<T>() };
      }
      return { default: Component as T };
    })
  );

export default lazyImport;
