import "./card-actions.js";

const dashboardCardStylesheetUrl = new URL("../styles/components/dashboard-card.css", import.meta.url).href;

const dashboardCardTemplate = document.createElement("template");
dashboardCardTemplate.innerHTML = `
  <link rel="stylesheet" data-style="dashboard-card" />

  <article class="shell" part="card">
    <header>
      <h3 class="title"><slot name="title"></slot></h3>
      <p class="meta"><slot name="subtitle"></slot></p>
    </header>

    <section class="content"><slot name="content"></slot></section>
    <footer class="footer"><slot name="footer"></slot></footer>
  </article>

  <card-actions></card-actions>
`;

export class DashboardCard extends HTMLElement {
  static get observedAttributes() {
    return ["card-id", "title", "subtitle", "content", "footer"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(dashboardCardTemplate.content.cloneNode(true));
    const styleLink = this.shadowRoot.querySelector("[data-style='dashboard-card']");
    if (styleLink) {
      styleLink.href = dashboardCardStylesheetUrl;
    }
    this._actions = this.shadowRoot.querySelector("card-actions");
    this._onAction = this._onAction.bind(this);
    this._showActions = this._showActions.bind(this);
    this._hideActions = this._hideActions.bind(this);
  }

  connectedCallback() {
    if (!this.cardId) {
      this.cardId = `card-${Math.random().toString(36).slice(2, 10)}`;
    }
    this.addEventListener("mouseenter", this._showActions);
    this.addEventListener("mouseleave", this._hideActions);
    this.addEventListener("focusin", this._showActions);
    this.addEventListener("focusout", this._hideActions);
    this._actions.addEventListener("card-actions:action", this._onAction);
    this._render();
  }

  disconnectedCallback() {
    this.removeEventListener("mouseenter", this._showActions);
    this.removeEventListener("mouseleave", this._hideActions);
    this.removeEventListener("focusin", this._showActions);
    this.removeEventListener("focusout", this._hideActions);
    this._actions.removeEventListener("card-actions:action", this._onAction);
  }

  attributeChangedCallback() {
    if (!this.isConnected) {
      return;
    }
    this._render();
  }

  get cardId() {
    return this.getAttribute("card-id") || "";
  }

  set cardId(value) {
    this.setAttribute("card-id", String(value));
  }

  get data() {
    return {
      id: this.cardId,
      title: this.getAttribute("title") || "Untitled Card",
      subtitle: this.getAttribute("subtitle") || "",
      content: this.getAttribute("content") || "",
      footer: this.getAttribute("footer") || "",
    };
  }

  set data(value) {
    const safe = value || {};
    if (safe.id) {
      this.cardId = safe.id;
    }
    this.setAttribute("title", safe.title || "Untitled Card");
    this.setAttribute("subtitle", safe.subtitle || "");
    this.setAttribute("content", safe.content || "");
    this.setAttribute("footer", safe.footer || "");
  }

  _onAction(event) {
    const action = String(event.detail?.action || "").trim();
    if (!action) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("dashboard-card:action", {
        bubbles: true,
        composed: true,
        detail: {
          action,
          cardId: this.cardId,
        },
      })
    );
  }

  _showActions() {
    this._actions.setAttribute("visible", "");
  }

  _hideActions(event) {
    if (event?.type === "focusout" && event.relatedTarget && this.contains(event.relatedTarget)) {
      return;
    }
    this._actions.removeAttribute("visible");
  }

  _render() {
    const data = this.data;
    const fields = this.querySelectorAll("[slot]");
    fields.forEach((node) => node.remove());
    this.append(
      this._slotNode("title", data.title),
      this._slotNode("subtitle", data.subtitle),
      this._slotNode("content", data.content),
      this._slotNode("footer", data.footer)
    );
  }

  _slotNode(slot, text) {
    const node = document.createElement("span");
    node.slot = slot;
    node.textContent = String(text || "");
    return node;
  }
}

if (!customElements.get("dashboard-card")) {
  customElements.define("dashboard-card", DashboardCard);
}
