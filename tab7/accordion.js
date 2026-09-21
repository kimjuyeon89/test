/* 애니메이션은 CSS가 처리하고 스크립트는 상태 클래스만 변경합니다. */
document.querySelectorAll(".submenu-button").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    const isOpen = !button.classList.contains("is-active");

    button.classList.toggle("is-active", isOpen);
    button.setAttribute("aria-expanded", String(isOpen));
    panel?.classList.toggle("is-open", isOpen);
  });
});
