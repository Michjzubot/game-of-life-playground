const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const playPauseBtn = document.getElementById('playPause');
const stepBtn = document.getElementById('step');
const clearBtn = document.getElementById('clear');
const randomBtn = document.getElementById('random');
const sizeSlider = document.getElementById('size');
const speedSlider = document.getElementById('speed');
const sizeValue = document.getElementById('sizeValue');
const speedValue = document.getElementById('speedValue');

let rows = parseInt(sizeSlider.value, 10);
let cols = rows;
let cellSize;
let grid = createGrid(rows, cols);
let running = false;
let timer = null;

function resizeCanvas() {
  const dim = Math.min(window.innerWidth - 30, 720);
  canvas.width = dim;
  canvas.height = dim;
  cellSize = canvas.width / cols;
  draw();
}

function createGrid(r, c) {
  return Array.from({ length: r }, () => Array.from({ length: c }, () => 0));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--cell-off');
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--cell');
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c]) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(canvas.width, i * cellSize);
    ctx.stroke();
  }
  for (let j = 0; j <= cols; j++) {
    ctx.beginPath();
    ctx.moveTo(j * cellSize, 0);
    ctx.lineTo(j * cellSize, canvas.height);
    ctx.stroke();
  }
}

function neighborsCount(r, c) {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = (r + dr + rows) % rows;
      const nc = (c + dc + cols) % cols;
      count += grid[nr][nc];
    }
  }
  return count;
}

function nextGen() {
  const next = createGrid(rows, cols);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const n = neighborsCount(r, c);
      const alive = grid[r][c] === 1;
      if (alive && (n === 2 || n === 3)) next[r][c] = 1;
      else if (!alive && n === 3) next[r][c] = 1;
      else next[r][c] = 0;
    }
  }
  grid = next;
  draw();
}

function toggleCell(x, y) {
  const c = Math.floor(x / cellSize);
  const r = Math.floor(y / cellSize);
  if (r >= 0 && r < rows && c >= 0 && c < cols) {
    grid[r][c] = grid[r][c] ? 0 : 1;
    draw();
  }
}

function setRunning(state) {
  running = state;
  playPauseBtn.textContent = running ? '⏸ Pause' : '▶ Play';
  if (running) {
    timer = setInterval(nextGen, parseInt(speedSlider.value, 10));
  } else {
    clearInterval(timer);
  }
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  toggleCell(x, y);
});

playPauseBtn.addEventListener('click', () => setRunning(!running));
stepBtn.addEventListener('click', () => { if (!running) nextGen(); });
clearBtn.addEventListener('click', () => { grid = createGrid(rows, cols); draw(); });
randomBtn.addEventListener('click', () => {
  grid = grid.map(row => row.map(() => Math.random() > 0.7 ? 1 : 0));
  draw();
});

sizeSlider.addEventListener('input', () => {
  rows = parseInt(sizeSlider.value, 10);
  cols = rows;
  sizeValue.textContent = rows;
  grid = createGrid(rows, cols);
  resizeCanvas();
});

speedSlider.addEventListener('input', () => {
  speedValue.textContent = speedSlider.value;
  if (running) {
    clearInterval(timer);
    timer = setInterval(nextGen, parseInt(speedSlider.value, 10));
  }
});

window.addEventListener('resize', resizeCanvas);

// Init
sizeValue.textContent = rows;
speedValue.textContent = speedSlider.value;
resizeCanvas();
