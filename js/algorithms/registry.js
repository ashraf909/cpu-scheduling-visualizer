// OWNER: Member 3 - list of all algorithms so the UI can call them by key.
// options: { quantum, priorityOrder } - each algorithm reads only what it needs.

const ALGORITHMS = {
  fcfs: {
    name: "FCFS (Non-Preemptive)", short: "FCFS", run: (procs) => fcfs(procs),
    description: "Processes run in the order they arrive. Whichever process arrives first gets the CPU first, and each one runs to completion before the next starts. Simple to implement, but a short process can get stuck waiting behind a long one (the convoy effect)."
  },
  sjf: {
    name: "SJF (Non-Preemptive)", short: "SJF", run: (procs) => sjf(procs),
    description: "Whenever the CPU is free, it picks the arrived process with the smallest burst time next. This gives the lowest possible average waiting time, but a process with a long burst time can wait a very long time if shorter jobs keep arriving (starvation)."
  },
  priority: {
    name: "Priority (Non-Preemptive)", short: "Priority", run: (procs, options) => priorityScheduling(procs, options.priorityOrder),
    description: "Whenever the CPU is free, it picks the arrived process with the best priority value (lower or higher number can mean higher priority, your choice). Important tasks run sooner, but a low-priority process can starve if higher-priority processes keep arriving."
  },
  rr: {
    name: "Round Robin (Preemptive)", short: "Round Robin", run: (procs, options) => roundRobin(procs, options.quantum),
    description: "Every process gets a fixed slice of CPU time called the time quantum, then moves to the back of the queue if it isn't finished yet. This keeps things fair and responsive, but switching between processes too often can raise the average waiting time."
  }
};
