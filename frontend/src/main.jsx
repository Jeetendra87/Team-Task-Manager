import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: "10px", fontSize: "14px" },
          success: { iconTheme: { primary: "#16a34a", secondary: "white" } },
          error: { iconTheme: { primary: "#e11d48", secondary: "white" } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
