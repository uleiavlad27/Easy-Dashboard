import { useRef, useState } from "react";
import { SmartDashboard } from "./SmartDashboard";

const seededCards = [
  {
    title: "Pipeline",
    subtitle: "Engineering",
    content: "6 pull requests waiting review.",
    footer: "Sprint 14",
  },
  {
    title: "Incidents",
    subtitle: "SRE",
    content: "2 active incidents, 1 postmortem pending.",
    footer: "Status page synced",
  },
];

export default function DashboardReactExample() {
  const dashboardRef = useRef(null);
  const [logLine, setLogLine] = useState("Ready.");
  const [counter, setCounter] = useState(1);

  const addCard = () => {
    const el = dashboardRef.current;
    if (!el) {
      return;
    }

    el.addCard({
      title: `React Card ${counter}`,
      subtitle: "Demo",
      content: "Added from a React button.",
      footer: `Created at ${new Date().toLocaleTimeString()}`,
    });

    setCounter((value) => value + 1);
  };

  const dumpCards = () => {
    const el = dashboardRef.current;
    if (!el) {
      return;
    }

    const cards = el.getCardsData();
    console.log("React demo cards:", cards);
    setLogLine(`Dumped ${cards.length} cards to console.`);
  };

  return (
    <section style={{ display: "grid", gap: "0.85rem" }}>
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
        <button type="button" onClick={addCard}>
          Add Card
        </button>

        <button type="button" onClick={dumpCards}>
          Dump Data
        </button>
      </div>

      <SmartDashboard
        ref={dashboardRef}
        title="React Operations"
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
