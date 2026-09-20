/* 전체메뉴 모달: 열기·닫기와 키보드 포커스를 관리합니다. */
const allMenuModal = {
  init() {
    this.layer = document.querySelector(".all-menu-layer");
    this.popup = document.querySelector(".all-menu-popup");
    this.openButton = document.querySelector(".all-menu-open");
    this.closeButton = document.querySelector(".all-menu-close");

    this.openButton.addEventListener("click", () => this.open());
    this.closeButton.addEventListener("click", () => this.close());
    this.layer.addEventListener("click", (event) => {
      if (event.target === this.layer) this.close();
    });

    document.addEventListener("keydown", (event) => {
      if (this.layer.hidden || this.isDisplayModalOpen()) return;
      if (event.key === "Escape") this.close();
      if (event.key === "Tab") this.keepFocus(event);
    });
  },

  open() {
    this.layer.hidden = false;
    this.openButton.inert = true;
    this.openButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("all-menu-opened");
    this.closeButton.focus();
  },

  close() {
    this.layer.hidden = true;
    this.openButton.inert = false;
    this.openButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("all-menu-opened");
    this.openButton.focus();
  },

  isDisplayModalOpen() {
    return document.getElementById("modal_adjust_display").classList.contains("shown");
  },

  keepFocus(event) {
    const focusable = [...this.popup.querySelectorAll("a[href], button, input, [tabindex]")]
      .filter((item) => !item.disabled && item.tabIndex >= 0 && item.getClientRects().length);
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

/* 프로젝트 전용 탭: 클릭, Enter, Space는 button 기본 동작을 사용합니다. */
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.closest("li").classList.toggle("active", selected);
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    });
  });
});

/* 하위메뉴 아코디언: 애니메이션은 CSS가 처리합니다. */
document.querySelectorAll(".submenu-button").forEach((button) => {
  button.addEventListener("click", () => {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
  });
});

/* KRDS 글자·화면 설정: 선택값 적용, 저장, 초기화를 담당합니다. */
const displaySettings = {
  scaleValues: {
    small: "0.9",
    medium: "1",
    large: "1.1",
    xlarge: "1.2",
    xxlarge: "1.3",
  },

  init() {
    this.root = document.documentElement;
    this.scaleOptions = document.querySelectorAll('input[name="scale_level"]');
    this.modeOptions = document.querySelectorAll('input[name="view_mode"]');
    this.systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

    const savedScale = this.getStored("displayScale") || "medium";
    const savedMode = this.getStored("displayMode") || "light";

    this.applyScale(savedScale, false);
    this.applyMode(savedMode, false);

    this.scaleOptions.forEach((option) => {
      option.addEventListener("change", () => this.applyScale(option.value));
    });

    this.modeOptions.forEach((option) => {
      option.addEventListener("change", () => this.applyMode(option.value));
    });

    document.getElementById("reset-display-settings").addEventListener("click", () => this.reset());
    this.systemTheme.addEventListener("change", () => {
      if (this.root.dataset.krdsMode === "theme") this.applySystemTheme();
    });
  },

  applyScale(level, save = true) {
    const validLevel = this.scaleValues[level] ? level : "medium";

    document.body.style.zoom = this.getScaleValue(validLevel);
    this.scaleOptions.forEach((option) => {
      option.checked = option.value === validLevel;
    });

    if (save) this.setStored("displayScale", validLevel);
  },

  getScaleValue(level) {
    const krdsValue = getComputedStyle(this.root).getPropertyValue(`--krds-zoom-${level}`).trim();

    return krdsValue || this.scaleValues[level];
  },

  applyMode(mode, save = true) {
    const validMode = ["light", "high-contrast", "theme"].includes(mode) ? mode : "light";

    this.root.dataset.krdsMode = validMode;
    this.modeOptions.forEach((option) => {
      option.checked = option.value === validMode;
    });

    if (validMode === "theme") this.applySystemTheme();
    else delete this.root.dataset.krdsTheme;

    if (save) this.setStored("displayMode", validMode);
  },

  applySystemTheme() {
    this.root.dataset.krdsTheme = this.systemTheme.matches ? "dark" : "light";
  },

  reset() {
    this.applyScale("medium");
    this.applyMode("light");
  },

  getStored(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setStored(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // 저장소를 사용할 수 없어도 현재 페이지에는 설정을 적용합니다.
    }
  },
};

allMenuModal.init();
displaySettings.init();
