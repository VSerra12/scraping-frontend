import { useState, useRef } from "react";

export function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  function handleMouseEnter() {
    const rect = ref.current.getBoundingClientRect();
    const mitad = rect.left + rect.width / 2;
    const cercaDelBorde = mitad > window.innerWidth * 0.75;
    setVisible(cercaDelBorde ? "right" : "center");
  }

  return (
    <div
      ref={ref}
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 6px)",
          ...(visible === "right"
            ? { right: 0 }
            : { left: "50%", transform: "translateX(-50%)" }
          ),
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          color: "#f0ede8",
          fontSize: "0.75rem",
          padding: "0.35rem 0.65rem",
          borderRadius: "6px",
          whiteSpace: "nowrap",
          zIndex: 999,
          pointerEvents: "none",
        }}>
          {text}
        </div>
      )}
    </div>
  );
}