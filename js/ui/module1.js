// OWNER: Member 1 - Module 1 (single algorithm): what happens when you press "Run".

wireModule("m1");
$("m1-algo").addEventListener("change", () => { refreshControls("m1"); clearErrors("m1"); });

$("m1-run").addEventListener("click", () => {
  const algoKey = $("m1-algo").value;
  const { processes, quantum, errors } = validateInputs("m1", algoKey === "priority", algoKey === "rr");

  if (errors.length) {
    showErrors("m1", errors);
    hideOutput($("m1-output"));
    return;
  }
  clearErrors("m1");

  const priorityOrder = $("m1-priority-order").value;
  const result = ALGORITHMS[algoKey].run(processes, { quantum, priorityOrder });
  const colorMap = buildColorMap(processes);

  renderGantt($("m1-gantt"), result.gantt, colorMap);
  setupPlayback(result, colorMap);
  renderResultsTable($("m1-results"), result.results);
  renderSummary($("m1-summary"), result);

  revealOutput($("m1-output"));
  saveState();
});
