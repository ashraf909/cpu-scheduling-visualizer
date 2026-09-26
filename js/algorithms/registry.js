// OWNER: Member 3 - list of all algorithms so the UI can call them by key.
// options: { quantum, priorityOrder } - each algorithm reads only what it needs.

const ALGORITHMS = {
  fcfs: { name: "FCFS (Non-Preemptive)", short: "FCFS", run: (procs) => fcfs(procs) },
  sjf: { name: "SJF (Non-Preemptive)", short: "SJF", run: (procs) => sjf(procs) },
  priority: { name: "Priority (Non-Preemptive)", short: "Priority", run: (procs, options) => priorityScheduling(procs, options.priorityOrder) },
  rr: { name: "Round Robin (Preemptive)", short: "Round Robin", run: (procs, options) => roundRobin(procs, options.quantum) }
};
