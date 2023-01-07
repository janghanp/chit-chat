import ReactDOM from "react-dom/client";
import App from "./components/App";
import { BrowserRouter, createBrowserRouter } from "react-router-dom";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
