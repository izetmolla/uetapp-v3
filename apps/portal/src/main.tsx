import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@workspace/ui/globals.css"
import "./styles/global.css"
import AppProvider from "@workspace/flowtrove/components/providers"
import routes from "./pages/routes"
import { RouterProvider } from "react-router"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
        <RouterProvider router={routes} />
    </AppProvider>
  </StrictMode>
)
