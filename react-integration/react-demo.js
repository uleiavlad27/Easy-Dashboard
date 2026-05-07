import React, { useEffect, useRef, useState } from "https://esm.sh/react@18";
import { createRoot } from "https://esm.sh/react-dom@18/client";
import "../src/components/smart-dashboard.js";

function ReactDashboardDemo() {
  const dashboardRef = useRef(null);

  useEffect(() => {
    const el = dashboardRef.current;
    if (!el) {
      return undefined;
    }

    const seed = [
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

    if (el.getCardsData().length === 0) {
      seed.forEach((card) => el.addCard(card));
    }

    const onUpdated = (event) => {
      const detail = event.detail || {};
      console.log(`Updated: ${detail.action || "init"} | cards: ${detail.count ?? 0}`);
    };

    const onAction = (event) => {
      const detail = event.detail || {};
      console.log(`Action: ${detail.action || "unknown"}`);
    };

    el.addEventListener("dashboard-updated", onUpdated);
    el.addEventListener("dashboard-action", onAction);

    return () => {
      el.removeEventListener("dashboard-updated", onUpdated);
      el.removeEventListener("dashboard-action", onAction);
    };
  }, []);

  return React.createElement(
    "section",
    { style: { display: "grid", gap: "0.75rem" } },
    React.createElement("smart-dashboard", {
      ref: dashboardRef,
      title: "Overview",
    })
  );
}

const rootElement = document.getElementById("app");
if (rootElement) {
  createRoot(rootElement).render(React.createElement(ReactDashboardDemo));
}
