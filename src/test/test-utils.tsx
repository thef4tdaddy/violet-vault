import React, { ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "../contexts/AuthContext";
import { createTestQueryClient } from "./queryTestUtils";
import { BrowserRouter } from "react-router-dom";

/**
 * AllProviders - A single wrapper that provides all necessary context providers
 * used by components in the application.
 */
interface AllProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export const AllProviders: React.FC<AllProvidersProps> = ({
  children,
  queryClient = createTestQueryClient(),
}) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

/**
 * Custom render function that wraps the component with AllProviders
 */
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { queryClient?: QueryClient }
) => {
  const { queryClient, ...renderOptions } = options || {};

  return render(ui, {
    wrapper: (props) => <AllProviders {...props} queryClient={queryClient} />,
    ...renderOptions,
  });
};

// Re-export everything from @testing-library/react
export * from "@testing-library/react";

// Override render method
export { customRender as render };

// Re-export common test utilities from queryTestUtils
export {
  createTestQueryClient,
  waitForQueries,
  waitForMutations,
  clearQueryCache,
} from "./queryTestUtils";
