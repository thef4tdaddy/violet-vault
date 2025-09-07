import { lazy } from "react";
import logger from "../common/logger";

const lazyImport = (factory) =>
  lazy(() =>
    factory().then((module) => {
      const Component = module.default || module;
      if (typeof Component !== "function" && typeof Component !== "object") {
        logger.error("Invalid lazy component", { module });
        return { default: () => null };
      }
      return { default: Component };
    })
  );

export default lazyImport;
