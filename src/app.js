import "./components/smart-dashboard.js";

const dashboard = document.getElementById("main-dashboard");

if (dashboard) {
	// Register listeners so status updates when cards are manipulated
	dashboard.addEventListener("dashboard-updated", (event) => {
		const detail = event.detail || {};
		console.log(`Action: ${detail.action || "init"} | Total cards: ${detail.count ?? 0}`);
	});

	dashboard.addEventListener("dashboard-action", (event) => {
		const detail = event.detail || {};
		const action = detail.action || "unknown";
		const cardTitle = detail.card?.title || "Unnamed card";
		const importance = detail.importance ? ` (${detail.importance})` : "";
		console.log(`Card action: ${action}${importance} on "${cardTitle}"`);
	});

	const seedCards = [
		{
			title: "Prezentare proiect",
			subtitle: "Framework design",
			content: "acum",
			footer: "proiect final",
		},
		{
			title: "Puscultia",
			subtitle: "",
			content: "-1 leu",
			footer: "",
		},
		{
			title: "Rezervare baschet la terenuri",
			subtitle: "",
			content: "maine la 3",
			footer: "",
		},
	];

	seedCards.forEach((card) => {
		dashboard.addCard(card);
	});
}

