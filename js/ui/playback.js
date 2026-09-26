// OWNER: Member 3 - Play / Step / Reset: replays the schedule one time unit at a time (Module 1).

const pb = { result: null, colorMap: null, completion: {}, playhead: null, t: null, timer: null };

function pbChip(id) {
  return `<span class="chip" style="background:${pb.colorMap[id]}">${id}</span>`;
}

// How many time units process `id` has already run up to time t
function pbExecuted(id, t) {
  let sum = 0;
  pb.result.gantt.forEach(s => {
    if (s.id === id) {
      const e = Math.min(s.end, t) - s.start;
      if (e > 0) sum += e;
    }
  });
  return sum;
}

function pbInterval() {
  return 900 / parseFloat($("pb-speed").value);
}

function pbStopTimer() {
  if (pb.timer) clearInterval(pb.timer);
  pb.timer = null;
}

// Redraws the playback panel and the Gantt chart for the current clock time pb.t
function pbRender() {
  const r = pb.result;
  if (!r) return;
  const total = r.totalTime;
  const t = pb.t;
  const gantt = $("m1-gantt");
  const blocks = gantt.querySelectorAll(".gantt-block");
  $("m1-playback").classList.toggle("pb-idle", t === null);

  const finished = t !== null && t >= total;
  $("pb-play").textContent = pb.timer ? "Pause" : (finished ? "Replay" : "Play");

  if (t === null) {
    blocks.forEach(b => b.classList.remove("pb-future", "pb-active"));
    pb.playhead.style.display = "none";
    $("pb-clock").textContent = "Ready";
    return;
  }

  blocks.forEach(b => {
    const s = +b.dataset.start, e = +b.dataset.end;
    b.classList.toggle("pb-active", s <= t && t < e);
    b.classList.toggle("pb-future", s > t);
  });

  const x = t * PX_PER_UNIT + GANTT_PAD;
  pb.playhead.style.display = "block";
  pb.playhead.style.left = x + "px";
  if (x > gantt.scrollLeft + gantt.clientWidth - 60 || x < gantt.scrollLeft) {
    gantt.scrollTo({ left: Math.max(0, x - gantt.clientWidth / 2), behavior: "smooth" });
  }

  $("pb-clock").textContent = finished ? `Time: ${t} (finished)` : `Time: ${t}`;

  const seg = r.gantt.find(s => s.start <= t && t < s.end);
  if (finished) {
    $("pb-cpu").innerHTML = `<span class="chip muted">All done</span>`;
  } else if (seg) {
    $("pb-cpu").innerHTML = `${pbChip(seg.id)}<span class="pb-note">runs until t = ${seg.end}</span>`;
  } else {
    $("pb-cpu").innerHTML = `<span class="chip muted">Idle</span><span class="pb-note">no process has arrived yet</span>`;
  }

  // Ready queue = arrived, not finished, not running. Ordered by when each one runs next.
  const running = seg ? seg.id : null;
  const ready = r.results
    .filter(p => p.arrivalTime <= t && pb.completion[p.id] > t && p.id !== running)
    .map(p => {
      const next = r.gantt.find(s => s.id === p.id && s.start >= t);
      return { id: p.id, order: next ? next.start : Infinity };
    })
    .sort((a, b) => a.order - b.order);
  $("pb-queue").innerHTML = ready.length ? ready.map(p => pbChip(p.id)).join("") : `<span class="chip muted">empty</span>`;

  const done = r.results.filter(p => pb.completion[p.id] <= t);
  $("pb-done").innerHTML = done.length ? done.map(p => pbChip(p.id)).join("") : `<span class="chip muted">none yet</span>`;

  $("pb-bars").innerHTML = r.results.map(p => {
    const ex = pbExecuted(p.id, t);
    const pct = Math.round((ex / p.burstTime) * 100);
    return `<div class="pb-bar-row"><span>${p.id}</span>
      <div class="pb-track"><div class="pb-fill" style="width:${pct}%;background:${pb.colorMap[p.id]}"></div></div>
      <span class="pb-count">${ex}/${p.burstTime}</span></div>`;
  }).join("");
}

// Called after every Run: prepares the playback for the new result
function setupPlayback(result, colorMap) {
  pbStopTimer();
  pb.result = result;
  pb.colorMap = colorMap;
  pb.t = null;
  pb.completion = {};
  result.results.forEach(r => { pb.completion[r.id] = r.completionTime; });
  const ph = document.createElement("div");
  ph.className = "playhead";
  ph.style.display = "none";
  $("m1-gantt").appendChild(ph);
  pb.playhead = ph;
  pbRender();
}

function pbTick() {
  pb.t++;
  if (pb.t >= pb.result.totalTime) {
    pb.t = pb.result.totalTime;
    pbStopTimer();
  }
  pbRender();
}

$("pb-play").addEventListener("click", () => {
  if (!pb.result) return;
  if (pb.timer) {
    pbStopTimer();
    pbRender();
    return;
  }
  if (pb.t === null || pb.t >= pb.result.totalTime) pb.t = 0;
  pb.timer = setInterval(pbTick, pbInterval());
  pbRender();
});

$("pb-step").addEventListener("click", () => {
  if (!pb.result) return;
  pbStopTimer();
  if (pb.t === null) pb.t = 0;
  else if (pb.t < pb.result.totalTime) pb.t++;
  pbRender();
});

$("pb-reset").addEventListener("click", () => {
  if (!pb.result) return;
  pbStopTimer();
  pb.t = null;
  pbRender();
});

$("pb-speed").addEventListener("change", () => {
  if (pb.timer) {
    clearInterval(pb.timer);
    pb.timer = setInterval(pbTick, pbInterval());
  }
});

// Printing should show the normal, complete Gantt chart
window.addEventListener("beforeprint", () => {
  if (!pb.result) return;
  pbStopTimer();
  pb.t = null;
  pbRender();
});
