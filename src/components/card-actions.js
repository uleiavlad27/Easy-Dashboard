const cardActionsStylesheetUrl = new URL("../styles/components/card-actions.css", import.meta.url).href;

const cardActionsTemplate = document.createElement("template");
cardActionsTemplate.innerHTML = `
  <link rel="stylesheet" data-style="card-actions" />

  <div class="actions" part="actions">
    <button type="button" class="quick" data-action="edit">Edit</button>
    <button type="button" class="quick danger" data-action="delete">Delete</button>
    <button type="button" class="menu-toggle" data-role="menu-toggle" aria-label="More actions" aria-expanded="false">☰</button>

    <div class="menu" data-role="menu" hidden>
      <button type="button" data-action="edit">Edit Card</button>
      <button type="button" class="danger" data-action="delete">Delete Card</button>
    </div>
  </div>
`;

export class CardActions extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(cardActionsTemplate.content.cloneNode(true));
    const styleLink = this.shadowRoot.querySelector("[data-style='card-actions']");
    if (styleLink) {
      styleLink.href = cardActionsStylesheetUrl;
    }
    this._onClick = this._onClick.bind(this);
    this._onDocumentClick = this._onDocumentClick.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("click", this._onClick);
    document.addEventListener("click", this._onDocumentClick);
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("click", this._onClick);
    document.removeEventListener("click", this._onDocumentClick);
  }

  _onClick(event) {
    const toggle = event.target.closest("[data-role='menu-toggle']");
    if (toggle) {
      this._toggleMenu();
      return;
    }

    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const action = String(button.dataset.action || "").trim();
    if (!action) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("card-actions:action", {
        bubbles: true,
        composed: true,
        detail: { action },
      })
    );

    this._closeMenu();
  }

  _onDocumentClick(event) {
    if (event.composedPath().includes(this)) {
      return;
    }
    this._closeMenu();
  }

  _toggleMenu() {
    const menu = this.shadowRoot.querySelector("[data-role='menu']");
    const toggle = this.shadowRoot.querySelector("[data-role='menu-toggle']");
    if (!menu || !toggle) {
      return;
    }

    const isOpen = !menu.hidden;
    menu.hidden = isOpen;
    toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
  }

  _closeMenu() {
    const menu = this.shadowRoot.querySelector("[data-role='menu']");
    const toggle = this.shadowRoot.querySelector("[data-role='menu-toggle']");
    if (!menu || !toggle) {
      return;
    }

    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }
}

if (!customElements.get("card-actions")) {
  customElements.define("card-actions", CardActions);
}
