const PLAN = {
  day1: { id: "day1", label: "Day 1", title: "胸肌和三头肌", short: "胸 + 三头", exercises: [
    { id: "d1_01", name: "弹力带绕肩激活", part: "热身", sets: 2, repsLabel: "20次", cue: "双手握弹力带两端，手臂伸直从体前绕到体后，感受肩胛活动", equipment: "弹力带" },
    { id: "d1_02", name: "Y字肩胛骨激活", part: "热身", sets: 2, repsLabel: "20次", cue: "俯身双臂举成Y字，收紧肩胛骨再缓慢放下", equipment: "徒手" },
    { id: "d1_03", name: "靠墙倒立预备", part: "热身", sets: 2, repsLabel: "10次", cue: "背对墙手掌撑地，双脚逐步走上墙，核心收紧，量力而行", equipment: "墙面" },
    { id: "d1_04", name: "对握哑铃俯卧撑", part: "胸部", sets: 4, repsLabel: "力竭", cue: "双手对握哑铃撑地做俯卧撑，胸肌发力，做到力竭", equipment: "稳固哑铃", mode: "manual" },
    { id: "d1_05", name: "平板哑铃卧推", part: "胸部", sets: 4, repsLabel: "10-15次", cue: "仰卧，哑铃从胸前推起至手臂接近伸直，缓慢下放", equipment: "哑铃、稳固支撑" },
    { id: "d1_06", name: "双杠臂屈伸", part: "胸部", sets: 4, repsLabel: "10-12次", cue: "身体略前倾，屈肘下放再撑起；确认双杠稳定", equipment: "双杠" },
    { id: "d1_07", name: "哑铃飞鸟", part: "胸部", sets: 4, repsLabel: "12-15次", cue: "仰卧双臂微屈向两侧打开，胸肌收紧合拢", equipment: "哑铃、稳固支撑" },
    { id: "d1_08", name: "颈后哑铃臂屈伸", part: "三头肌", sets: 4, repsLabel: "10-12次/侧", cue: "持哑铃置于颈后，伸直手臂举过头顶，大臂固定", equipment: "哑铃" },
    { id: "d1_09", name: "俯身哑铃臂屈伸", part: "三头肌", sets: 3, repsLabel: "12次/侧", cue: "俯身大臂夹紧身体固定不动，小臂向后伸直", equipment: "哑铃" },
    { id: "s1_01", name: "胸部支撑拉伸", part: "拉伸", sets: 1, repsLabel: "20-30秒/侧", cue: "扶稳墙或沙发，背部挺直，轻缓向前压", equipment: "墙面或稳固支撑" },
    { id: "s1_02", name: "肱三头肌拉伸", part: "拉伸", sets: 1, repsLabel: "20-30秒/侧", cue: "屈肘大臂靠近耳朵，另一只手轻扶肘部，保持呼吸", equipment: "徒手" }
  ] },
  day2: { id: "day2", label: "Day 2", title: "背肌和二头肌", short: "背 + 二头", exercises: [
    { id: "d2_01", name: "静态肘支撑肩胛骨控制", part: "热身", sets: 3, repsLabel: "10次呼吸", cue: "肘撑平板姿势，肩胛骨前引与回收，配合呼吸", equipment: "垫子" },
    { id: "d2_02", name: "动态平板拉锯式移动", part: "热身", sets: 3, repsLabel: "尽量延长", cue: "肘撑平板，身体前后小幅移动，核心全程收紧", equipment: "垫子", mode: "manual", unit: "秒" },
    { id: "d2_03", name: "跪姿健腹轮", part: "背肌", sets: 4, repsLabel: "12次", cue: "跪姿前滚至可控制的距离，收紧腹部拉回，避免腰部塌陷", equipment: "健腹轮、垫子" },
    { id: "d2_04", name: "哑铃单手划船", part: "背肌", sets: 4, repsLabel: "10-15次/侧", cue: "一手一膝撑稳，另一手持哑铃沿体侧向后上方划", equipment: "哑铃、稳固支撑" },
    { id: "d2_05", name: "引体向上", actualExercise: "澳式引体", part: "背肌", sets: 4, repsLabel: "10-12次", cue: "抓稳低杠，身体保持一线，肩胛后收，将胸部拉向杠；确认杠与支架稳固", equipment: "稳固低杠", videoId: null, tutorialUnavailable: true },
    { id: "d2_06", name: "双手哑铃划船", part: "背肌", sets: 4, repsLabel: "10-12次", cue: "俯身双膝微屈，双哑铃沿大腿向后上方划起", equipment: "哑铃" },
    { id: "d2_07", name: "单手哑铃交替弯举", part: "二头肌", sets: 3, repsLabel: "10次/侧", cue: "站姿左右交替弯举，躯干稳定，不摆动借力", equipment: "哑铃", sided: "alternate" },
    { id: "d2_08", name: "垂式哑铃弯举", part: "二头肌", sets: 3, repsLabel: "10-12次/侧", cue: "掌心相对弯举，肘部靠近躯干，控制下放", equipment: "哑铃" },
    { id: "s2_01", name: "背阔肌拉伸", part: "拉伸", sets: 1, repsLabel: "20-30秒/侧", cue: "单手扶稳支撑，身体轻缓向对侧旋转", equipment: "稳固支撑" },
    { id: "s2_02", name: "肱二头肌拉伸", part: "拉伸", sets: 1, repsLabel: "20秒/侧", cue: "手臂扶住支撑，身体缓慢转向对侧，不强压关节", equipment: "稳固支撑" }
  ] },
  day3: { id: "day3", label: "Day 4", title: "大腿和小腿", short: "腿", exercises: [
    { id: "d3_01", name: "伟大的伸展", part: "热身", sets: 3, repsLabel: "15次", cue: "弓步双手撑地，胸椎旋转打开，左右交替", equipment: "垫子" },
    { id: "d3_02", name: "臀部行走", part: "热身", sets: 1, repsLabel: "来回5次", cue: "坐姿双腿前伸，用臀部交替向前行走", equipment: "垫子" },
    { id: "d3_03", name: "哥本哈根支撑", part: "大腿", sets: 3, repsLabel: "30秒/侧", cue: "侧撑，上侧腿搭稳固支撑，抬起髋部并保持", equipment: "稳固支撑、垫子" },
    { id: "d3_04", name: "单腿臀桥", part: "大腿", sets: 3, repsLabel: "12-15次", cue: "仰卧一腿抬起，支撑腿发力顶髋，左右分别完成", equipment: "垫子", sided: "single" },
    { id: "d3_05", name: "反向保加利亚蹲", part: "大腿", sets: 4, repsLabel: "8-10次/侧", cue: "后脚搭稳固支撑，前腿下蹲，膝盖朝脚尖方向", equipment: "哑铃、稳固支撑" },
    { id: "d3_06", name: "颈前深蹲", part: "大腿", sets: 4, repsLabel: "12-15次", cue: "哑铃托于胸前，下蹲时膝盖对齐脚尖方向", equipment: "哑铃" },
    { id: "d3_07", name: "哑铃直腿硬拉", part: "大腿", sets: 4, repsLabel: "10-12次", cue: "双膝微屈髋部后移，哑铃沿腿下放，臀腿后侧发力起身", equipment: "哑铃" },
    { id: "d3_08", name: "站姿提踵", part: "小腿", sets: 3, repsLabel: "15-18次", cue: "抬起脚跟至最高点稍停，缓慢下放，可持哑铃", equipment: "哑铃（可选）" },
    { id: "s3_01", name: "跪姿股四头肌拉伸", part: "拉伸", sets: 1, repsLabel: "20-30秒/侧", cue: "跪姿轻扶脚踝，重心缓慢前移，避免腰部过伸", equipment: "垫子" },
    { id: "s3_02", name: "坐姿体前屈", part: "拉伸", sets: 1, repsLabel: "30秒", cue: "坐姿双腿伸直，轻柔前屈，不要强压膝关节", equipment: "垫子" },
    { id: "s3_03", name: "鸽子式臀部拉伸", part: "拉伸", sets: 1, repsLabel: "30秒/侧", cue: "前后腿摆稳，身体轻缓前倾，保持自然呼吸", equipment: "垫子" }
  ] },
  day4: { id: "day4", label: "Day 3", title: "肩部、手臂和腹肌", short: "肩 + 手臂 + 腹", exercises: [
    { id: "d4_01", name: "弹力带肩部环绕", part: "热身", sets: 2, repsLabel: "20次", cue: "双手握弹力带从体前绕到体后，肩关节全程放松", equipment: "弹力带" },
    { id: "d4_02", name: "仰卧Y字动态训练", part: "热身", sets: 2, repsLabel: "20次", cue: "仰卧双臂举过头顶成Y字再收回体侧", equipment: "垫子" },
    { id: "d4_03", name: "哑铃俯身飞鸟", part: "肩部", sets: 4, repsLabel: "12-15次", cue: "俯身双臂微屈向两侧飞起，肩后束发力", equipment: "哑铃" },
    { id: "d4_04", name: "哑铃推肩", part: "肩部", sets: 4, repsLabel: "10-12次", cue: "哑铃从肩侧推至头顶，不要完全锁死肘关节", equipment: "哑铃" },
    { id: "d4_05", name: "哑铃前平举（对握）", part: "肩部", sets: 4, repsLabel: "10-12次", cue: "对握哑铃前平举至肩高，控制下放速度", equipment: "哑铃" },
    { id: "d4_06", name: "哑铃侧平举", part: "肩部", sets: 4, repsLabel: "10-12次", cue: "双臂微屈向两侧抬至肩高，不要耸肩借力", equipment: "哑铃" },
    { id: "d4_07", name: "哑铃交替弯举", part: "手臂超级组", sets: 4, repsLabel: "8-10次/侧", cue: "超级组A：左右交替弯举后衔接颈后臂屈伸，中间不正式休息", equipment: "哑铃", sided: "alternate", supersetWith: "d4_08" },
    { id: "d4_08", name: "哑铃颈后臂屈伸", part: "手臂超级组", sets: 4, repsLabel: "12次", cue: "超级组B：大臂稳定，完成后才进入组间歇", equipment: "哑铃" },
    { id: "d4_09", name: "卷腹", part: "腹肌", sets: 3, repsLabel: "15次", cue: "仰卧屈膝，上背抬起即可，颈部放松不要借力", equipment: "垫子", isAbs: true },
    { id: "d4_10", name: "单腿提膝（登山者）", part: "腹肌", sets: 3, repsLabel: "20次", cue: "平板支撑，左右交替提膝，核心稳定", equipment: "垫子", isAbs: true },
    { id: "d4_11", name: "平板/侧向平板支撑", part: "腹肌", sets: 3, repsLabel: "30秒", cue: "肘撑保持身体成一线，做不了可缩短时间", equipment: "垫子", isAbs: true },
    { id: "s4_01", name: "肩部交叉拉伸", part: "拉伸", sets: 1, repsLabel: "20-30秒/侧", cue: "一手轻扶另一侧肘关节，缓慢向对侧拉伸", equipment: "徒手" }
  ] },
  day5: { id: "day5", label: "Day 5", title: "休息日", short: "恢复", exercises: [] }
};
const DAY_ORDER = ["day1", "day2", "day4", "day3", "day5"];
function boundedNumber(value, fallback, min, max, integer = false) {
  const n = Number(value);
  if (value === "" || value == null || !Number.isFinite(n)) return fallback;
  const bounded = Math.max(min, Math.min(max, n));
  return integer ? Math.round(bounded) : bounded;
}
function getDayData(dayId, preferences = {}, overrides = {}) {
  const day = PLAN[dayId];
  if (!day) return null;
  return { ...day, exercises: day.exercises.filter(ex => !ex.isAbs || preferences.absEnabled !== false).map(ex => {
    const o = overrides[ex.id] && typeof overrides[ex.id] === "object" ? overrides[ex.id] : {};
    const repsLabel = typeof o.repsLabel === "string" && o.repsLabel.trim() ? o.repsLabel.trim() : ex.repsLabel;
    const inferredMode = ex.mode || (/力竭|尽量延长/.test(repsLabel) ? "manual" : /秒/.test(repsLabel) ? "timed" : "reps");
    const mode = ["reps", "timed", "manual"].includes(o.mode) ? o.mode : inferredMode;
    const inferredSided = ex.sided || (/\/侧/.test(repsLabel) ? "single" : "none");
    const sided = ["none", "single", "alternate"].includes(o.sided) ? o.sided : inferredSided;
    const first = Number((repsLabel.match(/\d+/) || [0])[0]);
    const fallbackTarget = mode === "timed" ? boundedNumber(preferences.hold, 25, 1, 3600, true) : /\d+\s*[-~—–]\s*\d+/.test(repsLabel) ? 12 : first || 12;
    const target = boundedNumber(o.target, fallbackTarget, 1, mode === "timed" ? 3600 : 99, true);
    return { ...ex, repsLabel, mode, sided, target: mode === "manual" ? null : target,
      unit: ex.unit || (mode === "timed" ? "秒" : "次"),
      sets: boundedNumber(o.sets, ex.sets, 1, 10, true),
      rest: boundedNumber(o.rest, preferences.rest == null ? 90 : preferences.rest, 0, 600, true),
      tempo: boundedNumber(o.tempo, preferences.tempo == null ? 2.5 : preferences.tempo, 0.5, 10),
      videoId: ex.videoId === null ? null : ex.id,
      actualExercise: ex.actualExercise || ex.name,
      tutorial: { steps: ex.steps || ex.cue, mistakes: ex.mistakes || "保持稳定，避免借力；如有不适立即停止。", equipment: ex.equipment || "徒手", source: ex.videoId === null ? null : `videos/clips/${ex.id}.mp4` }
    };
  }) };
}
