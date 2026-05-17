import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"

import "@workspace/ui/globals.css"
import "./styles/global.css"
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import AppProvider from "@workspace/flowtrove/components/providers"
import routes from "./pages/routes"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NuqsAdapter>
      <AppProvider>
        <RouterProvider router={routes} />
      </AppProvider>
    </NuqsAdapter>
  </StrictMode>
)
