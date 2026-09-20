const krdsTab = {
  init() {
    document.querySelectorAll(".krds-tab-area.layer").forEach((tabArea) => {
      this.setupTabArea(tabArea);
    });
  },

  setupTabArea(tabArea) {
    const tabs = [
      ...tabArea.querySelectorAll(".tab > ul > li[role='tab']"),
    ];

    tabs.forEach((tab, index) => {
      const button = tab.querySelector(".btn-tab");

      button.addEventListener("click", () => this.selectTab(tabArea, tab));
      button.addEventListener("keydown", (event) => {
        let targetIndex = null;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          targetIndex = (index + 1) % tabs.length;
        }
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          targetIndex = (index - 1 + tabs.length) % tabs.length;
        }
        if (event.key === "Home") targetIndex = 0;
        if (event.key === "End") targetIndex = tabs.length - 1;

        if (targetIndex !== null) {
          event.preventDefault();
          tabs[targetIndex].querySelector(".btn-tab").focus();
        }
      });
    });
  },

  selectTab(tabArea, selectedTab) {
    const tabs = tabArea.querySelectorAll(".tab > ul > li[role='tab']");
    const panels = tabArea.querySelectorAll(
      ":scope > .tab-conts-wrap > .tab-conts",
    );
    const panelId = selectedTab.getAttribute("aria-controls");

    tabs.forEach((tab) => {
      const isSelected = tab === selectedTab;
      tab.classList.toggle("active", isSelected);
      tab.setAttribute("aria-selected", String(isSelected));
      tab.querySelector(".selected-text")?.remove();

      if (isSelected) {
        const text = document.createElement("i");
        text.className = "sr-only selected-text";
        text.textContent = " 선택됨";
        tab.querySelector(".btn-tab").append(text);
      }
    });

    panels.forEach((panel) => {
      const isSelected = panel.id === panelId;
      panel.classList.toggle("active", isSelected);
      panel.hidden = !isSelected;
    });
  },
};

const menuPopup = {
  scaleIndex: 0,
  scaleValues: ["62.5%", "68.75%", "75%"],
  lastFocusedElement: null,

  init() {
    this.backdrop = document.querySelector(".popup-backdrop");
    this.popup = document.querySelector(".menu-popup");
    this.openButton = document.querySelector(".popup-open-button");
    this.closeButton = document.querySelector(".popup-close-button");
    this.fontSizeButton = document.querySelector(".font-size-button");

    this.openButton.addEventListener("click", () => this.open());
    this.closeButton.addEventListener("click", () => this.close());
    this.fontSizeButton.addEventListener("click", () => this.changeFontSize());

    this.backdrop.addEventListener("click", (event) => {
      if (event.target === this.backdrop) this.close();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !this.backdrop.hidden) this.close();
      if (event.key === "Tab" && !this.backdrop.hidden) this.trapFocus(event);
    });

    document.body.classList.add("popup-is-open");
  },

  open() {
    this.lastFocusedElement = document.activeElement;
    this.backdrop.hidden = false;
    document.body.classList.add("popup-is-open");
    this.closeButton.focus();
  },

  close() {
    this.backdrop.hidden = true;
    document.body.classList.remove("popup-is-open");
    this.lastFocusedElement?.focus();
  },

  changeFontSize() {
    this.scaleIndex = (this.scaleIndex + 1) % this.scaleValues.length;
    document.documentElement.style.fontSize = this.scaleValues[this.scaleIndex];

    const labels = ["기본", "크게", "가장 크게"];
    this.fontSizeButton.textContent = `글씨 크기 조절: ${labels[this.scaleIndex]}`;
  },

  trapFocus(event) {
    const focusable = [
      ...this.popup.querySelectorAll(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((element) => !element.closest("[hidden]"));

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  },
};

const submenuAccordion = {
  init() {
    document.querySelectorAll(".submenu-toggle").forEach((button) => {
      button.addEventListener("click", () => this.toggle(button));
    });
  },

  toggle(button) {
    const submenuId = button.getAttribute("aria-controls");
    const submenu = document.getElementById(submenuId);
    const willOpen = button.getAttribute("aria-expanded") !== "true";

    button.setAttribute("aria-expanded", String(willOpen));
    submenu.hidden = !willOpen;
  },
};

document.addEventListener("DOMContentLoaded", () => {
  krdsTab.init();
  menuPopup.init();
  submenuAccordion.init();
});
