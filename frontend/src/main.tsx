import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ExpenseRefreshProvider } from "./context/ExpenseRefreshContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ExpenseRefreshProvider>
      <App />
    </ExpenseRefreshProvider>
  </React.StrictMode>
);
