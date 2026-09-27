// OWNER: Member 2 - Round Robin (preemptive).
// Idea: each process runs for at most one time quantum, then goes to the back of the ready queue.

function roundRobin(processes, quantum) {
  const procs = processes
    .map(p => ({ ...p, remaining: p.burstTime }))
    .sort((a, b) => a.arrivalTime - b.arrivalTime);
  const n = procs.length;

  let time = 0, idleTime = 0, completedCount = 0;
  const gantt = [];
  const queue = [];
  const arrived = new Array(n).fill(false);
  const completionTime = new Array(n).fill(0);

  function enqueueArrivals(uptoTime) {
    for (let i = 0; i < n; i++) {
      if (!arrived[i] && procs[i].arrivalTime <= uptoTime) {
        queue.push(i);
        arrived[i] = true;
      }
    }
  }

  while (completedCount < n) {
    if (queue.length === 0) {
      const nextIdx = procs.findIndex((p, i) => !arrived[i]);
      const nextArrival = procs[nextIdx].arrivalTime;
      if (nextArrival > time) idleTime += nextArrival - time;
      time = Math.max(time, nextArrival);
      enqueueArrivals(time);
      continue;
    }

    const i = queue.shift();
    const p = procs[i];
    const runTime = Math.min(quantum, p.remaining);
    const start = time;
    time += runTime;
    p.remaining -= runTime;

    enqueueArrivals(time); // new arrivals during this slice join before the current one, if it re-enters
    gantt.push({ id: p.id, start, end: time });

    if (p.remaining > 0) {
      queue.push(i);
    } else {
      completionTime[i] = time;
      completedCount++;
    }
  }

  const results = procs.map((p, i) => {
    const completion = completionTime[i];
    const turnaroundTime = completion - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    return {
      id: p.id,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      completionTime: completion,
      turnaroundTime,
      waitingTime
    };
  });

  return finalizeResult(results, gantt, idleTime);
}
