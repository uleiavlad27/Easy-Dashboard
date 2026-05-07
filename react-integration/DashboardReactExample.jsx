import { useRef, useState } from "react";
import { SmartDashboard } from "./SmartDashboard";

const seededCards = [
  {
    title: "Tema",
    subtitle: "Acasa",
    content: "mate",
    footer: "romana",
  },
  {
    title: "of",
    subtitle: "of",
    content: "of",
    footer: "of",
  },
];

export default function DashboardReactExample() {
  const dashboardRef = useRef(null);
  const [logLine, setLogLine] = useState("Dashboard ready.");

  return (
    <section style={{ display: "grid", gap: "0.85rem" }}>
      <SmartDashboard
        ref={dashboardRef}
        title="Dashboard component"
        initialCards={seededCards}
        onDashboardUpdated={(detail) => {
          setLogLine(`Updated: ${detail.action} | cards: ${detail.count}`);
        }}
        onDashboardAction={(detail) => {
          setLogLine(`Action: ${detail.action}`);
        }}
      />

      <p style={{ margin: 0, color: "#334155" }}>{logLine}</p>
    </section>
  );
}
