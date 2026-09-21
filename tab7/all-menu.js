const allMenu = document.querySelector(".all-menu-layer");
const allMenuOpenButton = document.querySelector(".all-menu-open");
const allMenuCloseButton = document.querySelector(".all-menu-close");

const openAllMenu = () => {
  allMenu?.classList.add("is-open");
  allMenu?.setAttribute("aria-hidden", "false");
  document.body.classList.add("is-menu-open");
  allMenuCloseButton?.focus();
};

const closeAllMenu = () => {
  document.dispatchEvent(new CustomEvent("allmenu:closing"));
  allMenu?.classList.remove("is-open");
  allMenu?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-menu-open");
  allMenuOpenButton?.focus();
};

allMenuOpenButton?.addEventListener("click", openAllMenu);
allMenuCloseButton?.addEventListener("click", closeAllMenu);

allMenu?.addEventListener("click", (event) => {
  if (event.target === allMenu) closeAllMenu();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (document.querySelector(".font-setting-popup.is-open")) return;
  if (allMenu?.classList.contains("is-open")) closeAllMenu();
});
