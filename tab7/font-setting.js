const fontSettingControl = document.querySelector(".font-setting-control");
const fontSettingButton = document.querySelector(".font-setting-button");
const fontSettingPopup = document.querySelector(".font-setting-popup");
const fontSettingCloseButton = document.querySelector(".font-setting-close");
const fontSizeInputs = [...document.querySelectorAll('input[name="scale_level"]')];
const fontScaleClasses = fontSizeInputs.map((input) => `font-scale-${input.value}`);

const closeFontSetting = (restoreFocus = true) => {
  fontSettingPopup?.classList.remove("is-open");
  fontSettingPopup?.setAttribute("aria-hidden", "true");
  fontSettingButton?.setAttribute("aria-expanded", "false");
  if (restoreFocus) fontSettingButton?.focus();
};

const openFontSetting = () => {
  fontSettingPopup?.classList.add("is-open");
  fontSettingPopup?.setAttribute("aria-hidden", "false");
  fontSettingButton?.setAttribute("aria-expanded", "true");
  fontSizeInputs.find((input) => input.checked)?.focus();
};

const setFontScale = (value) => {
  document.documentElement.classList.remove(...fontScaleClasses);
  document.documentElement.classList.add(`font-scale-${value}`);
};

fontSettingButton?.addEventListener("click", () => {
  const isOpen = fontSettingPopup?.classList.contains("is-open");
  if (isOpen) closeFontSetting();
  else openFontSetting();
});

fontSettingCloseButton?.addEventListener("click", () => closeFontSetting());

fontSizeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) setFontScale(input.value);
  });
});

const checkedFontSize = fontSizeInputs.find((input) => input.checked);
if (checkedFontSize) setFontScale(checkedFontSize.value);

document.addEventListener("click", (event) => {
  if (!fontSettingPopup?.classList.contains("is-open")) return;
  if (!fontSettingControl?.contains(event.target)) closeFontSetting(false);
});

document.addEventListener("allmenu:closing", () => closeFontSetting(false));

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (fontSettingPopup?.classList.contains("is-open")) closeFontSetting();
});
