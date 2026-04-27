import { createRoot } from "react-dom/client";
import { StartClient } from "@tanstack/react-router-server";
import { router } from "./router";

const rootElement = document.getElementById("root");

if (rootElement && !rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(<StartClient router={router} />);
}
