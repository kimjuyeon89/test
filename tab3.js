/* =========================================================
 * 전체메뉴 팝업
 * - 열기/닫기
 * - 바깥 영역 및 ESC 키로 닫기
 * - 키보드 포커스를 팝업 내부에 유지
 * ======================================================= */
const allMenu = {
  init() {
    // 전체메뉴 팝업에서 사용할 요소
    this.backdrop = document.querySelector(".all-menu-backdrop");
    this.popup = document.querySelector(".all-menu-popup");
    this.openButton = document.querySelector(".all-menu-open");
    this.closeButton = document.querySelector(".all-menu-close");
    this.lastFocused = this.openButton;

    // 열기·닫기 버튼
    this.openButton.addEventListener("click", () => this.open());
    this.closeButton.addEventListener("click", () => this.close());

    // 어두운 배경 영역을 누르면 전체메뉴 닫기
    this.backdrop.addEventListener("click", (event) => {
      if (event.target === this.backdrop) this.close();
    });

    // 글자·화면 설정 모달이 열렸을 때는 전체메뉴 키보드 제어를 중지
    document.addEventListener("keydown", (event) => {
      if (this.backdrop.hidden) return;
      if (document.getElementById("modal_adjust_display")?.classList.contains("shown")) return;
      if (event.key === "Escape") this.close();
      if (event.key === "Tab") this.keepFocus(event);
    });

    // 예제 화면은 전체메뉴가 열린 상태로 시작
    document.body.classList.add("all-menu-opened");
    this.closeButton.focus();
  },

  open() {
    // 닫은 뒤 원래 버튼으로 돌아가기 위해 현재 초점을 기억
    this.lastFocused = document.activeElement;
    this.backdrop.hidden = false;
    document.body.classList.add("all-menu-opened");
    this.closeButton.focus();
  },

  close() {
    this.backdrop.hidden = true;
    document.body.classList.remove("all-menu-opened");
    // 팝업을 열었던 요소로 키보드 초점 복귀
    this.lastFocused?.focus();
  },

  keepFocus(event) {
    // 현재 화면에 보이는 버튼과 링크만 수집
    const items = [...this.popup.querySelectorAll("button, a[href], [tabindex]")]
      .filter((item) => item.tabIndex >= 0 && item.getClientRects().length);
    const first = items[0];
    const last = items[items.length - 1];

    // 첫 요소에서 Shift+Tab을 누르면 마지막 요소로 이동
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    // 마지막 요소에서 Tab을 누르면 첫 요소로 이동
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  },
};

/* =========================================================
 * 글자·화면 표시 설정
 * - KRDS의 5단계 화면 배율 적용
 * - 밝은 화면/선명한 화면/시스템 설정 적용
 * - 사용자의 선택을 localStorage에 저장
 * ======================================================= */
const displaySettings = {
  init() {
    // 설정에 필요한 라디오 버튼과 시스템 다크모드 정보
    this.root = document.documentElement;
    this.scaleOptions = document.querySelectorAll('input[name="scale_level"]');
    this.modeOptions = document.querySelectorAll('input[name="view_mode"]');
    this.resetButton = document.getElementById("reset_display");
    this.colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

    // 이전 방문에서 저장한 설정 불러오기
    const savedScale = this.getStored("displayScale");
    const savedMode = this.getStored("displayMode") || "light";

    if (savedScale) {
      this.applyScale(savedScale, false);
      this.checkSavedScale(savedScale);
    }
    this.applyMode(savedMode, false);

    // 글자·화면 크기 변경
    this.scaleOptions.forEach((option) => {
      option.addEventListener("change", () => {
        this.applyScale(this.getScaleValue(option.value));
      });
    });

    // 화면 표시 모드 변경
    this.modeOptions.forEach((option) => {
      option.addEventListener("change", () => this.applyMode(option.value));
    });

    // 초기화 버튼 및 운영체제 화면 모드 변경 감지
    this.resetButton.addEventListener("click", () => this.reset());
    this.colorScheme.addEventListener("change", () => {
      if (this.root.dataset.krdsMode === "theme") this.setSystemTheme();
    });
  },

  getScaleValue(level) {
    // KRDS CSS 변수에서 각 단계의 확대 비율을 가져옴
    const value = getComputedStyle(this.root)
      .getPropertyValue(`--krds-zoom-${level}`)
      .trim();
    // CDN 변수 확인이 어려운 환경에서 사용할 기본값
    const fallback = { small: "0.9", medium: "1", large: "1.1", xlarge: "1.2", xxlarge: "1.3" };

    return value || fallback[level];
  },

  checkSavedScale(savedScale) {
    // 저장된 배율과 일치하는 라디오 버튼 선택
    this.scaleOptions.forEach((option) => {
      option.checked = this.getScaleValue(option.value) === savedScale;
    });
  },

  applyScale(scale, save = true) {
    // KRDS와 동일하게 body의 zoom 값으로 화면 크기 조정
    document.body.style.zoom = scale;
    if (save) this.setStored("displayScale", scale);
  },

  applyMode(mode, save = true) {
    // 예상하지 못한 값은 기본 밝은 화면으로 처리
    const validMode = ["light", "high-contrast", "theme"].includes(mode) ? mode : "light";

    // KRDS CSS가 인식하는 data-krds-mode 속성 설정
    this.root.dataset.krdsMode = validMode;
    this.modeOptions.forEach((option) => {
      option.checked = option.value === validMode;
    });

    // 시스템 설정이면 운영체제의 다크모드 여부도 전달
    if (validMode === "theme") this.setSystemTheme();
    else delete this.root.dataset.krdsTheme;

    if (save) this.setStored("displayMode", validMode);
  },

  setSystemTheme() {
    // 운영체제 설정을 KRDS의 light/dark 테마 값으로 변환
    this.root.dataset.krdsTheme = this.colorScheme.matches ? "dark" : "light";
  },

  reset() {
    // 기본값: 보통 크기 + 밝은 화면
    document.getElementById("scale_level_medium").checked = true;
    document.getElementById("view_mode_light").checked = true;
    this.applyScale("1");
    this.applyMode("light");
  },

  getStored(key) {
    // 사생활 보호 모드 등 저장소 접근이 차단된 환경에 대응
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
      // 저장소를 사용할 수 없는 환경에서도 현재 설정은 적용합니다.
    }
  },
};

/* =========================================================
 * 2단계 하위메뉴 아코디언
 * - aria-expanded와 hidden 속성을 함께 변경
 * ======================================================= */
const submenuAccordion = {
  init() {
    document.querySelectorAll(".submenu-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const submenu = document.getElementById(button.getAttribute("aria-controls"));
        const expanded = button.getAttribute("aria-expanded") === "true";

        button.setAttribute("aria-expanded", String(!expanded));
        submenu.hidden = expanded;
      });
    });
  },
};

// HTML이 준비된 후 프로젝트 전용 기능 초기화
document.addEventListener("DOMContentLoaded", () => {
  allMenu.init();
  submenuAccordion.init();
  displaySettings.init();
});
