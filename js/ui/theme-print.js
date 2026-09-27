// OWNER: Member 2 - dark / light mode toggle and the Print / Save PDF button.

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  safeSet(THEME_KEY, theme);
  $("theme-toggle").textContent = theme === "dark" ? "Light mode" : "Dark mode";
  styleChart(m2Chart);
  styleChart(m2Chart2);
}

$("theme-toggle").addEventListener("click", () => {
  applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
});

$("print-btn").addEventListener("click", () => window.print());
