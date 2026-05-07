import "./dashboard-card.js";
import "./dashboard-modal.js";

const smartDashboardStylesheetUrl = new URL("../styles/components/smart-dashboard.css", import.meta.url).href;

const smartDashboardTemplate = document.createElement("template");
smartDashboardTemplate.innerHTML = `
  <link rel="stylesheet" data-style="smart-dashboard" />

  <section class="shell">
    <header class="toolbar">
      <div>
        <h2 class="title" data-ref="title">Smart Dashboard</h2>
        <p class="meta" data-ref="meta">0 cards</p>
      </div>
      <button type="button" data-action="add">Add</button>
    </header>

    <section class="grid" data-ref="grid"></section>
    <p class="empty">No cards available. Click "Add" to create one.</p>
  </section>

  <dashboard-modal></dashboard-modal>
`;

export class SmartDashboard extends HTMLElement {
  static get observedAttributes() {
    return ["title"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(smartDashboardTemplate.content.cloneNode(true));
    const styleLink = this.shadowRoot.querySelector("[data-style='smart-dashboard']");
    if (styleLink) {
      styleLink.href = smartDashboardStylesheetUrl;
    }

    this._cards = new Map();
    this._grid = this.shadowRoot.querySelector("[data-ref='grid']");
    this._title = this.shadowRoot.querySelector("[data-ref='title']");
    this._meta = this.shadowRoot.querySelector("[data-ref='meta']");
    this._modal = this.shadowRoot.querySelector("dashboard-modal");
    this._onClick = this._onClick.bind(this);
    this._onCardAction = this._onCardAction.bind(this);
    this._onModalSubmit = this._onModalSubmit.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("click", this._onClick);
    this.shadowRoot.addEventListener("dashboard-card:action", this._onCardAction);
    this.shadowRoot.addEventListener("dashboard-modal:submit", this._onModalSubmit);
    const title = this.getAttribute("title");
    if (title) {
      this._title.textContent = title;
    }
    this._seedFromAttribute();
    this._syncState("init", null);
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("click", this._onClick);
    this.shadowRoot.removeEventListener("dashboard-card:action", this._onCardAction);
    this.shadowRoot.removeEventListener("dashboard-modal:submit", this._onModalSubmit);
  }

  attributeChangedCallback(name, _oldValue, value) {
    if (name === "title" && this.isConnected) {
      this._title.textContent = value || "Smart Dashboard";
    }
  }

  addCard(data) {
    const card = this._normalizeCard(data);
    this._cards.set(card.id, card);
    this._grid.append(this._createCardElement(card));
    this._emitCardEvent("dashboard-card-added", card);
    this._syncState("add", card);
    return card;
  }

  updateCard(cardId, updates) {
    const id = String(cardId || "").trim();
    const current = this._cards.get(id);
    if (!current) {
      return false;
    }
    const updated = this._normalizeCard({ ...current, ...updates, id });
    this._cards.set(id, updated);
    const el = this._grid.querySelector(`dashboard-card[card-id='${CSS.escape(id)}']`);
    if (el) {
      el.data = updated;
    }
    this._emitCardEvent("dashboard-card-updated", updated);
    this._syncState("update", updated);
    return true;
  }

  removeCard(cardId) {
    const id = String(cardId || "").trim();
    const existing = this._cards.get(id);
    if (!existing) {
      return false;
    }
    this._cards.delete(id);
    const el = this._grid.querySelector(`dashboard-card[card-id='${CSS.escape(id)}']`);
    if (el) {
      el.remove();
    }
    this._emitCardEvent("dashboard-card-removed", existing);
    this._syncState("remove", existing);
    return true;
  }

  getCardsData() {
    return Array.from(this._cards.values()).map((item) => ({ ...item }));
  }

  openAddModal() {
    this._modal.open({ footer: `Created at ${new Date().toLocaleTimeString()}` }, "add");
  }

  openEditModal(cardId) {
    const id = String(cardId || "").trim();
    const card = this._cards.get(id);
    if (!card) {
      return false;
    }
    this._modal.open(card, "edit");
    return true;
  }

  _onClick(event) {
    const button = event.target.closest("button[data-action='add']");
    if (button) {
      this.openAddModal();
    }
  }

  _onCardAction(event) {
    const action = String(event.detail?.action || "").trim();
    const cardId = String(event.detail?.cardId || "").trim();
    if (!action || !cardId) {
      return;
    }
    if (action === "delete") {
      this.removeCard(cardId);
    }
    if (action === "edit") {
      this.openEditModal(cardId);
    }

    this.dispatchEvent(
      new CustomEvent("dashboard-action", {
        bubbles: true,
        composed: true,
        detail: {
          action,
          cardId,
          card: this._cards.get(cardId) || null,
          cards: this.getCardsData(),
        },
      })
    );
  }

  _onModalSubmit(event) {
    const mode = event.detail?.mode;
    const card = event.detail?.card;
    if (!card) {
      return;
    }
    if (mode === "edit" && card.id) {
      this.updateCard(card.id, card);
    } else {
      this.addCard(card);
    }
  }

  _createCardElement(card) {
    const el = document.createElement("dashboard-card");
    el.data = card;
    return el;
  }

  _normalizeCard(payload = {}) {
    const id = String(payload.id || "").trim() || `card-${Math.random().toString(36).slice(2, 10)}`;
    const title = String(payload.title || "").trim() || "Untitled Card";
    return {
      id,
      title,
      subtitle: String(payload.subtitle || "").trim(),
      content: String(payload.content || "").trim(),
      footer: String(payload.footer || "").trim(),
    };
  }

  _seedFromAttribute() {
    const raw = this.getAttribute("data-cards");
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }
      parsed.forEach((item) => this.addCard(item));
    } catch {
      // Ignore malformed cards payload.
    }
  }

  _syncState(action, changedCard) {
    const count = this._cards.size;
    this._meta.textContent = `${count} card${count === 1 ? "" : "s"}`;
    if (count === 0) {
      this.setAttribute("empty", "");
    } else {
      this.removeAttribute("empty");
    }
    this.dispatchEvent(
      new CustomEvent("dashboard-updated", {
        bubbles: true,
        composed: true,
        detail: {
          action,
          changedCard,
          count,
          cards: this.getCardsData(),
        },
      })
    );
  }

  _emitCardEvent(name, card) {
    this.dispatchEvent(
      new CustomEvent(name, {
        bubbles: true,
        composed: true,
        detail: { card },
      })
    );
  }
}

if (!customElements.get("smart-dashboard")) {
  customElements.define("smart-dashboard", SmartDashboard);
}
