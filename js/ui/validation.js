// OWNER: Member 2 - checks the user's input and shows friendly red error messages.
// prefix is "m1" (Module 1) or "m2" (Module 2).

function parseWhole(el, [min, max], label, errors) {
  const s = el.value.trim();
  if (!/^-?\d+$/.test(s)) {
    errors.push({ el, msg: `${label} must be a whole number between ${min} and ${max}.` });
    return null;
  }
  const n = parseInt(s, 10);
  if (n < min || n > max) {
    errors.push({ el, msg: `${label} must be between ${min} and ${max}.` });
    return null;
  }
  return n;
}

// Reads the process table and returns { processes, quantum, errors }.
function validateInputs(prefix, needPriority, needQuantum) {
  const errors = [];
  const processes = [];
  const rows = Array.from($(`${prefix}-input-table`).querySelectorAll("tr")).slice(1);

  rows.forEach((row, i) => {
    const id = `P${i + 1}`;
    const arrival = parseWhole(row.querySelector(".in-arrival"), LIMITS.arrival, `${id} arrival time`, errors);
    const burst = parseWhole(row.querySelector(".in-burst"), LIMITS.burst, `${id} burst time`, errors);
    let priority = 1;
    if (needPriority) {
      priority = parseWhole(row.querySelector(".in-priority"), LIMITS.priority, `${id} priority`, errors);
    }
    processes.push({ id, arrivalTime: arrival, burstTime: burst, priority });
  });

  let quantum = 1;
  if (needQuantum) {
    quantum = parseWhole($(`${prefix}-quantum`), LIMITS.quantum, "Time quantum", errors);
  }
  return { processes, quantum, errors };
}

function showErrors(prefix, errors) {
  const box = $(`${prefix}-errors`);
  const shown = errors.slice(0, 6);
  const more = errors.length - shown.length;
  box.innerHTML = `<strong>Please fix the following:</strong><ul>${shown.map(e => `<li>${esc(e.msg)}</li>`).join("")}${more > 0 ? `<li>...and ${more} more.</li>` : ""}</ul>`;
  box.classList.remove("hidden");
  errors.forEach(e => e.el && e.el.classList.add("invalid"));
  const first = errors.find(e => e.el);
  if (first) first.el.focus();
}

function clearErrors(prefix) {
  const box = $(`${prefix}-errors`);
  box.classList.add("hidden");
  box.innerHTML = "";
  $(prefix === "m1" ? "module1" : "module2").querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
}

// When the user fixes a red box, remove its red state; hide the message once nothing is red.
document.addEventListener("input", (e) => {
  if (!e.target.classList || !e.target.classList.contains("invalid")) return;
  e.target.classList.remove("invalid");
  const section = e.target.closest(".tab-panel");
  if (section && !section.querySelector(".invalid")) {
    clearErrors(section.id === "module1" ? "m1" : "m2");
  }
});
