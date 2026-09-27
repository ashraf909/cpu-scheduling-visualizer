// OWNER: Member 1 - the process input table, example presets, Randomize and "Set Processes".
// prefix is "m1" (Module 1) or "m2" (Module 2).

const PRESETS = {
  basic: { label: "Basic (4 processes)", rows: [[0, 4, 1], [1, 5, 2], [2, 6, 3], [3, 4, 4]] },
  idle: { label: "CPU idle gaps (utilization below 100%)", rows: [[0, 3, 2], [8, 4, 1], [9, 2, 3], [15, 3, 1]] },
  same: { label: "All arrive at time 0", rows: [[0, 6, 3], [0, 2, 1], [0, 8, 4], [0, 3, 2]] },
  textbook: { label: "Textbook priority example (5 processes)", rows: [[0, 10, 3], [0, 1, 1], [0, 2, 4], [0, 1, 5], [0, 5, 2]] },
  rr: { label: "Round Robin classic (quantum 4)", rows: [[0, 24, 1], [0, 3, 2], [0, 3, 3]], quantum: 4 }
};

// rows = optional list of [arrival, burst, priority]; missing rows get default values
function buildInputTable(tableEl, count, rows) {
  let html = `<tr><th>Process</th><th>Arrival Time</th><th>Burst Time</th><th class="col-priority">Priority</th></tr>`;
  for (let i = 0; i < count; i++) {
    const r = rows && rows[i] ? rows[i] : [i, 4 + (i % 3), i + 1];
    html += `<tr style="animation-delay:${i * 0.04}s">
      <td>P${i + 1}</td>
      <td><input type="number" step="1" value="${esc(r[0])}" class="in-arrival" aria-label="P${i + 1} arrival time"></td>
      <td><input type="number" step="1" value="${esc(r[1])}" class="in-burst" aria-label="P${i + 1} burst time"></td>
      <td class="col-priority"><input type="number" step="1" value="${esc(r[2])}" class="in-priority" aria-label="P${i + 1} priority"></td>
    </tr>`;
  }
  tableEl.innerHTML = html;
}

function readRawRows(tableEl) {
  return Array.from(tableEl.querySelectorAll("tr")).slice(1).map(row => [
    row.querySelector(".in-arrival").value,
    row.querySelector(".in-burst").value,
    row.querySelector(".in-priority").value
  ]);
}

function togglePriorityColumn(tableEl, show) {
  tableEl.classList.toggle("hide-priority", !show);
}

// Shows the Priority column / Priority Order / Time Quantum only when the chosen algorithm needs them
function setNeeds(prefix, needsPriority, needsRR) {
  togglePriorityColumn($(`${prefix}-input-table`), needsPriority);
  $(`${prefix}-priority-order-group`).classList.toggle("control-hidden", !needsPriority);
  $(`${prefix}-quantum-group`).classList.toggle("control-hidden", !needsRR);
}

function refreshControls(prefix) {
  if (prefix === "m1") {
    const algo = $("m1-algo").value;
    setNeeds("m1", algo === "priority", algo === "rr");
  } else {
    const checked = v => document.querySelector(`.m2-algo-check[value="${v}"]`).checked;
    setNeeds("m2", checked("priority"), checked("rr"));
  }
}

// "Set Processes": change the number of rows but keep the values already typed
function applyCount(prefix) {
  const el = $(`${prefix}-count`);
  const s = el.value.trim();
  clearErrors(prefix);
  if (!/^\d+$/.test(s) || +s < 1 || +s > MAX_PROCESSES) {
    showErrors(prefix, [{ el, msg: `Number of processes must be a whole number between 1 and ${MAX_PROCESSES}.` }]);
    return;
  }
  const table = $(`${prefix}-input-table`);
  buildInputTable(table, +s, readRawRows(table));
  hideOutput($(`${prefix}-output`));
  saveState();
}

function applyPreset(prefix, key) {
  const p = PRESETS[key];
  if (!p) return;
  $(`${prefix}-count`).value = p.rows.length;
  buildInputTable($(`${prefix}-input-table`), p.rows.length, p.rows);
  if (p.quantum) $(`${prefix}-quantum`).value = p.quantum;
  clearErrors(prefix);
  hideOutput($(`${prefix}-output`));
  saveState();
}

function randomize(prefix) {
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const s = $(`${prefix}-count`).value.trim();
  const n = /^\d+$/.test(s) && +s >= 1 && +s <= MAX_PROCESSES ? +s : 4;
  const prios = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) {
    const j = rnd(0, i);
    [prios[i], prios[j]] = [prios[j], prios[i]];
  }
  const rows = prios.map(p => [rnd(0, 8), rnd(1, 9), p]);
  rows[0][0] = 0;
  $(`${prefix}-count`).value = n;
  buildInputTable($(`${prefix}-input-table`), n, rows);
  clearErrors(prefix);
  hideOutput($(`${prefix}-output`));
  saveState();
}

// Connects the example dropdown, Randomize and Set Processes buttons of one module
function wireModule(prefix) {
  const preset = $(`${prefix}-preset`);
  preset.innerHTML = `<option value="">Choose an example...</option>` +
    Object.entries(PRESETS).map(([k, p]) => `<option value="${k}">${esc(p.label)}</option>`).join("");
  const resetPreset = () => { preset.value = ""; };
  preset.addEventListener("change", () => applyPreset(prefix, preset.value));
  $(`${prefix}-input-table`).addEventListener("input", resetPreset);
  $(`${prefix}-random`).addEventListener("click", () => { randomize(prefix); resetPreset(); });
  $(`${prefix}-generate`).addEventListener("click", () => { applyCount(prefix); resetPreset(); });
  $(`${prefix}-count`).addEventListener("change", () => { applyCount(prefix); resetPreset(); });
}
