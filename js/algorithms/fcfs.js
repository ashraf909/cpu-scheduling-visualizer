// OWNER: Member 1 - First Come First Served (non-preemptive).
// Idea: run processes strictly in the order they arrive.

function fcfs(processes) {
  const procs = processes
    .map(p => ({ ...p }))
    .sort((a, b) => a.arrivalTime - b.arrivalTime);

  let time = 0;
  let idleTime = 0;
  const gantt = [];
  const results = [];

  for (const p of procs) {
    if (time < p.arrivalTime) {
      idleTime += p.arrivalTime - time;
      time = p.arrivalTime;
    }
    const start = time;
    time += p.burstTime;
    gantt.push({ id: p.id, start, end: time });

    const completionTime = time;
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    results.push({ ...p, completionTime, turnaroundTime, waitingTime });
  }

  return finalizeResult(results, gantt, idleTime);
}
