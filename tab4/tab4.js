/* 전체메뉴: 열기/닫기, 배경 비활성화, 초점 이동과 순환 */
const allMenu = {
  init() {
    this.main = document.querySelector(".page-content");
    this.backdrop = document.querySelector(".js-all-menu-layer");
    this.popup = document.querySelector(".js-all-menu-popup");
    this.title = document.getElementById("all-menu-title");
    this.openButton = document.querySelector(".js-all-menu-open");
    this.closeButton = document.querySelector(".js-all-menu-close");
    this.settingsModal = document.getElementById("modal_adjust_display");
    this.lastFocused = this.openButton;

    this.openButton.addEventListener("click", () => this.open());
    this.closeButton.addEventListener("click", () => this.close());
    this.backdrop.addEventListener("click", (event) => {
      if (event.target === this.backdrop) this.close();
    });
    document.addEventListener("keydown", (event) => this.onKeydown(event));

    // 예제는 전체메뉴가 열린 상태로 시작합니다.
    this.setOpenState(true);
    this.title.focus();
  },

  open() {
    this.lastFocused = document.activeElement;
    this.backdrop.hidden = false;
    this.title.focus();
    this.setOpenState(true);
  },

  close() {
    this.backdrop.hidden = true;
    this.setOpenState(false);
    (this.lastFocused?.isConnected ? this.lastFocused : this.openButton).focus();
  },

  setOpenState(open) {
    this.main.inert = open;
    if (open) this.main.setAttribute("aria-hidden", "true");
    else this.main.removeAttribute("aria-hidden");
    this.openButton.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("is-site-menu-open", open);
  },

  onKeydown(event) {
    if (this.backdrop.hidden || this.isSettingsOpen()) return;
    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
    }
    if (event.key === "Tab") this.keepFocus(event);
  },

  isSettingsOpen() {
    return this.settingsModal.classList.contains("shown") ||
      this.settingsModal.classList.contains("show");
  },

  keepFocus(event) {
    const selector = "button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex='-1'])";
    const items = [...this.popup.querySelectorAll(selector)]
      .filter((item) => !item.hidden && item.getClientRects().length);
    const first = items[0];
    const last = items.at(-1);
    const active = document.activeElement;

    if (!first || !last) return;
    if (!this.popup.contains(active)) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && (active === first || active === this.title)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  },
};

/* 2단계 하위메뉴: 버튼 상태와 실제 표시 상태를 함께 변경 */
const submenuAccordion = {
  init() {
    this.animations = new WeakMap();
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    document.querySelectorAll(".js-submenu-button").forEach((button) => {
      button.addEventListener("click", () => this.toggle(button));
    });
  },

  toggle(button) {
    const submenu = document.getElementById(button.getAttribute("aria-controls"));
    const willOpen = button.getAttribute("aria-expanded") !== "true";
    const currentHeight = submenu.hidden ? 0 : submenu.getBoundingClientRect().height;
    const currentOpacity = submenu.hidden ? 0 : Number(getComputedStyle(submenu).opacity);

    this.animations.get(submenu)?.cancel();
    button.setAttribute("aria-expanded", String(willOpen));

    if (willOpen) {
      submenu.hidden = false;
      submenu.inert = false;
    } else {
      submenu.inert = true;
    }

    const animation = submenu.animate(
      [
        { height: `${currentHeight}px`, opacity: currentOpacity },
        { height: `${willOpen ? submenu.scrollHeight : 0}px`, opacity: willOpen ? 1 : 0 },
      ],
      {
        duration: this.reduceMotion.matches ? 0 : 240,
        easing: willOpen ? "ease-out" : "ease-in",
        fill: "forwards",
      },
    );

    this.animations.set(submenu, animation);
    animation.finished.then(() => {
      if (this.animations.get(submenu) !== animation) return;
      this.animations.delete(submenu);
      if (!willOpen) submenu.hidden = true;
      animation.cancel();
    }).catch(() => {
      // 빠르게 연속 클릭해 이전 애니메이션이 취소된 경우입니다.
    });
  },
};

/* KRDS 글자·화면 설정: 크기와 화면 모드를 저장하고 적용 */
const displaySettings = {
  init() {
    this.root = document.documentElement;
    this.scaleOptions = [...document.querySelectorAll('input[name="scale_level"]')];
    this.modeOptions = [...document.querySelectorAll('input[name="view_mode"]')];
    this.colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    this.levels = new Set(["small", "medium", "large", "xlarge", "xxlarge"]);
    this.modes = new Set(["light", "high-contrast", "theme"]);

    this.applyScale(this.getStored("displayScaleLevel") || "medium", false);
    this.applyMode(this.getStored("displayMode") || "light", false);

    this.scaleOptions.forEach((option) => {
      option.addEventListener("change", () => this.applyScale(option.value));
    });
    this.modeOptions.forEach((option) => {
      option.addEventListener("change", () => this.applyMode(option.value));
    });
    document.getElementById("reset_display").addEventListener("click", () => this.reset());
    this.colorScheme.addEventListener("change", () => {
      if (this.root.dataset.krdsMode === "theme") this.setSystemTheme();
    });
  },

  applyScale(level, save = true) {
    const safeLevel = this.levels.has(level) ? level : "medium";
    const fallback = { small: "0.9", medium: "1", large: "1.1", xlarge: "1.2", xxlarge: "1.3" };
    const krdsValue = getComputedStyle(this.root)
      .getPropertyValue(`--krds-zoom-${safeLevel}`)
      .trim();

    document.body.style.zoom = krdsValue || fallback[safeLevel];
    this.scaleOptions.forEach((option) => {
      option.checked = option.value === safeLevel;
    });
    if (save) this.setStored("displayScaleLevel", safeLevel);
  },

  applyMode(mode, save = true) {
    const safeMode = this.modes.has(mode) ? mode : "light";

    this.root.dataset.krdsMode = safeMode;
    this.modeOptions.forEach((option) => {
      option.checked = option.value === safeMode;
    });
    if (safeMode === "theme") this.setSystemTheme();
    else delete this.root.dataset.krdsTheme;
    if (save) this.setStored("displayMode", safeMode);
  },

  setSystemTheme() {
    this.root.dataset.krdsTheme = this.colorScheme.matches ? "dark" : "light";
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
      // 저장소가 차단되어도 현재 화면에는 설정을 적용합니다.
    }
  },
};

document.addEventListener("DOMContentLoaded", () => {
  submenuAccordion.init();
  displaySettings.init();
  allMenu.init();
});
