(() => {
  "use strict";
  const $ = (q, root = document) => root.querySelector(q);
  const app = $("#app"), toast = $("#toast"), transition = $("#transition");
  const store = WorkoutStore;
  const order = ["day1", "day2", "day4", "day3", "day5"];
  const state = { view: "home", dayId: null, core: null, session: null, modal: false, teaching: false, videoReady: false, videoFailed: false, autoStart: false, wake: "尚未请求" };
  let timer, lastTick = 0, lastSave = 0, hiddenAt = 0, modalResolve, numberSubmit, audio, soundEpoch = 0, lock, lockPending = false, lessonSound = false;
  const buffers = new Map(), sources = new Set();
  const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const prefs = () => store.settings();
  const day = id => getDayData(id, prefs(), store.overrides());
  const ex = () => state.core?.exercise;
  const label = id => PLAN[id]?.label || id;
  const btn = (text, action, cls = "ghost-btn btn-wide", attrs = "") => `<button class="${cls}" data-action="${action}" ${attrs}>${text}</button>`;
  const sideLabel = side => side === "left" ? "左侧" : side === "right" ? "右侧" : "";
  const statusLabel = s => ({ completed: "完成", partial: "部分完成", unfinished: "未完成", skipped: "跳过" }[s] || "旧记录");
  const duration = n => `${Math.floor(n / 60)}分${Math.floor(n % 60)}秒`;
  const boundedNumber = (value, fallback, min, max, integer = false) => { const n = Number(value); if (!Number.isFinite(n)) return fallback; const bounded = Math.max(min, Math.min(max, n)); return integer ? Math.round(bounded) : bounded; };
  function notify(text) { toast.textContent = text; toast.classList.add("show"); clearTimeout(notify.timeout); notify.timeout = setTimeout(() => toast.classList.remove("show"), 2600); }
  function guard(fn) { try { return fn(); } catch (error) { notify(error.message); console.error(error); return false; } }
  const nav = active => `<nav class="bottom-nav" aria-label="主导航">${["home", "history", "settings"].map((v, i) => btn(["训练", "日志", "设置"][i], v, `nav-btn ${active === v ? "active" : ""}`)).join("")}</nav>`;
  const header = (title, tag) => `<header class="page-header">${btn("‹", "home", "back-btn", 'aria-label="返回训练"')}<div><span class="eyebrow">${esc(tag)}</span><h1>${esc(title)}</h1></div>${btn("设置", "settings", "icon-btn")}</header>`;
  function depth(value, bg = "surface") { app.dataset.depth = value; app.dataset.bg = bg; }
  function go(view, id = null) {
    state.view = view; if (id) state.dayId = id;
    history.replaceState(null, "", view === "home" ? "#/" : view === "day" ? `#/day/${state.dayId}` : `#/${view}`);
    transition.classList.remove("play"); void transition.offsetWidth; transition.classList.add("play");
    setTimeout(() => transition.classList.remove("play"), 900); render(); window.scrollTo(0, 0);
  }
  function render() {
    if (state.view === "player" && state.core?.phase === "complete") state.view = "complete";
    ({ home: renderHome, day: renderDay, player: renderPlayer, history: renderHistory, settings: renderSettings, restday: renderRestday, complete: renderComplete }[state.view] || renderHome)();
  }
  function targetText(e) { return e.mode === "manual" ? e.repsLabel : `${e.target}${e.unit}${e.sided !== "none" ? "/侧" : ""}`; }
  function renderHome() {
    depth("surface"); const cycle = store.cycle(), today = day(order[cycle.index]), draft = store.draft();
    app.innerHTML = `<main class="page">${header("海面四分化", "居家跟练 · 五日循环")}<section class="hero-card"><div class="hero-copy"><span class="eyebrow">今日 · ${label(today.id)}</span><h2>${esc(today.title)}</h2><p>${today.id === "day5" ? "今天休息，恢复也是训练的一部分" : `${today.exercises.length}动作 · ${today.exercises.reduce((n, e) => n + e.sets, 0)}组`}</p><p>${esc([...new Set(today.exercises.filter(e => e.part !== "热身" && e.part !== "拉伸").map(e => e.actualExercise))].join(" · "))}</p>${btn(today.id === "day5" ? "今日休息" : "开始今日训练", today.id === "day5" ? "restday" : "start", "primary-btn hero-cta", `data-day="${today.id}" data-cycle="${cycle.index}"`)}</div></section>${draft ? `<section class="draft-card surface-card"><h3>继续上次训练</h3><p class="subtle">${esc(draft.dayTitle)} · 已保存 ${draft.core?.records?.length || 0}组记录</p><div class="row-actions">${btn("继续草稿", "restore", "primary-btn")}${btn("放弃草稿", "discard-draft", "ghost-btn")}</div></section>` : ""}<div class="section-heading"><h2>选择训练日</h2><span class="subtle">手选不改变循环</span></div><section class="day-grid">${order.map(id => { const d = day(id); return btn(`<span class="day-index">${d.label}</span><h3>${esc(d.short)}</h3><span class="day-meta">${id === "day5" ? "阳光、睡眠和恢复" : `${d.exercises.length}动作 · ${d.exercises.reduce((n,e)=>n+e.sets,0)}组`}</span>`, id === "day5" ? "restday" : "day", `surface-card ${id === "day5" ? "rest-card" : "day-card"}`, `data-day="${id}"`); }).join("")}</section>${nav("home")}</main>`;
  }
  function renderDay() {
    const d = day(state.dayId); if (!d) return go("home"); depth("shallows", d.id);
    app.innerHTML = `<main class="page">${header(d.title, `${d.label} · 自选训练`)}<p class="subtle">原计划保留；范围默认12次，目标与节奏可单独调整。</p><section class="exercise-list">${d.exercises.map(e => `<details class="surface-card exercise-editor"><summary><strong>${esc(e.name)}</strong><span class="exercise-meta">${esc(e.part)} · ${e.sets}组 × ${targetText(e)} · ${esc(e.equipment)}</span><span class="exercise-meta">${e.part === "热身" || e.part === "拉伸" || e.supersetWith ? "连续衔接，不加正式休息" : `${e.rest}秒间歇`} · 原目标${esc(e.repsLabel)}</span>${e.actualExercise !== e.name ? `<span class="exercise-meta">执行：${esc(e.actualExercise)}</span>` : ""}</summary><div class="field-grid">${[["sets","组数",e.sets,1,10,1],["target",e.unit === "秒" ? "每侧/本组秒数" : "每侧/本组次数",e.target,1,e.unit === "秒" ? 3600 : 99,1],["rest","间歇秒数",e.rest,0,600,1],["tempo","每次节奏秒数",e.tempo,.5,10,.5]].filter(f => e.mode !== "manual" || f[0] !== "target").map(([k,t,v,min,max,step]) => `<label class="field">${t}<input type="number" data-override="${k}" data-id="${e.id}" min="${min}" max="${max}" step="${step}" value="${v}"></label>`).join("")}</div>${btn("恢复该动作默认", "reset-ex", "ghost-btn btn-small", `data-id="${e.id}"`)}</details>`).join("")}</section><div class="start-wrap">${btn("开始自选训练", "start", "primary-btn btn-wide btn-large", `data-day="${d.id}"`)}</div>${nav("home")}</main>`;
  }
  function videoSource(e) { return e.tutorial?.source || (e.videoId ? `videos/clips/${e.videoId}.mp4` : null); }
  function soundControls() { const p = prefs(); return `<div class="sound-controls">${[["videoSound","指导声"],["rhythmSound","节拍"],["voiceCount","报数"]].map(([k,t]) => btn(`${t} ${p[k] ? "开" : "关"}`, "sound-toggle", "ghost-btn", `data-key="${k}" aria-pressed="${p[k]}"`)).join("")}</div>`; }
  function renderPlayer() {
    const c = state.core, e = ex(); if (!c || !e) return; depth("mid", state.session.dayId); const d = c.data;
    const old = $("#exercise-video"), src = videoSource(e), same = old && old.dataset.exercise === e.id;
    if (!same) { state.videoReady = !src; state.videoFailed = false; }
    if (same) old.remove();
    app.innerHTML = `<main class="page player-page"><header class="player-header">${btn("×", "quit", "back-btn", 'aria-label="退出训练"')}<div class="player-title"><span class="eyebrow">${label(d.dayId)} · ${esc(e.part)}</span><h1>${esc(e.actualExercise)}</h1><p class="subtle">第${d.setIndex + 1}/${e.sets}组 · 目标${targetText(e)}${e.sided === "single" ? ` · ${sideLabel(d.side)}` : ""}</p></div>${btn(c.phase === "paused" ? "继续" : "暂停", "pause", "icon-btn")}</header><div class="progress-track"><span id="progress-value"></span></div><section class="player-stage">${src ? `<video id="exercise-video" data-exercise="${e.id}" preload="auto" loop muted playsinline src="${esc(src)}"></video>` : `<p class="video-note">对应教学待补充，不播放其他动作冒充教学</p>`}</section><p class="video-note" id="video-state">${src ? "视频加载中，训练尚未开始" : "可按下方动作卡开始训练"}</p>${soundControls()}<div class="rep-chip" id="counter"></div><section class="cue-bar"><span class="cue-label">要领</span><p>${esc(e.cue)}</p></section><p class="subtle">器械：${esc(e.equipment)} · 节奏${e.tempo}秒/次</p><p class="capability-note" id="wake-state">屏幕常亮：${state.wake}</p><div class="button-row">${btn("教学回放", "teach", "ghost-btn btn-small")}${e.sided === "single" ? btn("跳过当前侧", "skip-side", "ghost-btn btn-small") : ""}</div><div class="player-bottom" id="phase-controls"></div></main>`;
    const video = same ? old : $("#exercise-video");
    if (same) { $(".player-stage").replaceChildren(video); $("#video-state").textContent = state.videoFailed ? "视频播放异常，可重试加载" : state.videoReady ? "教学片段已就绪" : "视频加载中，训练尚未开始"; }
    if (video) {
      if (!same) {
        video.addEventListener("volumechange", () => enforceVideo(video));
        const currentVideo = () => video.isConnected && $("#exercise-video") === video;
        const loadTimeout = setTimeout(() => {
          if (!currentVideo() || state.videoReady) return;
          state.videoFailed = true;
          $("#video-state").textContent = "视频加载超过8秒，点“重试视频”或暂停查看动作要领";
          updatePlayer();
        }, 8000);
        video.addEventListener("loadeddata", () => { if (!currentVideo()) return; clearTimeout(loadTimeout); state.videoReady = true; state.videoFailed = false; $("#video-state").textContent = "教学片段已就绪"; updatePlayer(); syncVideo(); beginWhenReady(); });
        video.addEventListener("loadedmetadata", () => { if (!currentVideo()) return; $(".player-stage").classList.toggle("landscape-video", video.videoWidth > video.videoHeight); });
        video.addEventListener("error", () => { if (!currentVideo()) return; clearTimeout(loadTimeout); state.videoFailed = true; $("#video-state").textContent = "视频加载失败，请重试；训练尚未开始"; updatePlayer(); });
      }
      enforceVideo(video);
      if (video.readyState >= 2) state.videoReady = true;
      syncVideo();
      if (video.videoWidth) $(".player-stage").classList.toggle("landscape-video", video.videoWidth > video.videoHeight);
    }
    updatePlayer(true); acquireLock();
    beginWhenReady();
  }
  function enforceVideo(video) {
    const p = prefs(), enabled = video.id === "lesson-video" ? lessonSound : p.videoSound;
    const volume = enabled ? p.volume.video * p.masterVolume : 0;
    if (video.muted !== !enabled) video.muted = !enabled;
    if (Math.abs(video.volume - volume) > .001) video.volume = volume;
  }
  function syncVideo() { const v = $("#exercise-video"); if (!v) return; enforceVideo(v); if (state.core.phase === "paused" || state.modal || ["rest","transition","complete"].includes(state.core.phase)) v.pause(); else v.play().catch(() => {}); }
  function beginWhenReady() {
    if (!state.autoStart || !state.videoReady || state.core?.phase !== "ready" || state.modal || document.hidden) return;
    state.autoStart = false;
    apply("start");
  }
  function updatePlayer(force = false) {
    if (state.view !== "player" || !state.core) return;
    const d = state.core.data, e = ex(), phase = d.phase;
    $("#progress-value").style.width = `${100 * d.records.length / d.exercises.reduce((n,x)=>n+x.sets,0)}%`;
    let value = d.count;
    if (phase === "preparing") value = Math.ceil(d.remaining / 1000);
    else if (phase === "rest" || phase === "buffer") value = Math.ceil(d.remaining / 1000);
    else if (e.mode === "timed" && !d.overTarget) value = Math.max(0, e.target - Math.floor(d.elapsed / 1000));
    else if (e.mode === "manual") value = Math.floor(d.elapsed / 1000);
    const suffix = ["rest","buffer","preparing"].includes(phase) || e.mode !== "reps" ? "秒" : e.sided === "alternate" ? ` 左${Math.ceil(d.count / 2)} / 右${Math.floor(d.count / 2)}` : ` / ${e.target}`;
    $("#counter").textContent = `${value}${suffix}`;
    const panel = $("#phase-controls"), key = `${phase}:${state.videoReady}`;
    if (force || panel.dataset.phase !== key) {
      panel.dataset.phase = key;
      if (phase === "ready") panel.innerHTML = `<p class="subtle">${state.videoFailed ? "视频未就绪，训练暂停等待" : "教学视频加载中"}</p>` + (state.videoFailed ? btn("重试视频", "retry-video", "ghost-btn btn-small") : "") + btn("跳过", "skip-menu", "ghost-btn btn-small");
      else if (phase === "preparing") panel.innerHTML = `<p>准备姿势，倒计时后开始</p>`;
      else if (phase === "active") panel.innerHTML = btn("完成本组", "finish", "primary-btn btn-wide btn-large") + btn("跳过", "skip-menu", "ghost-btn btn-small");
      else if (phase === "buffer") panel.innerHTML = `<p>达到目标，2秒后自动完成</p>${btn("立即完成", "finish", "primary-btn btn-wide btn-large")}${btn("继续本组", "continue")}`;
      else if (phase === "rest") panel.innerHTML = `<p>组间休息 · 下一组：${esc(e.actualExercise)}</p>${btn("跳过休息", "skip-rest", "primary-btn btn-wide btn-large")}${btn("+15秒", "add-rest")}`;
      else if (phase === "transition") panel.innerHTML = `<h2>主训练结束，进入拉伸</h2>${btn("进入拉伸", "stretch", "primary-btn btn-wide btn-large")}${btn("跳过拉伸", "skip-stretch")}`;
      else if (phase === "paused") panel.innerHTML = `<h2>已暂停</h2>${btn("继续训练", "pause", "primary-btn btn-wide btn-large")}${btn("教学回放", "teach")}${btn("跳过本组", "skip-set")}${btn("跳过动作", "skip-ex")}${btn("结束训练", "quit")}`;
      syncVideo();
    }
  }
  function start(id, cycleIndex = null, saved = null) {
    if (id === "day5") return go("restday");
    state.core = new WorkoutCore(day(id), {}, saved?.core ? JSON.parse(JSON.stringify(saved.core)) : null);
    state.session = saved ? { ...saved } : { id: state.core.data.id, dayId: id, dayTitle: day(id).title, cycleIndex };
    if (saved && !["paused","transition","complete"].includes(state.core.phase)) state.core.pause();
    state.view = state.core.phase === "complete" ? "complete" : "player";
    history.replaceState(null,"",`#/play/${id}`); state.autoStart = !saved; saveDraft(); render(); startTimer();
  }
  function saveDraft() { if (!state.core) return; store.saveDraft({ ...state.session, core: state.core.snapshot(), lastSavedAt: Date.now() }); lastSave = Date.now(); }
  function startTimer() {
    clearInterval(timer); lastTick = performance.now();
    timer = setInterval(() => guard(() => {
      const now = performance.now(), delta = now - lastTick; lastTick = now;
      if (!state.core || document.hidden || state.modal || state.view !== "player") return;
      const before = `${state.core.data.exerciseIndex}:${state.core.data.setIndex}:${state.core.data.side}`;
      state.core.tick(delta); events();
      if (state.view !== "player") return;
      const after = `${state.core.data.exerciseIndex}:${state.core.data.setIndex}:${state.core.data.side}`;
      if (before !== after) {
        state.autoStart = state.core.phase === "ready";
        renderPlayer();
      } else if (state.core.phase === "ready" && state.autoStart) beginWhenReady();
      else updatePlayer();
      if (Date.now() - lastSave > 1000) saveDraft();
    }), 100);
  }
  function events() {
    for (const event of state.core.consumeEvents()) {
      if (event.type === "count") { beep(660,.12); if (ex().mode === "reps") speak(ex().sided === "alternate" ? Math.ceil(event.count / 2) : event.count); }
      if (["target","restEnd","setEnd"].includes(event.type)) { beep(1250,.3); navigator.vibrate?.([100,50,100]); }
      if (event.type === "restEnd") state.autoStart = true;
      if (event.type === "start") { const v=$("#exercise-video"); if(v){v.currentTime=0;syncVideo();} }
      if (event.type === "sideChange") notify("换到右侧，准备姿势");
      if (event.type === "backgroundInterrupted") state.needsRecovery = true;
      if (event.type === "complete") { stopSounds(); clearInterval(timer); releaseLock(); saveDraft(); go("complete"); }
    }
  }
  function apply(method, ...args) {
    const d = state.core.data, before = `${d.exerciseIndex}:${d.setIndex}:${d.side}`;
    stopSounds(); const changed = state.core[method](...args); if (!changed) return;
    const after = `${d.exerciseIndex}:${d.setIndex}:${d.side}`;
    if (before !== after && state.core.phase === "ready") state.autoStart = true;
    events(); saveDraft(); if (state.view === "player") renderPlayer();
  }
  function recordsOf(item) {
    if (item.records) return item.records;
    return (item.items || []).flatMap(entry => (entry.sets || []).map((s,i) => ({ exerciseId: entry.id, exerciseName: entry.name, planName: entry.name, part: PLAN[item.dayId]?.exercises.find(e=>e.id===entry.id)?.part || "主项", setIndex:i, status:"completed", mode:"reps", target:null, at:Date.parse(item.date), sides:[{side:null,target:null,rhythm:0,actual:s.reps,unit:/秒/.test(String(s.reps)) ? "秒":"次",status:"completed"}] })));
  }
  function recordRows(records, historyIndex = null) {
    return records.map((r,i) => `<article class="log-item"><strong>${esc(r.exerciseName)} · 第${r.setIndex+1}组 · ${statusLabel(r.status)}</strong>${r.sides.map((s,j)=>`<div class="record-side">${sideLabel(s.side)} 目标${s.target ?? "力竭"}${esc(s.unit)} · 节奏${s.rhythm}${esc(s.unit)} · ${s.status !== "completed" ? statusLabel(s.status) : s.actual == null ? "实际待修正（自动节奏完成）" : `实际${esc(s.actual)}${esc(s.unit)}`} ${s.status === "completed" ? btn("修正", "correct", "ghost-btn btn-small", `data-record="${i}" data-side="${j}" ${historyIndex == null ? "" : `data-history="${historyIndex}"`}`) : ""}</div>`).join("")}</article>`).join("");
  }
  function renderHistory() {
    depth("log"); app.innerHTML=`<main class="page">${header("训练日志","实际完成记录")}${store.history().map((item,i)=>`<article class="log-card surface-card"><div class="log-card-header"><div><span class="eyebrow">${label(item.dayId)} · ${statusLabel(item.status)}</span><h3>${esc(item.dayTitle)}</h3></div>${btn("删除","delete-log","ghost-btn btn-small",`data-history="${i}"`)}</div><p class="subtle">${new Date(item.date).toLocaleString("zh-CN")} · ${duration(item.durationSec)} · ${recordsOf(item).filter(r=>r.status==="completed").length}完成组</p><details><summary>查看每组与侧别</summary>${recordRows(recordsOf(item),i)}</details></article>`).join("") || '<section class="empty-state surface-card">还没有训练记录</section>'}${nav("history")}</main>`;
  }
  function renderComplete() {
    depth("surface"); const d=state.core.data, partial=d.records.some(r=>r.status!=="completed");
    app.innerHTML=`<main class="page"><section class="complete-card surface-card"><div class="complete-sun"></div><h1>${partial ? "训练已结束 · 部分完成" : "训练完成"}</h1><p class="subtle">${state.core.canAdvanceCycle() && state.session.cycleIndex != null ? "保存后进入下一训练日" : "自选或主训练有跳过，不改变循环"}</p><p>${d.records.filter(r=>r.status==="completed").length}完成组 · ${duration(Math.floor(d.activeMs/1000))}动作时间</p>${btn("保存并返回","save-session","primary-btn btn-wide btn-large")}<details><summary>查看并修正实际完成</summary>${recordRows(d.records)}</details></section></main>`;
  }
  function saveSession(unfinished = false) {
    const d=state.core.data, records=JSON.parse(JSON.stringify(d.records));
    if (unfinished) for (const e of d.exercises) for(let i=0;i<e.sets;i++) if(!records.some(r=>r.exerciseId===e.id&&r.setIndex===i)) records.push({exerciseId:e.id,exerciseName:e.actualExercise,planName:e.name,part:e.part,setIndex:i,status:"unfinished",mode:e.mode,target:e.target,sides:[],at:Date.now()});
    store.saveHistory({id:d.id,date:new Date().toISOString(),dayId:d.dayId,dayTitle:d.dayTitle,durationSec:Math.floor(d.activeMs/1000),status:unfinished ? "unfinished" : records.some(r=>r.status!=="completed") ? "partial":"completed",records,cycleIndex:state.session.cycleIndex ?? null}, {advance:!unfinished&&state.core.canAdvanceCycle(),cycleIndex:state.session.cycleIndex ?? null});
    store.clearDraft(); clearInterval(timer); stopSounds(); releaseLock(); state.core=null;state.session=null;go("home");notify("训练记录已保存");
  }
  function renderRestday(){depth("surface");app.innerHTML=`<main class="page complete-page"><section class="complete-card surface-card"><div class="complete-sun"></div><span class="eyebrow">Day 5</span><h1>今天休息</h1><p class="subtle">恢复也是训练的一部分</p>${btn("完成今日休息","check-rest","primary-btn btn-wide btn-large")}${btn("返回选择训练","home")}</section></main>`;}
  function renderSettings(){
    depth("surface");const p=prefs();app.innerHTML=`<main class="page">${header("设置","训练与声音")}<section class="settings-list">${[["rest","默认间歇秒数",0,600,1],["tempo","每次节奏秒数",.5,10,.5],["hold","默认保持秒数",1,3600,1]].map(([k,t,min,max,step])=>`<label class="setting-row surface-card">${t}<input data-setting="${k}" type="number" min="${min}" max="${max}" step="${step}" value="${p[k]}"></label>`).join("")}${[["absEnabled","肩日腹肌"],["videoSound","视频指导声"],["rhythmSound","节拍提示"],["voiceCount","语音报数"]].map(([k,t])=>`<label class="setting-row surface-card">${t}<span class="switch"><input type="checkbox" data-setting="${k}" ${p[k]?"checked":""}><span></span></span></label>`).join("")}${[["video","指导音量"],["rhythm","节拍音量"],["voice","报数音量"],["master","网页总音量"]].map(([k,t])=>`<label class="setting-row surface-card">${t}<input type="range" min="0" max="1" step=".05" data-volume="${k}" value="${k==="master"?p.masterVolume:p.volume[k]}"></label>`).join("")}<p class="subtle">网易云音量由音乐应用控制。本页不会主动暂停外部音乐；混音需在手机浏览器验证。</p><p class="subtle" id="cache-status">正在核对离线缓存</p>${btn("导出历史与设置","export")}${btn("导入备份","import-file")}<input id="import-file" type="file" accept=".json,application/json" hidden><p class="subtle">数据仅存本浏览器，夸克与小米浏览器不自动共享。视频按需缓存。常亮不阻止主动锁屏。</p></section>${nav("settings")}</main>`; cacheStatus();
  }
  function cacheStatus(){const target=$("#cache-status");const worker=navigator.serviceWorker?.controller;if(!worker){target.textContent="离线缓存尚未受控，请联网重开后检查";return;}const channel=new MessageChannel(),timeout=setTimeout(()=>{if(target.isConnected)target.textContent="缓存状态查询超时，不能确认离线就绪";},4000);channel.port1.onmessage=({data})=>{clearTimeout(timeout);if(target.isConnected)target.textContent=`页面${data.shellReady?"已缓存":"尚未缓存完整"} · 语音${data.voices}/40 · 视频${data.clips}段`;channel.port1.close();};worker.postMessage("CACHE_STATUS",[channel.port2]);}
  function freezeForModal(){if(state.core && state.view==="player"){state.core.pause();stopSounds();syncVideo();saveDraft();updatePlayer();document.body.classList.add("modal-active");}}
  function closeModal(){ $("#modal")?.remove(); state.modal=false;state.teaching=false;numberSubmit=null;lastTick=performance.now();document.body.classList.remove("modal-active"); }
  function choice(title,text,buttons){freezeForModal();return new Promise(resolve=>{closeModal();state.modal=true;modalResolve=resolve;const el=document.createElement("div");el.id="modal";el.className="rest-overlay";el.innerHTML=`<section class="rest-sheet" role="dialog" aria-modal="true"><h2>${esc(title)}</h2><p class="subtle">${esc(text)}</p><div class="rest-actions">${buttons.map(([value,t])=>`<button class="ghost-btn btn-wide" data-choice="${value}">${t}</button>`).join("")}</div></section>`;document.body.append(el);});}
  function number(title, callback){freezeForModal();closeModal();state.modal=true;numberSubmit=callback;const el=document.createElement("div");el.id="modal";el.className="rest-overlay";el.innerHTML=`<section class="rest-sheet"><h2>${esc(title)}</h2><div class="numpad-display" id="number-value"></div><div class="numpad">${[1,2,3,4,5,6,7,8,9,"clear",0,"save"].map(v=>`<button class="pad-key" data-digit="${v}">${v==="clear"?"清除":v==="save"?"保存":v}</button>`).join("")}</div>${btn("取消，返回暂停","close-modal")}</section>`;document.body.append(el);}
  function teach(){freezeForModal();closeModal();state.modal=true;state.teaching=true;lessonSound=prefs().videoSound;const e=ex(),src=videoSource(e);const el=document.createElement("div");el.id="modal";el.className="rest-overlay lesson-overlay";el.innerHTML=`<section class="rest-sheet"><h2>${esc(e.actualExercise)}</h2><p>${targetText(e)} · ${esc(e.equipment)} · 第${state.core.data.setIndex+1}组</p>${src?`<video id="lesson-video" class="teaching-video" controls playsinline muted src="${esc(src)}"></video>`:"<p>对应教学视频待补充，下方动作卡可用</p>"}<div class="button-row">${btn("从头重播","lesson-restart","ghost-btn btn-small")}${btn("教学声音开关","lesson-sound","ghost-btn btn-small")}</div><h3>动作步骤</h3><p>${esc(e.tutorial.steps)}</p><h3>动作要领</h3><p>${esc(e.cue)}</p><h3>常见错误</h3><p>${esc(e.tutorial.mistakes)}</p>${btn("返回训练暂停页","close-modal","primary-btn btn-wide btn-large")}</section>`;document.body.append(el);const v=$("#lesson-video");if(v){enforceVideo(v);v.addEventListener("volumechange",()=>enforceVideo(v));v.addEventListener("loadedmetadata",()=>v.classList.toggle("landscape-video",v.videoWidth>v.videoHeight));}}
  async function restore(){const draft=store.draft();if(!draft?.core)return notify("没有可恢复草稿");const action=await choice("恢复训练",`${draft.dayTitle}，已完成组保留`,[["resume","按上次进度继续（保持暂停）"],["redo","重做当前未完成组"],["cancel","取消"]]);if(action==="cancel")return;start(draft.dayId,draft.cycleIndex??null,draft);if(action==="redo"){const d=state.core.data;d.count=0;d.elapsed=0;d.overTarget=false;d.currentSides=[];d.side="left";state.core.setPhase("ready");saveDraft();render();}}
  async function quit(){const answer=await choice("退出训练", "已完成数据保留，主训练有未完成不会推进循环",[["stay","继续训练（保持暂停）"],["save","保存未完成"],["discard","放弃草稿"]]);if(answer==="save")return guard(()=>saveSession(true));if(answer==="discard")await discard();}
  async function discard(){const result=await choice("处理草稿","选择保留未完成历史或彻底删除草稿",[["keep","保留未完成历史"],["delete","彻底删除草稿"],["cancel","取消"]]);if(result==="keep"){if(!state.core){const draft=store.draft();if(draft)start(draft.dayId,draft.cycleIndex??null,draft);}guard(()=>saveSession(true));}if(result==="delete")guard(()=>{store.clearDraft();clearInterval(timer);stopSounds();releaseLock();state.core=null;state.session=null;go("home");});}
  async function unlockAudio(){const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return notify("浏览器不支持WebAudio，请手动选择声音设置");audio ||= new Ctx();if(audio.state!=="running")await audio.resume();}
  function stopSounds(){soundEpoch++;for(const s of sources){try{s.stop();}catch{}}sources.clear();}
  function beep(freq,time){const p=prefs();if(!p.rhythmSound||!audio||audio.state!=="running")return;const osc=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;osc.type="triangle";osc.frequency.value=freq;g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(.8*p.volume.rhythm*p.masterVolume,now+.015);g.gain.exponentialRampToValueAtTime(.001,now+time);osc.connect(g).connect(audio.destination);sources.add(osc);osc.onended=()=>sources.delete(osc);osc.start();osc.stop(now+time);}
  function loadVoice(n){if(!audio)return Promise.resolve(null);if(!buffers.has(n))buffers.set(n,fetch(`assets/voice/n${n}.mp3`).then(r=>{if(!r.ok)throw Error("报数音频加载失败");return r.arrayBuffer();}).then(b=>audio.decodeAudioData(b)).catch(error=>{buffers.delete(n);notify(error.message);return null;}));return buffers.get(n);}
  function speak(n){if(n<1||n>40||!prefs().voiceCount||!audio)return;const epoch=soundEpoch,time=Date.now();loadVoice(n).then(buffer=>{if(!buffer||epoch!==soundEpoch||Date.now()-time>500||state.core?.phase==="paused"||!prefs().voiceCount)return;const src=audio.createBufferSource(),g=audio.createGain(),p=prefs();src.buffer=buffer;g.gain.value=p.volume.voice*p.masterVolume;src.connect(g).connect(audio.destination);sources.add(src);src.onended=()=>sources.delete(src);src.start();});}
  async function acquireLock(){if(lock||lockPending||document.hidden||state.view!=="player")return;if(!navigator.wakeLock){state.wake="不支持，请手动保持亮屏";return;}lockPending=true;try{const l=await navigator.wakeLock.request("screen");if(state.view!=="player"||document.hidden){await l.release();return;}lock=l;state.wake="已开启";l.addEventListener("release",()=>{if(lock===l)lock=null;});}catch{state.wake="请求失败，请保持屏幕亮起";}finally{lockPending=false;const el=$("#wake-state");if(el)el.textContent=`屏幕常亮：${state.wake}`;}}
  function releaseLock(){lock?.release().catch(()=>{});lock=null;}
  document.addEventListener("visibilitychange",()=>guard(()=>{if(!state.core)return;if(document.hidden){hiddenAt=Date.now();if(state.core.phase!=="rest")state.core.background(0);stopSounds();$("#exercise-video")?.pause();saveDraft();}else{if(hiddenAt&&state.core.phase==="rest")state.core.background(Date.now()-hiddenAt);hiddenAt=0;lastTick=performance.now();events();saveDraft();render();acquireLock();if(state.needsRecovery){state.needsRecovery=false;choice("后台训练未补算","请确认当前组进度",[["redo","重做当前组"],["stay","按上次进度继续（暂停）"],["skip","跳过本组"]]).then(v=>{if(v==="skip")apply("skipSet");if(v==="redo"){state.core.data.count=0;state.core.data.elapsed=0;state.core.data.currentSides=[];state.core.data.side="left";state.core.setPhase("ready");saveDraft();render();}});}}}));
  async function action(a,b){
    if(["home","history","settings","restday","day"].includes(a)){if(state.core)return quit();return go(a,b.dataset.day);}
    if(a==="start"){unlockAudio().catch(error=>notify(`声音未就绪：${error.message}`));const draft=store.draft();if(draft){const decision=await choice("已有未完成训练","恢复草稿，或先保存它再开始新训练",[["restore","恢复草稿"],["new","保留未完成历史，开始新训练"],["cancel","取消"]]);if(decision==="restore")return restore();if(decision!=="new")return;start(draft.dayId,draft.cycleIndex??null,draft);saveSession(true);}for(let n=1;n<=20;n++)loadVoice(n);return start(b.dataset.day,b.dataset.cycle==null?null:Number(b.dataset.cycle));}
    if(a==="restore")return restore();if(a==="discard-draft")return discard();
    if(a==="retry-video"){const video=$("#exercise-video");if(video){state.videoFailed=false;state.videoReady=false;$("#video-state").textContent="重新加载教学视频";video.load();updatePlayer();}return;}
    if(a==="finish"){if(ex().mode==="manual")return number(`本组实际${ex().unit}`,v=>{if(state.core.phase==="paused")state.core.resume();apply("finish",v);});return apply("finish");}
    if(a==="continue")return apply("continueBeyondTarget");if(a==="pause"){unlockAudio().catch(error=>notify(`声音未就绪：${error.message}`));if(state.core.phase==="paused" && state.core.data.pausedPhase==="ready"){state.core.resume();state.autoStart=true;renderPlayer();saveDraft();return;}return apply(state.core.phase==="paused"?"resume":"pause");}
    if(a==="skip-menu"){const v=await choice("跳过范围","跳过会记录，不视为完成",[["set","跳过本组"],["ex","跳过动作"],["cancel","取消（保持暂停）"]]);if(v==="set")return apply("skipSet");if(v==="ex")return action("skip-ex",b);}
    if(a==="skip-set")return apply("skipSet");if(a==="skip-ex"){if(await choice("跳过动作？","该动作剩余组全部标记跳过",[["yes","确认跳过"],["no","取消"]])==="yes")apply("skipExercise");return;}
    if(a==="skip-side")return apply("skipSide");if(a==="skip-rest")return apply("finishRest");if(a==="add-rest")return apply("addRest",15);if(a==="stretch")return apply("enterStretch");if(a==="skip-stretch")return apply("skipStretch");
    if(a==="teach")return teach();if(a==="close-modal"){closeModal();return render();}if(a==="lesson-restart"){const v=$("#lesson-video");if(v){v.currentTime=0;await v.play();}return;}if(a==="lesson-sound"){lessonSound=!lessonSound;const v=$("#lesson-video");if(v)enforceVideo(v);return;}
    if(a==="quit")return quit();if(a==="save-session")return saveSession();
    if(a==="sound-toggle"){const p=prefs();p[b.dataset.key]=!p[b.dataset.key];store.set("fs4_settings",p);stopSounds();$(".sound-controls").outerHTML=soundControls();syncVideo();return;}
    if(a==="check-rest"){const cycle=store.cycle();store.saveHistory({id:`rest-${new Date().toISOString().slice(0,10)}`,date:new Date().toISOString(),dayId:"day5",dayTitle:"休息日",durationSec:0,status:"completed",records:[]},{advance:cycle.index===4,cycleIndex:4});return go("home");}
    if(a==="reset-ex"){const o=store.overrides();delete o[b.dataset.id];store.set("fs4_overrides",o);return renderDay();}
    if(a==="correct"){const hi=b.dataset.history,ri=Number(b.dataset.record),si=Number(b.dataset.side);const h=hi==null?null:store.history(),item=h?.[Number(hi)],records=item?recordsOf(item):state.core.data.records;return number(`修正${sideLabel(records[ri].sides[si].side)}实际${records[ri].sides[si].unit}`,v=>{records[ri].sides[si].actual=v;if(item){item.records=records;delete item.items;store.saveHistory(item);}else saveDraft();render();});}
    if(a==="delete-log"){if(await choice("删除这次历史？","操作不可撤销",[["yes","删除"],["no","取消"]])==="yes"){const h=store.history();h.splice(Number(b.dataset.history),1);store.set("fs4_history",h);renderHistory();}return;}
    if(a==="export"){const blob=new Blob([JSON.stringify(store.exportData())],{type:"application/json"}),url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download="海面四分化备份.json";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
    if(a==="import-file")$("#import-file").click();
  }
  document.addEventListener("click",e=>{const digit=e.target.closest("[data-digit]");if(digit){const display=$("#number-value"),v=digit.dataset.digit;if(v==="save"){if(!display.textContent)return notify("请输入实际数值");const cb=numberSubmit,n=Number(display.textContent);closeModal();guard(()=>cb(n));}else if(v==="clear")display.textContent="";else if(display.textContent.length<4)display.textContent+=v;return;}const c=e.target.closest("[data-choice]");if(c){const resolve=modalResolve;modalResolve=null;closeModal();resolve?.(c.dataset.choice);return;}const b=e.target.closest("[data-action]");if(b)Promise.resolve().then(()=>action(b.dataset.action,b)).catch(error=>{notify(error.message);console.error(error);});});
  document.addEventListener("change",e=>guard(()=>{const input=e.target;if(input.dataset.setting){const p=prefs();p[input.dataset.setting]=input.type==="checkbox"?input.checked:boundedNumber(input.value,p[input.dataset.setting],Number(input.min),Number(input.max),input.dataset.setting!=="tempo");store.set("fs4_settings",p);return;}if(input.dataset.volume){const p=prefs(),n=boundedNumber(input.value,1,0,1);if(input.dataset.volume==="master")p.masterVolume=n;else p.volume[input.dataset.volume]=n;store.set("fs4_settings",p);return;}if(input.dataset.override){const o=store.overrides(),id=input.dataset.id,k=input.dataset.override;o[id]={...o[id],[k]:boundedNumber(input.value,day(state.dayId).exercises.find(x=>x.id===id)[k],Number(input.min),Number(input.max),k!=="tempo")};store.set("fs4_overrides",o);return;}if(input.id==="import-file"&&input.files[0]){const file=input.files[0];input.value="";if(file.size>10*1024*1024)throw Error("备份不能超过10MB");file.text().then(async text=>{const payload=JSON.parse(text),valid=store.validateImport(payload);if(!valid.valid)throw Error(valid.error);const scope=await choice("导入范围",`${payload.history?.length||0}条历史 · 导出于${payload.exportedAt}`,[["history","仅历史"],["settings","仅设置"],["both","历史和设置"],["cancel","取消"]]);if(scope==="cancel")return;const mode=await choice("导入方式","合并去重；覆盖会替换选中类别",[["merge","合并"],["replace","覆盖"],["cancel","取消"]]);if(mode==="cancel")return;if(mode==="replace"&&await choice("确认覆盖？","建议先导出当前数据",[["yes","确认覆盖"],["cancel","取消"]])!=="yes")return;store.importData(payload,{history:scope!=="settings",settings:scope!=="history",mode});notify("导入成功");renderSettings();}).catch(error=>notify(error.message));}}));
  window.addEventListener("hashchange",()=>guard(()=>{if(state.core)return quit();const path=location.hash.slice(2).split("/");if(path[0]==="day"&&PLAN[path[1]])go("day",path[1]);else go(["history","settings","restday"].includes(path[0])?path[0]:"home");}));
  window.addEventListener("pagehide",()=>guard(()=>{if(state.core){state.core.pause();saveDraft();}}));
  guard(()=>{const path=location.hash.slice(2).split("/");if(path[0]==="day"&&PLAN[path[1]]){state.view="day";state.dayId=path[1];}else if(["history","settings","restday"].includes(path[0]))state.view=path[0];render();});
  if("serviceWorker" in navigator&&location.protocol!=="file:")navigator.serviceWorker.register("sw.js").then(reg=>{if(reg.waiting&&!state.core)notify("有新版本，结束训练后重开更新");}).catch(error=>notify(`离线缓存注册失败：${error.message}`));
})();
