const dashboardModalStylesheetUrl = new URL("../styles/components/dashboard-modal.css", import.meta.url).href;

const dashboardModalTemplate = document.createElement("template");
dashboardModalTemplate.innerHTML = `
  <link rel="stylesheet" data-style="dashboard-modal" />

  <div class="overlay" data-role="overlay" hidden>
    <button type="button" class="backdrop" data-action="close" aria-label="Close"></button>

    <section class="panel" role="dialog" aria-modal="true" aria-labelledby="dashboard-modal-title">
      <header class="head">
        <h3 id="dashboard-modal-title" class="title" data-field="modal-title">Add Card</h3>
        <button type="button" class="close" data-action="close" aria-label="Close">×</button>
      </header>

      <form data-role="form" novalidate>
        <label>Title<input name="title" maxlength="120" required /></label>
        <label>Subtitle<input name="subtitle" maxlength="120" /></label>
        <label>Content<textarea name="content" maxlength="1000"></textarea></label>
        <label>Footer<input name="footer" maxlength="180" /></label>

        <div class="actions">
          <button type="button" class="btn" data-action="cancel">Cancel</button>
          <button type="submit" class="btn primary" data-field="submit-label">Add</button>
        </div>
      </form>
    </section>
  </div>
`;

export class DashboardModal extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(dashboardModalTemplate.content.cloneNode(true));
    const styleLink = this.shadowRoot.querySelector("[data-style='dashboard-modal']");
    if (styleLink) {
      styleLink.href = dashboardModalStylesheetUrl;
    }

    this._mode = "add";
    this._editingCardId = "";
    this._form = this.shadowRoot.querySelector("[data-role='form']");
    this._overlay = this.shadowRoot.querySelector("[data-role='overlay']");
    this._title = this.shadowRoot.querySelector("[data-field='modal-title']");
    this._submit = this.shadowRoot.querySelector("[data-field='submit-label']");
    this._onClick = this._onClick.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.addEventListener("click", this._onClick);
    this._form.addEventListener("submit", this._onSubmit);
    document.addEventListener("keydown", this._onKeyDown);
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("click", this._onClick);
    this._form.removeEventListener("submit", this._onSubmit);
    document.removeEventListener("keydown", this._onKeyDown);
  }

  open(payload = {}, mode = "add") {
    this._mode = mode === "edit" ? "edit" : "add";
    this._editingCardId = String(payload.id || "");
    this._title.textContent = this._mode === "edit" ? "Edit Card" : "Add Card";
    this._submit.textContent = this._mode === "edit" ? "Save" : "Add";
    this._form.elements.title.value = String(payload.title || "");
    this._form.elements.subtitle.value = String(payload.subtitle || "");
    this._form.elements.content.value = String(payload.content || "");
    this._form.elements.footer.value = String(payload.footer || "");
    this._overlay.hidden = false;
    this.setAttribute("open", "");
    requestAnimationFrame(() => this._form.elements.title.focus());
  }

  close() {
    this._overlay.hidden = true;
    this.removeAttribute("open");
  }

  _onClick(event) {
    const trigger = event.target.closest("[data-action]");
    if (!trigger) {
      return;
    }
    const action = trigger.getAttribute("data-action");
    if (action === "close" || action === "cancel") {
      this.close();
    }
  }

  _onSubmit(event) {
    event.preventDefault();
    const data = new FormData(this._form);
    const card = {
      id: this._mode === "edit" ? this._editingCardId : undefined,
      title: String(data.get("title") || "").trim() || "Untitled Card",
      subtitle: String(data.get("subtitle") || "").trim(),
      content: String(data.get("content") || "").trim(),
      footer: String(data.get("footer") || "").trim(),
    };
    if (!card.id) {
      delete card.id;
    }

    this.dispatchEvent(
      new CustomEvent("dashboard-modal:submit", {
        bubbles: true,
        composed: true,
        detail: { mode: this._mode, card },
      })
    );
    this.close();
  }

  _onKeyDown(event) {
    if (event.key === "Escape" && this.hasAttribute("open")) {
      this.close();
    }
  }
}

if (!customElements.get("dashboard-modal")) {
  customElements.define("dashboard-modal", DashboardModal);
}
