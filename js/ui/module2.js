// OWNER: Member 2 - Module 2 (comparison): runs the selected algorithms, then shows
// a Gantt chart + table per algorithm, the comparison table, the verdict text and two charts.

let m2Chart = null;
let m2Chart2 = null;

wireModule("m2");
document.querySelectorAll(".m2-algo-check").forEach(cb => {
  cb.addEventListener("change", () => { refreshControls("m2"); clearErrors("m2"); });
});

// ---------- Charts (Chart.js) ----------
function chartColors() {
  const cs = getComputedStyle(document.documentElement);
  return { grid: cs.getPropertyValue("--chart-grid").trim(), tick: cs.getPropertyValue("--chart-tick").trim() };
}

function baseChartOptions() {
  const c = chartColors();
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)}` } }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: c.grid },
        ticks: { color: c.tick },
        title: { display: true, text: "Time units", color: c.tick }
      },
      x: { grid: { display: false }, ticks: { color: c.tick } }
    }
  };
}

// Re-colours an existing chart (used when switching between light and dark mode)
function styleChart(chart) {
  if (!chart) return;
  const c = chartColors();
  chart.options.scales.y.grid.color = c.grid;
  chart.options.scales.y.ticks.color = c.tick;
  chart.options.scales.y.title.color = c.tick;
  chart.options.scales.x.ticks.color = c.tick;
  chart.update("none");
}

function renderM2Charts(comparisons) {
  if (m2Chart) m2Chart.destroy();
  if (m2Chart2) m2Chart2.destroy();

  m2Chart = new Chart($("m2-chart"), {
    type: "bar",
    data: {
      labels: comparisons.map(c => c.short),
      datasets: [
        { label: "Avg Waiting Time", data: comparisons.map(c => c.result.avgWaitingTime), backgroundColor: "#2563eb", borderRadius: 4, maxBarThickness: 40 },
        { label: "Avg Turnaround Time", data: comparisons.map(c => c.result.avgTurnaroundTime), backgroundColor: "#d97706", borderRadius: 4, maxBarThickness: 40 }
      ]
    },
    options: baseChartOptions()
  });

  $("m2-chart2-legend").innerHTML = comparisons.map(c =>
    `<span><span class="legend-swatch" style="background:${ALGO_COLORS[c.key]}"></span>${c.short}</span>`).join("");

  m2Chart2 = new Chart($("m2-chart2"), {
    type: "bar",
    data: {
      labels: comparisons[0].result.results.map(r => r.id),
      datasets: comparisons.map(c => ({
        label: c.short,
        data: c.result.results.map(r => r.waitingTime),
        backgroundColor: ALGO_COLORS[c.key],
        borderRadius: 4,
        maxBarThickness: 32
      }))
    },
    options: baseChartOptions()
  });
}

// ---------- Verdict text ----------
function joinNames(arr) {
  return arr.length <= 1 ? (arr[0] || "") : arr.slice(0, -1).join(", ") + " and " + arr[arr.length - 1];
}

function buildVerdict(comparisons) {
  const eps = 1e-9;
  const items = [];

  const metricLine = (metric, label) => {
    const vals = comparisons.map(c => c.result[metric]);
    const best = Math.min(...vals);
    const worst = Math.max(...vals);
    if (worst - best < eps) {
      return `All selected algorithms give the same ${label} (${best.toFixed(2)}) for this data.`;
    }
    const bestNames = comparisons.filter(c => c.result[metric] - best < eps).map(c => c.short);
    const worstNames = comparisons.filter(c => worst - c.result[metric] < eps).map(c => c.short);
    const pct = ((worst - best) / worst) * 100;
    return `Lowest ${label}: <strong>${joinNames(bestNames)}</strong> (${best.toFixed(2)}). ` +
      `Highest: ${joinNames(worstNames)} (${worst.toFixed(2)}), so ${joinNames(bestNames)} ` +
      `${bestNames.length > 1 ? "are" : "is"} ${pct.toFixed(1)}% lower.`;
  };

  items.push(metricLine("avgWaitingTime", "average waiting time"));
  items.push(metricLine("avgTurnaroundTime", "average turnaround time"));

  const utils = comparisons.map(c => c.result.cpuUtilization);
  if (Math.max(...utils) - Math.min(...utils) < eps) {
    const r = comparisons[0].result;
    items.push(`CPU utilization is ${r.cpuUtilization.toFixed(2)}% for every algorithm: they all finish at time ${r.totalTime} ` +
      `with ${r.idleTime} idle time units. Scheduling order changes waiting and turnaround time, not how busy the CPU is.` +
      (r.idleTime > 0 ? " The idle time comes from gaps where no process had arrived yet." : ""));
  } else {
    items.push("CPU utilization: " + comparisons.map(c => `${c.short} ${c.result.cpuUtilization.toFixed(2)}%`).join(", ") + ".");
  }

  const keys = comparisons.map(c => c.key);
  const notes = [];
  if (keys.includes("sjf")) notes.push("SJF gives the lowest average waiting time among the non-preemptive algorithms, but long processes can be starved.");
  if (keys.includes("rr")) notes.push("Round Robin usually has a higher average waiting time, but every process gets CPU time regularly, which helps responsiveness.");
  if (keys.includes("priority")) notes.push("Priority results depend on the priority values you entered; low-priority processes may wait a long time (starvation).");

  return `<h3>Which algorithm is better for this data?</h3><ul>` +
    items.map(t => `<li>${t}</li>`).join("") +
    notes.map(t => `<li class="note">${t}</li>`).join("") + `</ul>`;
}

// ---------- Compare button ----------
$("m2-run").addEventListener("click", () => {
  const selected = Array.from(document.querySelectorAll(".m2-algo-check:checked")).map(c => c.value);
  const { processes, quantum, errors } = validateInputs("m2", selected.includes("priority"), selected.includes("rr"));

  if (selected.length < 2) errors.unshift({ el: null, msg: "Select at least two algorithms to compare." });
  if (errors.length) {
    showErrors("m2", errors);
    hideOutput($("m2-output"));
    return;
  }
  clearErrors("m2");

  const priorityOrder = $("m2-priority-order").value;
  const colorMap = buildColorMap(processes);
  const container = $("m2-results-container");
  container.innerHTML = "";

  const comparisons = selected.map(key => {
    const result = ALGORITHMS[key].run(processes, { quantum, priorityOrder });
    return { key, name: ALGORITHMS[key].name, short: ALGORITHMS[key].short, result };
  });

  comparisons.forEach(c => {
    const card = document.createElement("div");
    card.className = "algo-card card";
    card.innerHTML = `<h3>${c.name}</h3>
      <div class="gantt"></div>
      <div class="table-scroll"><table class="results-table"></table></div>
      <div class="summary"></div>`;
    container.appendChild(card);

    renderGantt(card.querySelector(".gantt"), c.result.gantt, colorMap);
    renderResultsTable(card.querySelector("table"), c.result.results);
    renderSummary(card.querySelector(".summary"), c.result);
  });

  const bestWaiting = Math.min(...comparisons.map(c => c.result.avgWaitingTime));
  let summaryHtml = `<tr>
    <th>Algorithm</th><th>Avg Waiting Time</th><th>Avg Turnaround Time</th><th>Total Idle Time</th><th>CPU Utilization</th>
  </tr>`;
  comparisons.forEach(c => {
    const isBest = c.result.avgWaitingTime - bestWaiting < 1e-9;
    summaryHtml += `<tr${isBest ? ' class="best-row"' : ""}>
      <td>${c.name}${isBest ? " (best)" : ""}</td>
      <td>${c.result.avgWaitingTime.toFixed(2)}</td>
      <td>${c.result.avgTurnaroundTime.toFixed(2)}</td>
      <td>${c.result.idleTime}</td>
      <td>${c.result.cpuUtilization.toFixed(2)}%</td>
    </tr>`;
  });
  $("m2-summary-table").innerHTML = summaryHtml;
  $("m2-verdict").innerHTML = buildVerdict(comparisons);

  renderM2Charts(comparisons);
  revealOutput($("m2-output"));
  saveState();
});
