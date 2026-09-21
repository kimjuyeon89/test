/* 클릭, Enter, Space는 button 기본 동작을 사용합니다. */
const tabs = [...document.querySelectorAll('[role="tab"]')];
const panels = [...document.querySelectorAll('[role="tabpanel"]')];

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => {
      const isActive = item === tab;
      item.setAttribute("aria-selected", String(isActive));
      item.closest("li").classList.toggle("is-active", isActive);
    });

    panels.forEach((panel) => {
      const isActive = panel.id === tab.getAttribute("aria-controls");
      panel.classList.toggle("is-active", isActive);
    });
  });
});
