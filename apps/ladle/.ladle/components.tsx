import type { GlobalProvider } from "@ladle/react";
import "@tailgrid/react/themes/default.css";

export const Provider: GlobalProvider = ({ children, globalState }) => {
  // Apply dark mode class based on Ladle's theme state
  const isDark = globalState.theme === "dark";

  return (
    <div className={isDark ? "tailgrid-dark" : ""} style={{ padding: "1rem" }}>
      {children}
    </div>
  );
};
