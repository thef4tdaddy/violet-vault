import { lazy, ComponentType } from "react";
import logger from "../common/logger";

const lazyImport = <T extends ComponentType<unknown>>(factory: () => Promise<{ default: T } | T>) =>
  lazy(() =>
    factory().then((module) => {
      const Component = (module as { default: T }).default || (module as T);
      if (typeof Component !== "function" && typeof Component !== "object") {
        logger.error("Invalid lazy component", { module });
        return { default: (() => null) as T };
      }
      return { default: Component };
    })
  );

export default lazyImport;
