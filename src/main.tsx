import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Auto dark mode based on system preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.classList.toggle('dark', prefersDark);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  document.documentElement.classList.toggle('dark', e.matches);
});

createRoot(document.getElementById("root")!).render(<App />);
