// OWNER: Member 3 - Shortest Job First (non-preemptive).
// Idea: whenever the CPU is free, run the arrived process with the smallest burst time.

function sjf(processes) {
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
      if (
        idx === -1 ||
        procs[i].burstTime < procs[idx].burstTime ||
        (procs[i].burstTime === procs[idx].burstTime && procs[i].arrivalTime < procs[idx].arrivalTime)
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
