/* 海面四分化: a dependency-free client-side workout state machine. */
const PLAN = {
  day1: { id: "day1", label: "Day 1", title: "胸肌和三头肌", short: "胸 + 三头", depth: "shallows", exercises: [
    { id: "d1_01", name: "弹力带绕肩激活", part: "热身", sets: 2, repsLabel: "20次", inputMode: "auto", cue: "双手握弹力带两端，手臂伸直从体前绕到体后，感受肩胛活动" },
    { id: "d1_02", name: "Y字肩胛骨激活", part: "热身", sets: 2, repsLabel: "20次", inputMode: "auto", cue: "俯身双臂举成Y字，收紧肩胛骨再缓慢放下" },
    { id: "d1_03", name: "靠墙倒立预备", part: "热身", sets: 2, repsLabel: "10次", inputMode: "auto", cue: "背对墙手掌撑地，双脚逐步走上墙，核心收紧，量力而行" },
    { id: "d1_04", name: "对握哑铃俯卧撑", part: "胸部", sets: 4, repsLabel: "力竭", inputMode: "numpad", cue: "双手对握哑铃撑地做俯卧撑，胸肌发力，做到力竭" },
    { id: "d1_05", name: "平板哑铃卧推", part: "胸部", sets: 4, repsLabel: "10-15次", inputMode: "auto", cue: "仰卧，哑铃从胸前推起至手臂接近伸直，缓慢下放" },
    { id: "d1_06", name: "双杠臂屈伸", part: "胸部", sets: 4, repsLabel: "10-12次", inputMode: "auto", cue: "可用两把椅子代替，身体略前倾，屈肘下放再撑起" },
    { id: "d1_07", name: "哑铃飞鸟", part: "胸部", sets: 4, repsLabel: "12-15次", inputMode: "auto", cue: "仰卧双臂微屈向两侧打开，像环抱大树，胸肌收紧合拢" },
    { id: "d1_08", name: "颈后哑铃臂屈伸", part: "三头肌", sets: 4, repsLabel: "10-12次/侧", inputMode: "auto", cue: "持哑铃置于颈后，伸直手臂举过头顶，大臂固定" },
    { id: "d1_09", name: "俯身哑铃臂屈伸", part: "三头肌", sets: 3, repsLabel: "12次/侧", inputMode: "auto", cue: "俯身大臂夹紧身体固定不动，小臂向后伸直" }
  ] },
  day2: { id: "day2", label: "Day 2", title: "背肌和二头肌", short: "背 + 二头", depth: "shallows", exercises: [
    { id: "d2_01", name: "静态肘支撑肩胛骨控制", part: "热身", sets: 3, repsLabel: "10次呼吸", inputMode: "auto", cue: "肘撑平板姿势，肩胛骨做前引与回收，配合呼吸" },
    { id: "d2_02", name: "动态平板拉锯式移动", part: "热身", sets: 3, repsLabel: "尽量延长", inputMode: "numpad", cue: "肘撑平板，身体前后小幅移动，核心全程收紧" },
    { id: "d2_03", name: "跪姿健腹轮", part: "背肌", sets: 4, repsLabel: "12次", inputMode: "auto", cue: "跪姿健腹轮前滚至身体接近平直，腹部发力拉回" },
    { id: "d2_04", name: "哑铃单手划船", part: "背肌", sets: 4, repsLabel: "10-15次/侧", inputMode: "auto", cue: "一手一膝撑凳，另一手持哑铃沿体侧向后上方划" },
    { id: "d2_05", name: "引体向上", part: "背肌", sets: 4, repsLabel: "10-12次", inputMode: "numpad", cue: "正握略宽于肩，背阔肌发力拉起下巴过杠，可弹力带辅助" },
    { id: "d2_06", name: "双手哑铃划船", part: "背肌", sets: 4, repsLabel: "10-12次", inputMode: "auto", cue: "俯身双膝微屈，双哑铃同时沿大腿向后上方划起" },
    { id: "d2_07", name: "单手哑铃交替弯举", part: "二头肌", sets: 3, repsLabel: "10次/侧", inputMode: "auto", cue: "站姿双臂交替弯举，顶峰收缩一秒" },
    { id: "d2_08", name: "垂式哑铃弯举", part: "二头肌", sets: 3, repsLabel: "10-12次/侧", inputMode: "auto", cue: "双手对握哑铃垂于体侧，掌心相对弯举" }
  ] },
  day3: { id: "day3", label: "Day 3", title: "大腿和小腿", short: "腿", depth: "shallows", exercises: [
    { id: "d3_01", name: "伟大的伸展", part: "热身", sets: 3, repsLabel: "15次", inputMode: "auto", cue: "弓步双手撑地，胸椎旋转打开，左右交替" },
    { id: "d3_02", name: "臀部行走", part: "热身", sets: 1, repsLabel: "来回5次", inputMode: "auto", cue: "坐姿双腿前伸，用臀部交替向前行走" },
    { id: "d3_03", name: "哥本哈根支撑", part: "大腿", sets: 3, repsLabel: "30秒/侧", inputMode: "numpad", cue: "侧撑，上侧腿搭凳面，髋部抬起保持" },
    { id: "d3_04", name: "单腿臀桥", part: "大腿", sets: 3, repsLabel: "12-15次", inputMode: "auto", cue: "仰卧一腿抬起，另一腿发力顶髋至身体成直线" },
    { id: "d3_05", name: "反向保加利亚蹲", part: "大腿", sets: 4, repsLabel: "8-10次/侧", inputMode: "auto", cue: "后脚搭凳，前腿下蹲至大腿接近平行地面" },
    { id: "d3_06", name: "颈前深蹲", part: "大腿", sets: 4, repsLabel: "12-15次", inputMode: "auto", cue: "哑铃托于胸前，下蹲时膝盖对齐脚尖方向" },
    { id: "d3_07", name: "哑铃直腿硬拉", part: "大腿", sets: 4, repsLabel: "10-12次", inputMode: "auto", cue: "双膝微屈髋部后移，哑铃沿小腿下放，臀腿后侧发力起身" },
    { id: "d3_08", name: "站姿提踵", part: "小腿", sets: 3, repsLabel: "15-18次", inputMode: "auto", cue: "站姿提踵至最高顶峰停顿，缓慢下放，可持哑铃" }
  ] },
  day4: { id: "day4", label: "Day 4", title: "肩部和手臂", short: "肩 + 手臂", depth: "shallows", exercises: [
    { id: "d4_01", name: "弹力带肩部环绕", part: "热身", sets: 2, repsLabel: "20次", inputMode: "auto", cue: "双手握弹力带从体前绕到体后，肩关节全程放松" },
    { id: "d4_02", name: "仰卧Y字动态训练", part: "热身", sets: 2, repsLabel: "20次", inputMode: "auto", cue: "仰卧双臂举过头顶成Y字再收回体侧" },
    { id: "d4_03", name: "哑铃俯身飞鸟", part: "肩部", sets: 4, repsLabel: "12-15次", inputMode: "auto", cue: "俯身双臂微屈向两侧飞起，肩后束发力" },
    { id: "d4_04", name: "哑铃推肩", part: "肩部", sets: 4, repsLabel: "10-12次", inputMode: "auto", cue: "哑铃从肩侧推至头顶，不要完全锁死肘关节" },
    { id: "d4_05", name: "哑铃前平举（对握）", part: "肩部", sets: 4, repsLabel: "10-12次", inputMode: "auto", cue: "对握哑铃前平举至肩高，控制下放速度" },
    { id: "d4_06", name: "哑铃侧平举", part: "肩部", sets: 4, repsLabel: "10-12次", inputMode: "auto", cue: "双臂微屈向两侧抬至肩高，不要耸肩借力" },
    { id: "d4_07", name: "哑铃交替弯举", part: "手臂超级组", sets: 4, repsLabel: "8-10次/侧", inputMode: "auto", cue: "超级组A：做完立刻接颈后臂屈伸，中间不休息", supersetWith: "d4_08" },
    { id: "d4_08", name: "哑铃颈后臂屈伸", part: "手臂超级组", sets: 4, repsLabel: "12次", inputMode: "auto", cue: "超级组B：完成后才进入组间歇" },
    { id: "d4_09", name: "卷腹", part: "腹肌", sets: 3, repsLabel: "15次", inputMode: "auto", cue: "仰卧屈膝，上背抬起即可，颈部放松不要借力", isAbs: true },
    { id: "d4_10", name: "单腿提膝（登山者）", part: "腹肌", sets: 3, repsLabel: "20次", inputMode: "auto", cue: "平板支撑姿势，单腿提膝跳起来换腿，核心全程收紧", isAbs: true },
    { id: "d4_11", name: "平板/侧向平板支撑", part: "腹肌", sets: 3, repsLabel: "30秒", inputMode: "numpad", cue: "肘撑平板或侧向平板，抬头收下巴；做不了可以减量", isAbs: true }
  ] },
  day5: { id: "day5", label: "Day 5", title: "休息日", short: "恢复", depth: "surface", exercises: [] }
};

const ICONS = {
  back: '<svg viewBox="0 0 24 24"><path d="M15 18 9 12l6-6"/><path d="M9 12h10"/></svg>',
  history: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-7h6v7"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="m19.4 15 .1.1a2 2 0 0 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.2a2 2 0 0 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1A2 2 0 0 1 3 15l.1-.1a2 2 0 0 0-1.4-3.4h-.2a2 2 0 0 1 0-4h.2A2 2 0 0 0 3.1 4L3 3.9A2 2 0 0 1 5.8 1l.1.1a2 2 0 0 0 3.4-1.4v-.2a2 2 0 0 1 4 0v.2A2 2 0 0 0 16.7 1l.1-.1A2 2 0 0 1 19.6 3l-.1.1a2 2 0 0 0 1.4 3.4h.2a2 2 0 0 1 0 4h-.2a2 2 0 0 0-1.5 3.5Z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="m8 5 11 7-11 7Z" fill="currentColor" stroke="none"/></svg>',
  volume: '<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6l-5 4Z"/><path d="M16 9a5 5 0 0 1 0 6M19 6a9 9 0 0 1 0 12"/></svg>',
  mute: '<svg viewBox="0 0 24 24"><path d="M4 10v4h4l5 4V6l-5 4Z"/><path d="m18 9 4 6m0-6-4 6"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7l1-3h4l1 3"/></svg>'
};
const store = {
  get(key, fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
};
const state = { view: "home", dayId: null, openEdit: null, session: null, restTimer: null, restLeft: 0, restTotal: 0, numpadValue: "", wakeLock: null, audio: null, muted: true };
const app = document.querySelector("#app");
const transition = document.querySelector("#transition");
const toast = document.querySelector("#toast");
const defaults = { rest: 60, absEnabled: true, onboardingDone: false };
function settings() { return { ...defaults, ...store.get("fs4_settings", {}) }; }
function overrides() { return store.get("fs4_overrides", {}); }
function saveOverrides(value) { store.set("fs4_overrides", value); }
function dayData(dayId) {
  const day = PLAN[dayId];
  const override = overrides();
  return { ...day, exercises: day.exercises.filter(ex => !ex.isAbs || settings().absEnabled).map(ex => { const o = override[ex.id] || {}; return { ...ex, ...o, sets: Math.max(1, o.sets != null ? o.sets : ex.sets), rest: o.rest != null ? o.rest : (ex.rest != null ? ex.rest : settings().rest) }; }) };
}
function formatDuration(seconds) { const min = Math.floor(seconds / 60); const sec = seconds % 60; return min ? `${min}分${String(sec).padStart(2, "0")}秒` : `${sec}秒`; }
function formatDate(iso) { return new Date(iso).toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" }); }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch])); }
function showToast(message) { toast.textContent = message; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 1900); }
let suppressHash = false;
function hashFor(view, data) {
  if (view === "day" && data.dayId) return "#/day/" + data.dayId;
  if (view === "home") return "#/";
  if (["history", "settings", "restday"].includes(view)) return "#/" + view;
  return null;
}
function applyHash() {
  if (state.session) { clearInterval(state.restTimer); releaseWakeLock(); state.session = null; document.querySelectorAll(".rest-overlay").forEach(el => el.remove()); }
  const h = location.hash;
  if (h.startsWith("#/play/")) { const parts = h.slice(7).split("@"); if (PLAN[parts[0]]) { startSession(parts[0]); if (parts[1]) { state.session.exerciseIndex = Math.min(Number(parts[1]) || 0, state.session.exercises.length - 1); render(); } return; } }
  if (h.startsWith("#/day/") && PLAN[h.slice(6)]) { state.view = "day"; state.dayId = h.slice(6); state.openEdit = null; }
  else if (h === "#/history") state.view = "history";
  else if (h === "#/settings") state.view = "settings";
  else if (h === "#/restday") state.view = "restday";
  else state.view = "home";
  render();
}
window.addEventListener("hashchange", () => { if (suppressHash) { suppressHash = false; return; } applyHash(); });
function go(view, data = {}) {
  const h = hashFor(view, data);
  if (h && location.hash !== h) { suppressHash = true; location.hash = h; }
  transition.classList.remove("play");
  void transition.offsetWidth;
  transition.classList.add("play");
  setTimeout(() => { state.view = view; Object.assign(state, data); render(); }, 420);
  setTimeout(() => transition.classList.remove("play"), 950);
}
function setDepth(depth, bg = "") { app.dataset.depth = depth; if (bg) app.dataset.bg = bg; else delete app.dataset.bg; }
function nav(active) { return `<nav class="bottom-nav" aria-label="主导航"><button class="nav-btn ${active === "home" ? "active" : ""}" data-action="home">${ICONS.home}<span>训练</span></button><button class="nav-btn ${active === "history" ? "active" : ""}" data-action="history">${ICONS.history}<span>日志</span></button><button class="nav-btn ${active === "settings" ? "active" : ""}" data-action="settings">${ICONS.settings}<span>设置</span></button></nav>`; }
function pageHeader(title, eyebrow, back = "") { return `<header class="page-header">${back ? `<button class="back-btn" data-action="${back}">${ICONS.back}</button>` : `<div></div>`}<div style="flex:1"><span class="eyebrow">${eyebrow}</span><h1>${title}</h1></div><div class="top-actions"><button class="icon-btn" data-action="settings" aria-label="设置">${ICONS.settings}</button></div></header>`; }
function render() {
  if (state.view === "home") renderHome();
  else if (state.view === "day") renderDay();
  else if (state.view === "player") renderPlayer();
  else if (state.view === "history") renderHistory();
  else if (state.view === "settings") renderSettings();
  else if (state.view === "restday") renderRestday();
  else if (state.view === "complete") renderComplete();
}
function renderHome() {
  setDepth("surface", "surface");
  const days = Object.values(PLAN).filter(day => day.id !== "day5");
  app.innerHTML = `<main class="page">${pageHeader("海面四分化", "HOME TRAINING")}<section class="hero-card surface-card"><div class="hero-copy"><span class="eyebrow">今日训练</span><h2>把每一次下潜<br>练成更好的自己</h2><p class="subtle">四日循环训练。跟随节奏，记录每一组进步。</p></div></section><div class="section-heading"><h2>训练日</h2><span class="subtle">四分化计划</span></div><section class="day-grid">${days.map((day, index) => { const total = dayData(day.id).exercises.reduce((sum, ex) => sum + ex.sets, 0); return `<button class="day-card surface-card" data-action="day" data-day="${day.id}"><div><span class="day-index">DAY ${index + 1}</span><h3>${day.title}</h3></div><div class="day-meta"><span>${day.short} · ${day.exercises.length} 动作 · ${total} 组</span></div></button>`; }).join("")}<button class="rest-card surface-card" data-action="restday"><span class="sun-mark"></span><span style="flex:1"><strong>Day 5 · 休息日</strong><span class="subtle" style="display:block;margin-top:4px">恢复也是训练的一部分</span></span><span>${ICONS.back}</span></button></section>${nav("home")}</main>`;
}
function renderDay() {
  const day = dayData(state.dayId); setDepth("shallows", "surface");
  const groups = [...new Set(day.exercises.map(ex => ex.part === "热身" ? "热身" : ex.part.includes("超级组") ? "超级组" : ex.part.includes("腹肌") ? "腹肌" : "主项"))];
  app.innerHTML = `<main class="page"><header class="page-header"><button class="back-btn" data-action="home">${ICONS.back}</button><div style="flex:1"><span class="eyebrow">${day.label}</span><h1>${day.title}</h1></div><button class="icon-btn" data-action="settings">${ICONS.settings}</button></header><section class="day-summary surface-card"><div><strong>${day.exercises.length} 个动作</strong><p class="summary-count">${day.exercises.reduce((sum, ex) => sum + ex.sets, 0)} 组训练容量</p></div><span class="day-index">今日计划</span></section>${groups.map(group => `<section><div class="group-label">${group}</div><div class="exercise-list">${day.exercises.filter(ex => (group === "热身" ? ex.part === "热身" : group === "超级组" ? ex.part.includes("超级组") : group === "腹肌" ? ex.part.includes("腹肌") : ex.part !== "热身" && !ex.part.includes("超级组") && !ex.part.includes("腹肌"))).map(exerciseRow).join("")}</div></section>`).join("")}<div class="start-wrap"><button class="primary-btn btn-wide btn-large" data-action="start" data-day="${day.id}">${ICONS.play} 开始训练</button></div>${nav("home")}</main>`;
}
function exerciseRow(ex) {
  const open = state.openEdit === ex.id;
  return `<div><button class="exercise-row surface-card" data-action="edit" data-ex="${ex.id}"><span><strong>${escapeHtml(ex.name)}</strong><span class="exercise-meta">${escapeHtml(ex.part)} · ${escapeHtml(ex.repsLabel)}</span></span><span class="exercise-rest"><strong>${ex.sets} 组</strong>${ex.rest} 秒休息</span></button><div class="edit-panel surface-card ${open ? "open" : ""}" id="edit-${ex.id}"><div class="field-grid"><div class="field"><label for="sets-${ex.id}">组数</label><input id="sets-${ex.id}" data-edit-field="sets" data-ex="${ex.id}" type="number" min="1" max="10" value="${ex.sets}"></div><div class="field"><label for="rest-${ex.id}">间歇秒数</label><input id="rest-${ex.id}" data-edit-field="rest" data-ex="${ex.id}" type="number" min="0" max="600" value="${ex.rest}"></div><div class="field field-wide"><label for="reps-${ex.id}">次数目标</label><input id="reps-${ex.id}" data-edit-field="repsLabel" data-ex="${ex.id}" type="text" value="${escapeHtml(ex.repsLabel)}"></div></div><div class="edit-actions"><button class="ghost-btn btn-small" data-action="reset-ex" data-ex="${ex.id}">恢复默认</button><span class="subtle">改动自动保存</span></div></div></div>`;
}
function renderPlayer() {
  const s = state.session; const ex = s.exercises[s.exerciseIndex]; const totalSets = s.exercises.reduce((sum, e) => sum + e.sets, 0); const progress = (s.completedSets / totalSets) * 100;
  setDepth("mid", "underwater");
  app.innerHTML = `<main class="page player-page"><header class="player-header"><button class="back-btn" data-action="quit">${ICONS.close}</button><div class="player-title"><span class="eyebrow">${s.day.title}</span><h1>${escapeHtml(ex.name)}</h1><p class="subtle">${escapeHtml(ex.part)} · 第 ${s.setIndex + 1} 组 / 共 ${ex.sets} 组</p></div><button class="icon-btn" data-action="toggle-mute" aria-label="${state.muted ? "打开声音" : "静音"}">${state.muted ? ICONS.mute : ICONS.volume}</button></header><div class="progress-track"><span style="width:${Math.min(100, progress)}%"></span></div><section class="player-stage"><video id="exercise-video" autoplay muted loop playsinline src="videos/clips/${ex.id}.mp4"></video><div class="cue-card"><span class="cue-label">动作要领</span><p>${escapeHtml(ex.cue)}</p></div></section><div class="player-bottom"><button class="primary-btn btn-wide btn-large" data-action="complete-set">完成本组</button><p class="subtle" style="text-align:center;margin-top:10px">目标：${escapeHtml(ex.repsLabel)}</p></div></main>`;
  const video = document.querySelector("#exercise-video");
  if (video) {
    video.addEventListener("error", () => { video.remove(); const stage = document.querySelector(".player-stage"); if (stage && !stage.querySelector(".no-video-note")) { const note = document.createElement("small"); note.className = "no-video-note"; note.textContent = "该动作教学视频待补充，照着要领完成即可"; const cue = stage.querySelector(".cue-card p"); if (cue) cue.after(note); } });
    video.addEventListener("loadeddata", () => { video.muted = state.muted; video.play().catch(() => {}); });
  }
  acquireWakeLock();
}
function renderHistory() {
  setDepth("log", "surface"); const history = store.get("fs4_history", []);
  app.innerHTML = `<main class="page">${pageHeader("航海日志", "TRAINING LOG")}<p class="subtle" style="margin:-10px 0 22px">每一次完成，都是下一次下潜的坐标。</p>${history.length ? history.map((item, index) => `<article class="log-card surface-card"><div class="log-card-header"><div><span class="day-index">${escapeHtml(item.dayId === "day5" ? "RECOVERY" : item.dayId.toUpperCase())}</span><h3 style="margin-top:5px">${escapeHtml(item.dayTitle)}</h3></div><div class="log-date">${formatDate(item.date)}<br><button class="ghost-btn btn-small" style="margin-top:7px" data-action="delete-log" data-index="${index}">${ICONS.trash} 删除</button></div></div><div class="log-stats"><div class="log-stat"><strong>${formatDuration(item.durationSec || 0)}</strong><span>总时长</span></div><div class="log-stat"><strong>${item.items ? item.items.reduce((sum, i) => sum + i.sets.length, 0) : 0}</strong><span>完成组数</span></div></div>${item.items && item.items.length ? `<div class="log-items">${item.items.map(i => `<div class="log-item"><span>${escapeHtml(i.name)}</span><span>${i.sets.map(s => `${s.reps}次`).join(" · ")}</span></div>`).join("")}</div>` : ""}</article>`).join("") : `<div class="empty-state surface-card"><h3>日志还是空的</h3><p class="subtle" style="margin-top:8px">完成一次训练，第一条航线就会出现。</p></div>`}${nav("history")}</main>`;
}
function renderSettings() {
  setDepth("surface", "surface"); const s = settings();
  app.innerHTML = `<main class="page">${pageHeader("设置", "PREFERENCES")}<section class="settings-list"><div class="setting-row surface-card"><div><p>全局组间歇</p><span class="subtle">动作未单独设置时使用</span></div><div class="row-actions"><input id="global-rest" class="field" style="width:86px;min-height:48px;border-radius:12px;border:1px solid var(--line);padding:0 10px;background:rgba(250,253,254,.8)" type="number" min="0" max="600" value="${s.rest}"><span class="subtle">秒</span></div></div><label class="setting-row surface-card"><div><p>腹肌动作</p><span class="subtle">在 Day 4 中加入腹肌训练</span></div><span class="switch"><input id="abs-switch" type="checkbox" ${s.absEnabled ? "checked" : ""}><span></span></span></label><div class="setting-row surface-card"><div><p>离线模式</p><span class="subtle">页面、计划和提示音无需网络</span></div><strong style="color:var(--mid)">已就绪</strong></div></section><div style="margin-top:22px"><button class="ghost-btn btn-wide" data-action="home">${ICONS.back} 返回训练</button></div>${nav("settings")}</main>`;
}
function renderRestday() {
  setDepth("surface", "surface");
  app.innerHTML = `<main class="page complete-page"><section class="complete-card surface-card"><div class="complete-sun"></div><span class="eyebrow">DAY 5 · RECOVERY</span><h1 style="margin-top:10px">今天休息</h1><p class="subtle">恢复也是训练的一部分。让身体在阳光和睡眠里，把努力变成进步。</p><button class="primary-btn btn-wide btn-large" style="margin-top:18px" data-action="check-rest">今日已恢复</button><button class="ghost-btn btn-wide" style="margin-top:10px" data-action="home">${ICONS.back} 回到训练</button></section></main>`;
}
function renderComplete() {
  setDepth("surface", "surface"); const s = state.session;
  app.innerHTML = `<main class="page complete-page"><section class="complete-card surface-card"><div class="complete-sun"></div><span class="eyebrow">SURFACE COMPLETE</span><h1 style="margin-top:10px">浮出水面</h1><p class="subtle">这次下潜完成得很好。把今天的节奏留在日志里。</p><div class="complete-stats"><div class="complete-stat"><strong>${formatDuration(Math.floor((Date.now() - s.startedAt) / 1000))}</strong><span>总时长</span></div><div class="complete-stat"><strong>${s.completedSets}</strong><span>完成组数</span></div></div><button class="primary-btn btn-wide btn-large" data-action="save-session">保存并返回</button></section></main>`;
}
function startSession(dayId) {
  const day = dayData(dayId); state.session = { day: { ...day, exercises: day.exercises }, exercises: day.exercises, exerciseIndex: 0, setIndex: 0, completedSets: 0, items: day.exercises.map(ex => ({ id: ex.id, name: ex.name, sets: [] })), startedAt: Date.now() }; state.muted = true; go("player"); }
function currentExercise() { return state.session.exercises[state.session.exerciseIndex]; }
function completeSet() {
  if (document.querySelector(".rest-overlay")) return;
  const s = state.session; const ex = currentExercise(); unlockAudio(); vibrate([40]);
  if (ex.inputMode === "numpad") { state.numpadValue = ""; renderNumpad(); return; }
  recordSet(ex.repsLabel);
}
function renderNumpad() {
  const ex = currentExercise(); const pad = document.createElement("div"); pad.className = "rest-overlay"; pad.innerHTML = `<section class="rest-sheet"><span class="eyebrow">记录实际完成</span><h2>${escapeHtml(ex.name)}</h2><p class="subtle" style="margin-top:8px">输入本组次数或秒数</p><div class="numpad-display" id="numpad-value">${state.numpadValue || "0"}</div><div class="numpad">${[1,2,3,4,5,6,7,8,9].map(n => `<button class="pad-key" data-pad="${n}">${n}</button>`).join("")}<button class="pad-key" data-pad="clear">清除</button><button class="pad-key" data-pad="0">0</button><button class="pad-key" data-pad="submit">完成</button></div></section>`; document.body.appendChild(pad); }
function recordSet(reps) {
  const s = state.session; const ex = currentExercise();
  s.items[s.exerciseIndex].sets.push({ reps: String(reps).replace(/次/g, "") }); s.completedSets += 1;
  document.querySelectorAll(".rest-overlay").forEach(el => el.remove());
  const prevEx = s.exercises[s.exerciseIndex - 1]; const nextEx = s.exercises[s.exerciseIndex + 1];
  const isSupersetB = prevEx && prevEx.supersetWith === ex.id;
  const isLastSet = s.setIndex >= ex.sets - 1;
  if (ex.supersetWith && nextEx && nextEx.id === ex.supersetWith) { s.exerciseIndex += 1; render(); showToast("超级组：立即继续"); return; }
  if (isSupersetB && !isLastSet) { s.exerciseIndex -= 1; s.setIndex += 1; beginRest(ex.rest || settings().rest); return; }
  if (isLastSet && !nextEx) { releaseWakeLock(); vibrate([200, 100, 200]); go("complete"); return; }
  if (isLastSet) { s.exerciseIndex += 1; s.setIndex = 0; } else { s.setIndex += 1; }
  beginRest(ex.rest || settings().rest);
}
function beginRest(seconds) {
  clearInterval(state.restTimer); state.restLeft = Number(seconds) || 0; state.restTotal = state.restLeft;
  if (state.restLeft <= 0) { render(); return; }
  const overlay = document.createElement("div"); overlay.className = "rest-overlay"; overlay.id = "rest-modal"; overlay.innerHTML = `<section class="rest-sheet"><span class="eyebrow">浮出水面透气</span><h2>组间休息</h2><div class="rest-number" id="rest-number">${state.restLeft}</div><div class="rest-actions"><button class="primary-btn btn-wide btn-large" data-action="skip-rest">跳过休息</button><button class="ghost-btn btn-wide btn-large" data-action="add-rest">+15秒</button></div></section>`; document.body.appendChild(overlay);
  state.restTimer = setInterval(() => { state.restLeft -= 1; const number = document.querySelector("#rest-number"); if (number) number.textContent = state.restLeft; if (state.restLeft <= 3 && state.restLeft > 0) beep(880, .15); if (state.restLeft <= 0) { clearInterval(state.restTimer); beep(1320, .4); vibrate([200,100,200]); overlay.remove(); render(); } }, 1000);
}
function unlockAudio() { if (!state.audio) { const AudioCtx = window.AudioContext || window.webkitAudioContext; if (AudioCtx) state.audio = new AudioCtx(); } if (state.audio && state.audio.state === "suspended") state.audio.resume().catch(() => {}); }
function beep(frequency, duration) { if (!state.audio) return; const osc = state.audio.createOscillator(); const gain = state.audio.createGain(); osc.frequency.value = frequency; osc.type = "sine"; gain.gain.setValueAtTime(.001, state.audio.currentTime); gain.gain.exponentialRampToValueAtTime(.12, state.audio.currentTime + .015); gain.gain.exponentialRampToValueAtTime(.001, state.audio.currentTime + duration); osc.connect(gain).connect(state.audio.destination); osc.start(); osc.stop(state.audio.currentTime + duration + .02); }
function vibrate(pattern) { if (navigator.vibrate) navigator.vibrate(pattern); }
async function acquireWakeLock() { if (!("wakeLock" in navigator) || state.view !== "player") return; try { state.wakeLock = await navigator.wakeLock.request("screen"); } catch {} }
function releaseWakeLock() { if (state.wakeLock) { state.wakeLock.release().catch(() => {}); state.wakeLock = null; } }
function saveSession() { const s = state.session; const history = store.get("fs4_history", []); history.unshift({ date: new Date().toISOString(), dayId: s.day.id, dayTitle: s.day.title, durationSec: Math.floor((Date.now() - s.startedAt) / 1000), items: s.items.filter(item => item.sets.length) }); store.set("fs4_history", history); state.session = null; go("home"); showToast("已保存到航海日志"); }
function saveRestday() { const history = store.get("fs4_history", []); history.unshift({ date: new Date().toISOString(), dayId: "day5", dayTitle: "休息日", durationSec: 0, items: [] }); store.set("fs4_history", history); go("home"); showToast("恢复打卡已记录"); }
function updateOverride(id, field, value) { const all = overrides(); all[id] = { ...(all[id] || {}) }; all[id][field] = field === "sets" ? Math.max(1, Number(value) || 1) : field === "rest" ? Math.max(0, Number(value) || 0) : value; saveOverrides(all); }

document.addEventListener("click", event => {
  const actionEl = event.target.closest("[data-action]"); const padEl = event.target.closest("[data-pad]");
  if (padEl) { const value = padEl.dataset.pad; if (value === "clear") state.numpadValue = ""; else if (value === "submit") { recordSet(state.numpadValue || "0"); return; } else if (state.numpadValue.length < 2) state.numpadValue += value; const display = document.querySelector("#numpad-value"); if (display) display.textContent = state.numpadValue || "0"; return; }
  if (!actionEl) return; const action = actionEl.dataset.action;
  if (action === "home") go("home");
  if (action === "history") go("history");
  if (action === "settings") go("settings");
  if (action === "day") go("day", { dayId: actionEl.dataset.day, openEdit: null });
  if (action === "restday") go("restday");
  if (action === "edit") { state.openEdit = state.openEdit === actionEl.dataset.ex ? null : actionEl.dataset.ex; renderDay(); }
  if (action === "reset-ex") { const all = overrides(); delete all[actionEl.dataset.ex]; saveOverrides(all); renderDay(); showToast("已恢复默认"); }
  if (action === "start") startSession(actionEl.dataset.day);
  if (action === "complete-set") completeSet();
  if (action === "skip-rest") { clearInterval(state.restTimer); document.querySelector("#rest-modal")?.remove(); render(); }
  if (action === "add-rest") { state.restLeft += 15; const number = document.querySelector("#rest-number"); if (number) number.textContent = state.restLeft; }
  if (action === "toggle-mute") { state.muted = !state.muted; const video = document.querySelector("#exercise-video"); if (video) { video.muted = state.muted; if (!state.muted) video.play().catch(() => {}); } const btn = actionEl; btn.innerHTML = state.muted ? ICONS.mute : ICONS.volume; btn.setAttribute("aria-label", state.muted ? "打开声音" : "静音"); }
  if (action === "quit") { clearInterval(state.restTimer); document.querySelector("#rest-modal")?.remove(); releaseWakeLock(); state.session = null; go("home"); }
  if (action === "save-session") saveSession();
  if (action === "check-rest") saveRestday();
  if (action === "delete-log") { const history = store.get("fs4_history", []); history.splice(Number(actionEl.dataset.index), 1); store.set("fs4_history", history); renderHistory(); }
});
document.addEventListener("input", event => { const field = event.target.closest("[data-edit-field]"); if (field) updateOverride(field.dataset.ex, field.dataset.editField, field.value); });
document.addEventListener("change", event => { if (event.target.id === "global-rest") { const s = settings(); s.rest = Math.max(0, Number(event.target.value) || 0); store.set("fs4_settings", s); showToast("全局间歇已更新"); } if (event.target.id === "abs-switch") { const s = settings(); s.absEnabled = event.target.checked; store.set("fs4_settings", s); showToast(event.target.checked ? "腹肌动作已加入" : "腹肌动作已关闭"); } });
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && state.view === "player") acquireWakeLock(); });
if (location.hash) applyHash(); else render();
if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
