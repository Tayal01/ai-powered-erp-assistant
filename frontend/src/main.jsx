import React from "react";
import ReactDOM from "react-dom/client";
import { MotionConfig } from "framer-motion";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Toaster
      containerClassName="pointer-events-auto"
      gutter={14}
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        className: "wfx-toast",
        duration: 3800,
        style: {
          borderRadius: "20px",
          background: "rgba(255,255,255,0.88)",
          color: "#13242a",
          border: "1px solid rgba(203, 213, 225, 0.72)",
          boxShadow: "0 18px 48px rgba(15, 23, 42, 0.12)",
          backdropFilter: "blur(18px)",
          padding: "14px 16px",
          maxWidth: "380px",
        },
        success: {
          iconTheme: {
            primary: "#4b8b69",
            secondary: "#f8fafc",
          },
        },
        error: {
          iconTheme: {
            primary: "#d0634a",
            secondary: "#f8fafc",
          },
          duration: 4200,
        },
      }}
    />
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </React.StrictMode>,
);
