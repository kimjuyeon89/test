/* 2단계 하위메뉴: 버튼 상태와 실제 표시 상태를 함께 변경 */
const submenuAccordion = {
  init() {
    this.animations = new WeakMap();
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    document.querySelectorAll(".submenu-button").forEach((button) => {
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

document.addEventListener("DOMContentLoaded", () => {
  submenuAccordion.init();
});
