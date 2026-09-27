// OWNER: Member 1 - shows the results: process table, summary tiles, and the fade-in of the output area.

function renderResultsTable(tableEl, results) {
  let html = `<tr>
    <th>Process</th><th>Arrival</th><th>Burst</th><th>Completion</th>
    <th>Turnaround</th><th>Waiting</th>
  </tr>`;
  results.forEach((r, i) => {
    html += `<tr style="animation-delay:${(i + 1) * 0.05}s">
      <td>${r.id}</td><td>${r.arrivalTime}</td><td>${r.burstTime}</td>
      <td>${r.completionTime}</td><td>${r.turnaroundTime}</td><td>${r.waitingTime}</td>
    </tr>`;
  });
  tableEl.innerHTML = html;
}

function renderSummary(container, result) {
  container.innerHTML = `
    <div><strong>${result.avgWaitingTime.toFixed(2)}</strong>Average Waiting Time</div>
    <div><strong>${result.avgTurnaroundTime.toFixed(2)}</strong>Average Turnaround Time</div>
    <div><strong>${result.idleTime}</strong>Total CPU Idle Time</div>
    <div><strong>${result.totalTime}</strong>Total Time</div>
    <div><strong>${result.cpuUtilization.toFixed(2)}%</strong>CPU Utilization</div>
  `;
}

// Gives every process its own colour so P1 looks the same in every chart
function buildColorMap(processes) {
  const map = {};
  processes.forEach((p, i) => { map[p.id] = colorForIndex(i); });
  return map;
}

function revealOutput(el) {
  el.classList.remove("hidden");
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
}

function hideOutput(el) {
  el.classList.add("hidden");
  el.classList.remove("show");
}
