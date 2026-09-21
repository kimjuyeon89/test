const allMenu = document.querySelector(".all-menu-layer");
const allMenuOpenButton = document.querySelector(".all-menu-open");
const allMenuCloseButton = document.querySelector(".all-menu-close");

const toggleAllMenu = (isOpen) => {
  allMenu?.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("is-menu-open", isOpen);
  allMenu?.setAttribute("aria-hidden", String(!isOpen));
  if (!isOpen) document.dispatchEvent(new CustomEvent("allmenu:closing"));
};

allMenuOpenButton?.addEventListener("click", () => toggleAllMenu(true));
allMenuCloseButton?.addEventListener("click", () => toggleAllMenu(false));

allMenu?.addEventListener("click", (event) => {
  if (event.target === allMenu) toggleAllMenu(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !document.querySelector(".font-setting-popup.is-open")) {
    toggleAllMenu(false);
  }
});
