/*====================
  Dark js
 ======================*/
const darkSwitch = document.querySelector("#dark-switch");
const bodyDom = document.querySelector("body");
const initialDarkCheck = localStorage.getItem("layout_version");
if (darkSwitch) {
  if (initialDarkCheck === "dark") darkSwitch.checked = true;
}
darkSwitch?.addEventListener("change", (e) => {
  const checkbox = e.target;
  if (checkbox.checked) {
    bodyDom.classList.add("dark");
    localStorage.setItem("layout_version", "dark");
  }

  if (!checkbox.checked) {
    bodyDom.classList.remove("dark");
    localStorage.removeItem("layout_version");
  }
});

if (localStorage.getItem("layout_version") == "dark") {
  bodyDom.classList.add("dark");
}
