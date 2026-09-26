// OWNER: Member 3 - startup: tabs, remembering the user's inputs (localStorage), first page load.
// This file must be loaded LAST because it uses functions from every other file.

// ---------- Saved state ----------
function saveState() {
  const moduleState = (prefix) => ({
    count: $(`${prefix}-count`).value,
    quantum: $(`${prefix}-quantum`).value,
    order: $(`${prefix}-priority-order`).value,
    rows: readRawRows($(`${prefix}-input-table`))
  });
  safeSet(STORAGE_KEY, JSON.stringify({
    tab: document.querySelector(".tab-panel.active").id,
    m1: { ...moduleState("m1"), algo: $("m1-algo").value },
    m2: {
      ...moduleState("m2"),
      algos: Array.from(document.querySelectorAll(".m2-algo-check:checked")).map(c => c.value)
    }
  }));
}

function loadState() {
  try { return JSON.parse(safeGet(STORAGE_KEY) || "null"); } catch (e) { return null; }
}

function initModule(prefix, saved) {
  let rows = null;
  if (saved) {
    if (["low", "high"].includes(saved.order)) $(`${prefix}-priority-order`).value = saved.order;
    if (saved.quantum !== undefined) $(`${prefix}-quantum`).value = saved.quantum;
    if (Array.isArray(saved.rows) && saved.rows.length >= 1 && saved.rows.length <= MAX_PROCESSES &&
        saved.rows.every(r => Array.isArray(r) && r.length === 3)) {
      rows = saved.rows;
    }
  }
  const count = rows ? rows.length : (parseInt($(`${prefix}-count`).value, 10) || 4);
  $(`${prefix}-count`).value = count;
  buildInputTable($(`${prefix}-input-table`), count, rows);
}

// ---------- Tabs ----------
function activateTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tabId));
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === tabId));
  if (pb.result) {
    pbStopTimer();
    pbRender();
  }
  saveState();
}

document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => activateTab(btn.dataset.tab));
});

// ---------- Startup ----------
(function init() {
  const saved = loadState();
  initModule("m1", saved && saved.m1);
  initModule("m2", saved && saved.m2);

  if (saved && saved.m1 && ["fcfs", "sjf", "priority", "rr"].includes(saved.m1.algo)) {
    $("m1-algo").value = saved.m1.algo;
  }
  if (saved && saved.m2 && Array.isArray(saved.m2.algos)) {
    document.querySelectorAll(".m2-algo-check").forEach(cb => { cb.checked = saved.m2.algos.includes(cb.value); });
  }

  refreshControls("m1");
  refreshControls("m2");
  applyTheme(document.documentElement.getAttribute("data-theme") || "light");

  if (saved && saved.tab === "module2") activateTab("module2");

  document.addEventListener("input", saveState);
  document.addEventListener("change", saveState);
})();
