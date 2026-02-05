# Page snapshot

```yaml
- generic [ref=e3]:
    - generic [ref=e4]: '[plugin:vite:import-analysis] Failed to resolve import "@/utils/core/common/queryClient" from "src/main.tsx". Does the file exist?'
    - generic [ref=e5]: /home/runner/work/violet-vault/violet-vault/src/main.tsx:6:24
    - generic [ref=e6]: '4 | import "./index.css"; 5 | import { QueryClientProvider } from "@tanstack/react-query"; 6 | import queryClient from "@/utils/core/common/queryClient"; | ^ 7 | import BugReportingService from "./services/logging/bugReportingService.ts"; 8 | import logger from "@/utils/core/common/logger";'
    - generic [ref=e7]: at TransformPluginContext._formatLog (file:///home/runner/work/violet-vault/violet-vault/node_modules/vite/dist/node/chunks/config.js:28992:43) at TransformPluginContext.error (file:///home/runner/work/violet-vault/violet-vault/node_modules/vite/dist/node/chunks/config.js:28989:14) at normalizeUrl (file:///home/runner/work/violet-vault/violet-vault/node_modules/vite/dist/node/chunks/config.js:27112:18) at process.processTicksAndRejections (node:internal/process/task_queues:103:5) at async file:///home/runner/work/violet-vault/violet-vault/node_modules/vite/dist/node/chunks/config.js:27170:32 at async Promise.all (index 5) at async TransformPluginContext.transform (file:///home/runner/work/violet-vault/violet-vault/node_modules/vite/dist/node/chunks/config.js:27138:4) at async EnvironmentPluginContainer.transform (file:///home/runner/work/violet-vault/violet-vault/node_modules/vite/dist/node/chunks/config.js:28790:14) at async loadAndTransform (file:///home/runner/work/violet-vault/violet-vault/node_modules/vite/dist/node/chunks/config.js:22660:26) at async viteTransformMiddleware (file:///home/runner/work/violet-vault/violet-vault/node_modules/vite/dist/node/chunks/config.js:24532:20)
    - generic [ref=e8]:
        - text: Click outside, press Esc key, or fix the code to dismiss.
        - text: You can also disable this overlay by setting
        - code [ref=e9]: server.hmr.overlay
        - text: to
        - code [ref=e10]: "false"
        - text: in
        - code [ref=e11]: vite.config.js
        - text: .
```
