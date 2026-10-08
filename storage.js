const WorkoutStore = (() => {
  const KEYS = { settings: "fs4_settings", overrides: "fs4_overrides", history: "fs4_history", cycle: "fs4_cycle", draft: "fs4_draft", schema: "fs4_schema" };
  const SEQUENCE = ["day1", "day2", "day4", "day3", "day5"];
  const DEFAULTS = { rest: 90, tempo: 2.5, hold: 25, absEnabled: true, videoSound: false, rhythmSound: true, voiceCount: true, masterVolume: 1, volume: { video: .75, rhythm: 1, voice: 1 } };
  const DAY_TITLES = { day1: "胸肌和三头肌", day2: "背肌和二头肌", day3: "大腿和小腿", day4: "肩部、手臂和腹肌", day5: "休息日" };
  const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const isObject = value => value !== null && typeof value === "object" && !Array.isArray(value);
  const clone = value => JSON.parse(JSON.stringify(value));
  function read(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); }
    catch (error) { throw new Error(`读取 ${key} 失败: ${error.message}`); }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (error) { throw new Error(`写入 ${key} 失败: ${error.message}`); }
  }
  function remove(key) {
    try { localStorage.removeItem(key); }
    catch (error) { throw new Error(`删除 ${key} 失败: ${error.message}`); }
  }
  function get(key, fallback) { return read(key, fallback); }
  function set(key, value) { write(key, value); return value; }
  function settings() {
    const saved = read(KEYS.settings, {});
    if (!isObject(saved)) throw new Error("设置数据结构无效");
    const value = Object.fromEntries(Object.entries(DEFAULTS).filter(([key]) => key !== "volume").map(([key, fallback]) => [key, saved[key] === undefined ? fallback : saved[key]]));
    const volume = isObject(saved.volume) ? saved.volume : {};
    for (const [key, flat] of [["video", "videoVolume"], ["rhythm", "rhythmVolume"], ["voice", "voiceVolume"]]) {
      const raw = volume[key] === undefined ? saved[flat] : volume[key];
      value.volume = value.volume || { ...DEFAULTS.volume };
      if (raw !== undefined) value.volume[key] = raw;
    }
    if (!value.volume) value.volume = { ...DEFAULTS.volume };
    if (saved.onboardingDone !== undefined) value.onboardingDone = saved.onboardingDone;
    if (!validSettings(value)) throw new Error("设置数据数值或字段无效");
    return value;
  }
  function overrides() { const value = read(KEYS.overrides, {}); if (!isObject(value)) throw new Error("动作覆盖数据结构无效"); return value; }
  function stableId(item, index) {
    if (typeof item.id === "string" && item.id.trim()) return item.id;
    const source = JSON.stringify([item.date || "", item.dayId || "", item.dayTitle || "", item.durationSec || 0, item.items || []]);
    let hash = 2166136261;
    for (let i = 0; i < source.length; i++) { hash ^= source.charCodeAt(i); hash = Math.imul(hash, 16777619); }
    return `legacy-${(hash >>> 0).toString(16).padStart(8, "0")}`;
  }
  function history() {
    const value = read(KEYS.history, []);
    if (!Array.isArray(value)) throw new Error("训练历史数据结构无效");
    return value.map((item, index) => isObject(item) ? { ...item, id: stableId(item, index) } : item);
  }
  function cycle() {
    const saved = read(KEYS.cycle, null);
    if (saved !== null) {
      if (!isObject(saved) || !Number.isInteger(saved.index) || saved.index < 0 || saved.index >= SEQUENCE.length || !Array.isArray(saved.advancedIds)) throw new Error("训练周期数据结构无效");
      return { index: saved.index, sequence: SEQUENCE.slice(), advancedIds: [...new Set(saved.advancedIds.filter(id => typeof id === "string"))] };
    }
    const old = read(KEYS.history, []);
    if (!Array.isArray(old)) throw new Error("训练历史数据结构无效");
    const last = old.find(item => isObject(item) && SEQUENCE.includes(item.dayId));
    const index = last ? (SEQUENCE.indexOf(last.dayId) + 1) % SEQUENCE.length : 0;
    const value = { index, sequence: SEQUENCE.slice(), advancedIds: [] };
    write(KEYS.cycle, value);
    return value;
  }
  function saveHistory(item, options = {}) {
    if (!isObject(item) || typeof item.id !== "string" || !item.id) throw new Error("history item 必须含非空 id");
    const records = history();
    const currentCycle = cycle();
    const position = records.findIndex(record => record && record.id === item.id);
    if (position < 0) records.unshift(clone(item));
    else records[position] = clone(item);
    write(KEYS.history, records);
    if (options.advance === true && Number.isInteger(options.cycleIndex) && !currentCycle.advancedIds.includes(item.id)) {
      if (options.cycleIndex === currentCycle.index && item.dayId === SEQUENCE[currentCycle.index]) {
        currentCycle.advancedIds.push(item.id);
        currentCycle.index = (currentCycle.index + 1) % SEQUENCE.length;
        write(KEYS.cycle, currentCycle);
      }
    }
    return records;
  }
  function saveDraft(value) { write(KEYS.draft, value); return value; }
  function draft() { return read(KEYS.draft, null); }
  function clearDraft() { remove(KEYS.draft); }
  function exportData() { return { schema: 2, exportedAt: new Date().toISOString(), history: history(), settings: settings(), overrides: overrides(), cycle: cycle() }; }
  const SETTINGS_FIELDS = new Set(["rest", "tempo", "hold", "absEnabled", "videoSound", "rhythmSound", "voiceCount", "masterVolume", "volume", "onboardingDone", "videoVolume", "rhythmVolume", "voiceVolume"]);
  const OVERRIDE_FIELDS = new Set(["sets", "target", "rest", "tempo", "repsLabel", "mode", "sided", "unit"]);
  function safeTree(value) {
    if (typeof value === "string") return !/[<>]/.test(value) && !/(?:https?:|javascript:|data:|\.mp4|<\/?video)/i.test(value);
    if (Array.isArray(value)) return value.every(safeTree);
    if (!isObject(value)) return true;
    return Object.keys(value).every(key => !["__proto__", "prototype", "constructor"].includes(key) && safeTree(value[key]));
  }
  function validSettings(value) {
    if (!isObject(value) || Object.keys(value).some(key => !SETTINGS_FIELDS.has(key))) return false;
    for (const key of ["rest"]) if (own(value, key) && (!Number.isInteger(value[key]) || value[key] < 0 || value[key] > 600)) return false;
    if (own(value, "hold") && (!Number.isInteger(value.hold) || value.hold < 1 || value.hold > 3600)) return false;
    if (own(value, "tempo") && (typeof value.tempo !== "number" || !Number.isFinite(value.tempo) || value.tempo < .5 || value.tempo > 10)) return false;
    for (const key of ["absEnabled", "videoSound", "rhythmSound", "voiceCount", "onboardingDone"]) if (own(value, key) && typeof value[key] !== "boolean") return false;
    for (const key of ["masterVolume"]) if (own(value, key) && (typeof value[key] !== "number" || value[key] < 0 || value[key] > 1)) return false;
    if (own(value, "volume")) { if (!isObject(value.volume) || Object.keys(value.volume).some(k => !["video", "rhythm", "voice"].includes(k))) return false; if (Object.values(value.volume).some(n => typeof n !== "number" || n < 0 || n > 1)) return false; }
    return true;
  }
  function validOverrides(value) {
    if (!isObject(value)) return false;
    return Object.entries(value).every(([id, fields]) => /^[a-z][a-z0-9_]{1,30}$/i.test(id) && isObject(fields) && Object.keys(fields).every(k => OVERRIDE_FIELDS.has(k)) &&
      (!own(fields, "sets") || Number.isInteger(fields.sets) && fields.sets >= 1 && fields.sets <= 10) &&
      (!own(fields, "target") || Number.isInteger(fields.target) && fields.target >= 1 && fields.target <= 3600) &&
      (!own(fields, "rest") || Number.isInteger(fields.rest) && fields.rest >= 0 && fields.rest <= 600) &&
      (!own(fields, "tempo") || typeof fields.tempo === "number" && Number.isFinite(fields.tempo) && fields.tempo >= .5 && fields.tempo <= 10) &&
      (!own(fields, "mode") || ["reps", "timed", "manual"].includes(fields.mode)) && (!own(fields, "sided") || ["none", "single", "alternate"].includes(fields.sided)) &&
      (!own(fields, "repsLabel") || typeof fields.repsLabel === "string" && fields.repsLabel.length <= 100) && (!own(fields, "unit") || typeof fields.unit === "string" && fields.unit.length <= 10));
  }
  function validHistoryRecord(item) {
    if (!isObject(item) || Object.keys(item).some(k => !["id", "date", "dayId", "dayTitle", "durationSec", "status", "items", "records", "startedAt", "completedAt", "cycleIndex"].includes(k))) return false;
    if (typeof item.id !== "string" || !/^[\w-]{1,100}$/.test(item.id) || !/^day[1-5]$/.test(item.dayId) || typeof item.dayTitle !== "string" || item.dayTitle.length > 100) return false;
    if (typeof item.date !== "string" || !Number.isFinite(Date.parse(item.date)) || !/^\d{4}-\d\d-\d\dT/.test(item.date)) return false;
    if (!Number.isInteger(item.durationSec) || item.durationSec < 0 || item.durationSec > 604800) return false;
    if (own(item, "startedAt") && (!Number.isFinite(item.startedAt) || item.startedAt < 0) || own(item, "completedAt") && item.completedAt !== null && (!Number.isFinite(item.completedAt) || item.completedAt < 0)) return false;
    if (own(item, "cycleIndex") && item.cycleIndex !== null && (!Number.isInteger(item.cycleIndex) || item.cycleIndex < 0 || item.cycleIndex >= SEQUENCE.length)) return false;
    if (own(item, "status") && !["completed", "partial", "unfinished"].includes(item.status)) return false;
    if (own(item, "records") && own(item, "items")) return false;
    if (own(item, "records")) return Array.isArray(item.records) && item.records.length <= 1000 && item.records.every(record => {
      if (!isObject(record) || Object.keys(record).some(k => !["exerciseId", "exerciseName", "planName", "part", "setIndex", "status", "mode", "target", "sides", "at"].includes(k))) return false;
      if (typeof record.exerciseId !== "string" || record.exerciseId.length > 50 || typeof record.exerciseName !== "string" || record.exerciseName.length > 100 || typeof record.planName !== "string" || record.planName.length > 100 || typeof record.part !== "string" || record.part.length > 50) return false;
      if (!Number.isInteger(record.setIndex) || record.setIndex < 0 || !["completed", "skipped", "unfinished"].includes(record.status) || !["reps", "timed", "manual"].includes(record.mode)) return false;
      if (record.target !== null && (!Number.isInteger(record.target) || record.target < 1 || record.target > 3600) || !Number.isFinite(record.at) || record.at < 0) return false;
      return Array.isArray(record.sides) && record.sides.length <= 2 && record.sides.every(side => isObject(side) && Object.keys(side).every(k => ["side", "target", "rhythm", "actual", "unit", "status"].includes(k)) &&
        ["left", "right", null].includes(side.side) && (side.target === null || Number.isInteger(side.target) && side.target >= 1 && side.target <= 3600) && Number.isInteger(side.rhythm) && side.rhythm >= 0 && (side.actual === null || Number.isFinite(side.actual) && side.actual >= 0) && ["次", "秒"].includes(side.unit) && ["completed", "skipped", "unfinished"].includes(side.status));
    });
    if (!own(item, "items") || !Array.isArray(item.items) || item.items.length > 200) return false;
    return item.items.every(entry => isObject(entry) && Object.keys(entry).every(k => ["id", "name", "sets", "repsLabel"].includes(k)) && typeof entry.id === "string" && entry.id.length <= 50 && typeof entry.name === "string" && entry.name.length <= 100 && (!own(entry, "repsLabel") || typeof entry.repsLabel === "string" && entry.repsLabel.length <= 100) && Array.isArray(entry.sets) && entry.sets.length <= 100 && entry.sets.every(set => {
      if (typeof set === "string") return set.length <= 100;
      return isObject(set) && Object.keys(set).every(k => ["reps", "target", "status", "side", "unit", "repsLabel"].includes(k)) &&
        (typeof set.reps === "string" && set.reps.length <= 100 || typeof set.reps === "number" && Number.isFinite(set.reps)) &&
        (!own(set, "target") || Number.isInteger(set.target) && set.target >= 0 && set.target <= 3600) && (!own(set, "status") || ["completed", "skipped", "unfinished"].includes(set.status)) &&
        (!own(set, "side") || ["left", "right", null].includes(set.side)) && (!own(set, "unit") || ["次", "秒"].includes(set.unit)) && (!own(set, "repsLabel") || typeof set.repsLabel === "string" && set.repsLabel.length <= 100);
    }));
  }
  function validateImport(payload) {
    try {
      const text = JSON.stringify(payload);
      if (text.length > 10 * 1024 * 1024) return { valid: false, error: "导入数据超过 10MB" };
      if (!isObject(payload) || payload.schema !== 2 || !safeTree(payload) || Object.keys(payload).some(k => !["schema", "exportedAt", "history", "settings", "overrides", "cycle"].includes(k))) return { valid: false, error: "导入文件结构或 schema 无效" };
      if (typeof payload.exportedAt !== "string" || !Number.isFinite(Date.parse(payload.exportedAt))) return { valid: false, error: "导出日期无效" };
      if (own(payload, "history") && (!Array.isArray(payload.history) || payload.history.length > 10000 || !payload.history.every(validHistoryRecord))) return { valid: false, error: "历史记录结构无效或超过 10000 条" };
      if (own(payload, "settings") && !validSettings(payload.settings)) return { valid: false, error: "设置字段或数值无效" };
      if (own(payload, "overrides") && !validOverrides(payload.overrides)) return { valid: false, error: "动作覆盖字段无效" };
      if (own(payload, "cycle") && (!isObject(payload.cycle) || Object.keys(payload.cycle).some(k => !["index", "sequence", "advancedIds"].includes(k)) || !Number.isInteger(payload.cycle.index) || payload.cycle.index < 0 || payload.cycle.index >= SEQUENCE.length || JSON.stringify(payload.cycle.sequence) !== JSON.stringify(SEQUENCE) || !Array.isArray(payload.cycle.advancedIds) || !payload.cycle.advancedIds.every(id => typeof id === "string" && id.length <= 100))) return { valid: false, error: "周期数据无效" };
      return { valid: true, data: payload };
    } catch (error) { return { valid: false, error: error.message || "导入数据无效" }; }
  }
  function importData(payload, options = {}) {
    const validation = validateImport(payload);
    if (!validation.valid) throw new Error(validation.error);
    const selected = { history: options.history !== false, settings: options.settings !== false };
    const mode = options.mode || "merge";
    if (!["merge", "replace"].includes(mode)) throw new Error("导入模式必须为 merge 或 replace");
    const updates = {};
    if (selected.history && own(payload, "history")) {
      const incoming = payload.history.map((item, i) => ({ ...item, id: stableId(item, i) }));
      updates[KEYS.history] = mode === "replace" ? incoming : [...incoming, ...history().filter(old => !incoming.some(item => item.id === old.id))];
    }
    if (selected.settings) {
      if (own(payload, "settings")) updates[KEYS.settings] = mode === "replace" ? { ...DEFAULTS, ...payload.settings } : { ...settings(), ...payload.settings, volume: { ...settings().volume, ...(payload.settings.volume || {}) } };
      if (own(payload, "overrides")) updates[KEYS.overrides] = mode === "replace" ? payload.overrides : { ...overrides(), ...payload.overrides };
      if (mode === "replace" && own(payload, "cycle")) updates[KEYS.cycle] = payload.cycle;
    }
    const prior = {};
    for (const key of Object.keys(updates)) prior[key] = localStorage.getItem(key);
    try { for (const [key, value] of Object.entries(updates)) write(key, value); }
    catch (error) {
      for (const [key, value] of Object.entries(prior)) { try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch (rollbackError) { error.message += `; 回滚 ${key} 失败: ${rollbackError.message}`; } }
      throw error;
    }
    return { history: selected.history && own(payload, "history"), settings: selected.settings && (own(payload, "settings") || own(payload, "overrides")), mode };
  }
  return { get, set, remove, settings, overrides, history, cycle, saveHistory, saveDraft, draft, clearDraft, exportData, validateImport, importData };
})();
