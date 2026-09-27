// OWNER: Member 1 - shared constants and small helper functions used by every other file.

const $ = (id) => document.getElementById(id);

const PX_PER_UNIT = 36;
const GANTT_PAD = 18;
const MAX_PROCESSES = 10;
const LIMITS = { arrival: [0, 99], burst: [1, 50], priority: [0, 99], quantum: [1, 50] };
const STORAGE_KEY = "cpu-sched-viz-v1";
const THEME_KEY = "cpu-viz-theme";

const COLORS = [
  "#2563eb", "#dc2626", "#059669", "#d97706",
  "#7c3aed", "#db2777", "#0891b2", "#65a30d",
  "#ea580c", "#4338ca"
];
const ALGO_COLORS = { fcfs: "#0891b2", sjf: "#7c3aed", priority: "#db2777", rr: "#65a30d" };

function colorForIndex(i) { return COLORS[i % COLORS.length]; }

function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
function safeSet(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* storage unavailable */ } }

function esc(v) {
  return String(v).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
