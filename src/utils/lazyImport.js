import { lazy } from "react";

const lazyImport = (factory) =>
  lazy(() =>
    factory().then((module) => {
      const Component = module.default || module;
      if (typeof Component !== "function" && typeof Component !== "object") {
        console.error("Invalid lazy component", module);
        return { default: () => null };
      }
      return { default: Component };
    })
  );

export default lazyImport;
