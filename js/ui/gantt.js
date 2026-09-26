// OWNER: Member 3 - draws the Gantt chart as coloured blocks (width = time).

function renderGantt(container, gantt, colorMap) {
  container.innerHTML = "";
  const stepDelay = 0.09;
  let cursor = 0;
  let step = 0;
  const delay = () => Math.min(step * stepDelay, 1.2) + "s";

  gantt.forEach(block => {
    if (block.start > cursor) {
      const idleDiv = document.createElement("div");
      idleDiv.className = "gantt-block idle";
      idleDiv.style.width = (block.start - cursor) * PX_PER_UNIT + "px";
      idleDiv.style.animationDelay = delay();
      idleDiv.dataset.start = cursor;
      idleDiv.dataset.end = block.start;
      idleDiv.title = `Idle: ${cursor}–${block.start}`;
      idleDiv.textContent = "idle";
      const label = document.createElement("span");
      label.className = "time-label";
      label.textContent = cursor;
      idleDiv.appendChild(label);
      container.appendChild(idleDiv);
      step++;
    }

    const div = document.createElement("div");
    div.className = "gantt-block";
    div.style.width = Math.max(1, block.end - block.start) * PX_PER_UNIT + "px";
    div.style.background = colorMap[block.id];
    div.style.animationDelay = delay();
    div.dataset.start = block.start;
    div.dataset.end = block.end;
    div.title = `${block.id}: ${block.start}–${block.end}`;
    div.textContent = block.id;
    step++;

    const label = document.createElement("span");
    label.className = "time-label";
    label.textContent = block.start;
    div.appendChild(label);

    container.appendChild(div);
    cursor = block.end;
  });

  const lastBlock = container.lastElementChild;
  if (lastBlock) {
    const endLabel = document.createElement("span");
    endLabel.className = "time-label end";
    endLabel.textContent = cursor;
    lastBlock.appendChild(endLabel);
  }
}
