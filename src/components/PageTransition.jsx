import React, { useEffect, useState } from "react";

function PageTransition({ children }) {
  const [stage, setStage] = useState("enter");

  useEffect(() => {
    const t = setTimeout(() => setStage("visible"), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        opacity: stage === "visible" ? 1 : 0,
        transform: stage === "visible" ? "translateY(0px)" : "translateY(18px)",
        transition:
          "opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}

export default PageTransition;
