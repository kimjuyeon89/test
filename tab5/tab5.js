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
