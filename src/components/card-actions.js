const cardActionsStylesheetUrl = new URL("../styles/components/card-actions.css", import.meta.url).href;

const cardActionsTemplate = document.createElement("template");
cardActionsTemplate.innerHTML = `
  <link rel="stylesheet" data-style="card-actions" />

  <div class="actions" part="actions">
    <button type="button" class="menu-toggle" data-role="menu-toggle" aria-label="More actions" aria-expanded="false">☰</button>

    <div class="menu" data-role="menu" hidden>
      <button type="button" data-action="edit">Edit Card</button>
      <button type="button" class="danger" data-action="delete">Delete Card</button>
      <button type="button" data-role="pin-action" data-action="pin">Pin Card</button>
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
    this._menu = this.shadowRoot.querySelector("[data-role='menu']");
    this._menuToggle = this.shadowRoot.querySelector("[data-role='menu-toggle']");
    this._pinAction = this.shadowRoot.querySelector("[data-role='pin-action']");
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("click", this._onClick);
    document.addEventListener("click", this._onDocumentClick);
    this._syncPinAction();
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("click", this._onClick);
    document.removeEventListener("click", this._onDocumentClick);
  }

  _onClick(event) {
    const toggle = event.target.closest("[data-role='menu-toggle']");
    if (toggle) {
      this._syncPinAction();
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
    const menu = this._menu;
    const toggle = this._menuToggle;
    if (!menu || !toggle) {
      return;
    }

    const isOpen = !menu.hidden;
    menu.hidden = isOpen;
    toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");
  }

  _closeMenu() {
    const menu = this._menu;
    const toggle = this._menuToggle;
    if (!menu || !toggle) {
      return;
    }

    menu.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
  }

  _syncPinAction() {
    const pinAction = this._pinAction;
    if (!pinAction) {
      return;
    }

    const host = this.getRootNode()?.host;
    const isPinned = Boolean(host?.hasAttribute("pinned"));
    pinAction.dataset.action = isPinned ? "unpin" : "pin";
    pinAction.textContent = isPinned ? "Unpin Card" : "Pin Card";
  }
}

if (!customElements.get("card-actions")) {
  customElements.define("card-actions", CardActions);
}
