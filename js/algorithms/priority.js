// OWNER: Member 3 - Priority scheduling (non-preemptive).
// Idea: whenever the CPU is free, run the arrived process with the best priority.
// order: "low"  -> lower priority number runs first (lower number = higher priority)
// order: "high" -> higher priority number runs first (higher number = higher priority)

function priorityScheduling(processes, order = "low") {
  const procs = processes.map(p => ({ ...p }));
  const n = procs.length;
  const done = new Array(n).fill(false);

  let time = 0, completed = 0, idleTime = 0;
  const gantt = [];
  const results = [];

  while (completed < n) {
    let idx = -1;
    for (let i = 0; i < n; i++) {
      if (done[i] || procs[i].arrivalTime > time) continue;
      const better = order === "high"
        ? procs[i].priority > procs[idx]?.priority
        : procs[i].priority < procs[idx]?.priority;
      if (
        idx === -1 ||
        better ||
        (procs[i].priority === procs[idx].priority && procs[i].arrivalTime < procs[idx].arrivalTime)
      ) {
        idx = i;
      }
    }

    if (idx === -1) {
      const nextArrival = Math.min(
        ...procs.filter((p, i) => !done[i]).map(p => p.arrivalTime)
      );
      idleTime += nextArrival - time;
      time = nextArrival;
      continue;
    }

    const p = procs[idx];
    const start = time;
    time += p.burstTime;
    gantt.push({ id: p.id, start, end: time });

    const completionTime = time;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    results.push({ ...p, completionTime, turnaroundTime, waitingTime });

    done[idx] = true;
    completed++;
  }

  return finalizeResult(results, gantt, idleTime);
}
