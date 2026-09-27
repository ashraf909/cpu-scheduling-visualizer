// OWNER: Member 1 - shared result calculation used by ALL scheduling algorithms.
// Every algorithm ends with:  return finalizeResult(results, gantt, idleTime);
// Input : results  = one object per process { id, arrivalTime, burstTime, priority,
//                    completionTime, turnaroundTime, waitingTime }
//         rawGantt = list of { id, start, end } in the order the CPU ran them
//         idleTime = total time the CPU had nothing to run
// Output: { gantt, results, avgWaitingTime, avgTurnaroundTime, idleTime, totalTime, cpuUtilization }

// Joins back-to-back slices of the same process into one Gantt block (P1 0-2, P1 2-4 -> P1 0-4)
function mergeAdjacent(gantt) {
  const merged = [];
  gantt.forEach(seg => {
    const last = merged[merged.length - 1];
    if (last && last.id === seg.id && last.end === seg.start) last.end = seg.end;
    else merged.push({ ...seg });
  });
  return merged;
}

function finalizeResult(results, rawGantt, idleTime) {
  const gantt = mergeAdjacent(rawGantt);
  const n = results.length;
  const avgWaitingTime = results.reduce((s, r) => s + r.waitingTime, 0) / n;
  const avgTurnaroundTime = results.reduce((s, r) => s + r.turnaroundTime, 0) / n;
  const sorted = [...results].sort((a, b) =>
    a.id.localeCompare(b.id, undefined, { numeric: true })
  );
  const totalTime = gantt.length ? gantt[gantt.length - 1].end : 0;
  // CPU utilization = busy time / total time, as a percentage
  const cpuUtilization = totalTime > 0 ? ((totalTime - idleTime) / totalTime) * 100 : 0;
  return {
    gantt,
    results: sorted,
    avgWaitingTime,
    avgTurnaroundTime,
    idleTime,
    totalTime,
    cpuUtilization
  };
}
