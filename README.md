# Smart Dashboard Web Component

A simple dashboard component set you can drop into a project without adding a framework.

## Features

- **Native Web Components:** `smart-dashboard`, `dashboard-card`, `dashboard-modal`, and `card-actions`
- **Strict style isolation:** each component uses Shadow DOM
- **Flexible card content:** cards expose named slots (`title`, `subtitle`, `content`, `footer`)
- **Interactive card controls:** `Edit` and `Delete` actions on hover
- **Event-driven communication:** child-to-parent bubbling via Custom Events
- **Dynamic card lifecycle:** add, update, remove, and inspect card state programmatically
- **Theme-ready design:** customize colors, spacing, and radius via CSS variables
- **Framework agnostic:** can run in plain HTML/JS or inside React

## Requirements

- **Browser:** modern browser with Custom Elements v1 and Shadow DOM support
- **Live Server (recommended):** for quick local testing of demos

## Installation

This project is currently local-first (no npm package publish flow in this repo).

Use the component directly from source:

```html
<script type="module" src="./src/components/smart-dashboard.js"></script>
```

## Usage

### 1) Import the component

```js
import "./src/components/smart-dashboard.js";
```

### 2) Add the tag to HTML

```html
<smart-dashboard id="dashboard" title="Overview"></smart-dashboard>
```

### 3) Add cards dynamically

```js
const dashboard = document.getElementById("dashboard");

dashboard.addCard({
  title: "Release Health",
  subtitle: "Engineering",
  content: "2 blockers pending validation",
  footer: "Updated 2 min ago",
});
```

Notes:
- This project demonstrates the programmatic API: use `addCard()` to create and manage cards.

### 4) Listen to events

```js
dashboard.addEventListener("dashboard-action", (event) => {
  console.log("Action:", event.detail.action, "Card:", event.detail.cardId);
});

dashboard.addEventListener("dashboard-updated", (event) => {
  console.log("Cards:", event.detail.count);
});
```

## Running the Demos

### Native demo (plain Web Components)

1. Open `index.html` with Live Server.
2. Use UI controls to add cards and test actions.
3. Inspect console for emitted events.

### React demo (separate integration)

1. Open `react-integration/index.html` with Live Server.
2. This page loads React from CDN and mounts `<smart-dashboard>`.
3. Interaction is done via element refs + DOM events.

## API Reference

### Component: `smart-dashboard`

#### Attributes

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `title` | String | `"Interactive Dashboard"` | Header title |
| `data-cards` | String (JSON) | `""` | Initial cards payload |

#### Methods

| Method | Description |
| --- | --- |
| `addCard(cardData)` | Adds a new card and returns normalized data |
| `updateCard(cardId, updates)` | Updates an existing card |
| `removeCard(cardId)` | Removes a card by ID |
| `getCardsData()` | Returns all cards as plain objects |

#### Card Data Shape

```js
{
  id: "optional-id",
  title: "Required title",
  subtitle: "Optional subtitle",
  content: "Optional content",
  footer: "Optional footer",
}
```

Normalization:
- Missing `id` -> generated automatically
- Empty `title` -> `"Untitled Card"`

## Events

| Event Name | Detail | Description |
| --- | --- | --- |
| `dashboard-updated` | `{ action, changedCard, count, cards }` | Fired after state changes |
| `dashboard-action` | `{ action, cardId, card, cards }` | Fired for user actions (`add`, `edit`, `delete`) |
| `dashboard-card-added` | `{ card }` | Fired when a card is created |
| `dashboard-card-updated` | `{ card }` | Fired when a card is updated |
| `dashboard-card-removed` | `{ card }` | Fired when a card is removed |

Internal bubbling events:
- `card-actions:action`
- `dashboard-card:action`

## Theming

Customize the dashboard via CSS variables:

```css
smart-dashboard {
  --dg-font-family: "Segoe UI", Tahoma, sans-serif;
  --dg-surface-bg: #ffffff;
  --dg-surface-border-color: #dbe4ee;
  --dg-color-text: #0f172a;
  --dg-color-muted: #475569;
  --dg-card-bg: #ffffff;
  --dg-card-border-color: #dbe4ee;
  --dg-actions-bg: #ffffff;
  --dg-actions-border-color: #cbd5e1;
  --dg-actions-hover-bg: #f8fafc;
  --dg-panel-radius: 18px;
  --dg-card-radius: 14px;
  --dg-grid-gap: 1rem;
  --dg-grid-columns: repeat(auto-fit, minmax(240px, 1fr));
}
```

## Software Design Notes

- **Modular structure:** each component has a clear responsibility
- **Reusable by design:** same core works in native pages and React hosts
- **Decoupled communication:** events instead of direct parent-child dependencies
- **Maintainable styling:** isolated component styles + shared variable contract

## Project Structure

```text
src/
  app.js
  components/
    smart-dashboard.js
    dashboard-card.js
    dashboard-modal.js
    card-actions.js
  styles/
    dashboard-theme.css
    components/
      smart-dashboard.css
      dashboard-card.css
      dashboard-modal.css
      card-actions.css
react-integration/
  index.html
  react-demo.js
  SmartDashboard.jsx
  DashboardReactExample.jsx
index.html
README.md
```
