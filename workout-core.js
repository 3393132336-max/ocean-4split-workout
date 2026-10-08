class WorkoutCore {
  constructor(day, options = {}, saved = null) {
    this.options = { preparation: 3000, buffer: 2000, rest: 60000, ...options };
    this.data = saved || {
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      dayId: day.id, dayTitle: day.title, exercises: day.exercises,
      exerciseIndex: 0, setIndex: 0, side: 'left', phase: 'ready',
      count: 0, elapsed: 0, remaining: 0, overTarget: false,
      pausedPhase: null, currentSides: [], records: [], events: [],
      startedAt: Date.now(), activeMs: 0, completedAt: null
    };
    this.data.exercises = this.data.exercises || day.exercises;
    if (!this.data.events) this.data.events = [];
    this.data.events.length = 0;
    this.data.currentSides ||= [];
  }

  get exercise() { return this.data.exercises[this.data.exerciseIndex]; }
  get phase() { return this.data.phase; }
  snapshot() {
    const snapshot = JSON.parse(JSON.stringify(this.data));
    delete snapshot.events;
    return snapshot;
  }
  emit(type, detail = {}) { this.data.events.push({ type, ...detail }); }
  consumeEvents() { return this.data.events.splice(0); }
  setPhase(phase, remaining = 0) {
    this.data.phase = phase;
    this.data.remaining = remaining;
  }

  start() {
    if (this.phase !== 'ready') return false;
    this.data.count = 0;
    this.data.elapsed = 0;
    this.data.overTarget = false;
    this.setPhase('preparing', this.options.preparation);
    this.emit('preparing');
    return true;
  }

  tick(delta) {
    if (!Number.isFinite(delta) || delta <= 0) return;
    if (this.phase === 'paused' || this.phase === 'ready' || this.phase === 'transition' || this.phase === 'complete') return;
    if (delta > 5000 && this.phase !== 'rest') {
      this.pause();
      this.emit('backgroundInterrupted');
      return;
    }
    if (this.phase === 'preparing' || this.phase === 'buffer' || this.phase === 'rest') {
      const phase = this.phase;
      this.data.remaining = Math.max(0, this.data.remaining - delta);
      if (this.data.remaining > 0) return;
      if (phase === 'preparing') { this.setPhase('active'); this.emit('start'); }
      else if (phase === 'buffer') this.finish();
      else { this.setPhase('ready'); this.emit('restEnd'); }
      return;
    }
    if (this.phase !== 'active' || !this.exercise) return;
    const ex = this.exercise;
    this.data.elapsed += delta;
    this.data.activeMs += delta;
    if (ex.mode === 'manual') {
      if (ex.unit === '秒') this.data.count = Math.floor(this.data.elapsed / 1000);
      this.emit('tick', { count: this.data.count, elapsed: this.data.elapsed });
      return;
    }
    const interval = ex.mode === 'timed' ? 1000 : Math.max(500, ex.tempo * 1000);
    const required = ex.mode === 'reps' && ex.sided === 'alternate' ? ex.target * 2 : ex.target;
    const value = Math.floor(this.data.elapsed / interval);
    if (value > this.data.count) {
      this.data.count = value;
      this.emit('count', { count: value, side: ex.sided === 'alternate' ? (value % 2 ? 'left' : 'right') : this.data.side });
    }
    this.emit('tick', { count: this.data.count, elapsed: this.data.elapsed });
    if (!this.data.overTarget && this.data.count >= required) {
      this.setPhase('buffer', this.options.buffer);
      this.emit('target', { count: required });
    }
  }

  continueBeyondTarget() {
    if (this.phase !== 'buffer') return false;
    this.data.overTarget = true;
    this.setPhase('active');
    this.emit('continue');
    return true;
  }

  finish(actual = null) {
    if (!this.exercise || !['active', 'buffer'].includes(this.phase)) return false;
    const ex = this.exercise;
    if (ex.mode === 'manual' && actual == null) return false;
    const side = ex.sided === 'single' ? this.data.side : null;
    const recordedActual = actual == null ? (ex.mode === 'timed' ? Math.floor(this.data.elapsed / 1000) : null) : Math.max(0, Math.floor(Number(actual) || 0));
    const recordUnit = ex.unit || (ex.mode === 'timed' ? '秒' : '次');
    if (ex.sided === 'alternate') {
      this.data.currentSides = ['left', 'right'].map((s, i) => ({ side: s, target: ex.target, rhythm: i === 0 ? Math.ceil(this.data.count / 2) : Math.floor(this.data.count / 2), actual: null, unit: recordUnit, status: 'completed' }));
    } else this.data.currentSides.push({ side, target: ex.target, rhythm: this.data.count, actual: recordedActual, unit: recordUnit, status: 'completed' });
    if (ex.sided === 'single' && side === 'left') {
      this.data.side = 'right';
      this.data.count = 0; this.data.elapsed = 0; this.data.overTarget = false;
      this.setPhase('preparing', this.options.preparation);
      this.emit('sideChange', { side: 'right' });
      this.emit('preparing');
      return true;
    }
    this.finishSet();
    return true;
  }

  switchSide() {
    if (!this.exercise || this.exercise.sided !== 'single' || !['active', 'ready', 'preparing', 'buffer', 'paused'].includes(this.phase)) return false;
    const wasPaused = this.phase === 'paused';
    const phaseBeforePause = wasPaused ? this.data.pausedPhase : this.phase;
    const remaining = this.data.remaining;
    const side = this.data.side;
    this.data.currentSides.push({ side, target: this.exercise.target, rhythm: this.data.count, actual: null, unit: this.exercise.unit, status: 'skipped' });
    if (side === 'left') {
      this.data.side = 'right';
      this.data.count = 0; this.data.elapsed = 0; this.data.overTarget = false;
      if (wasPaused) {
        this.data.pausedPhase = 'preparing';
        this.data.remaining = phaseBeforePause === 'preparing' ? remaining : this.options.preparation;
      } else this.setPhase('preparing', this.options.preparation);
      this.emit('sideChange', { side: 'right', skipped: true });
      this.emit('preparing');
    } else this.finishSet();
    return true;
  }

  skipSide() {
    if (!this.exercise || this.exercise.sided !== 'single' || !['ready', 'preparing', 'active', 'buffer', 'paused'].includes(this.phase)) return false;
    return this.switchSide();
  }

  skipSet() {
    if (!this.exercise || !['ready', 'preparing', 'active', 'buffer', 'paused'].includes(this.phase)) return false;
    const ex = this.exercise;
    if (ex.sided === 'single') {
      const covered = new Set(this.data.currentSides.map(s => s.side));
      for (const side of ['left', 'right']) if (!covered.has(side)) this.data.currentSides.push({ side, target: ex.target, rhythm: side === this.data.side ? this.data.count : 0, actual: null, unit: ex.unit, status: 'skipped' });
    } else if (ex.sided === 'alternate') {
      for (const side of ['left', 'right']) this.data.currentSides.push({ side, target: ex.target, rhythm: side === 'left' ? Math.ceil(this.data.count / 2) : Math.floor(this.data.count / 2), actual: null, unit: ex.unit, status: 'skipped' });
    } else this.data.currentSides.push({ side: null, target: ex.target, rhythm: this.data.count, actual: null, unit: ex.unit, status: 'skipped' });
    this.finishSet();
    return true;
  }

  skipExercise() {
    if (!this.exercise || !['ready', 'preparing', 'active', 'buffer', 'paused'].includes(this.phase)) return false;
    const index = this.data.exerciseIndex;
    const ex = this.exercise;
    const currentSet = this.data.setIndex;
    const covered = new Set(this.data.currentSides.map(s => s.side));
    if (ex.sided === 'single') {
      for (const side of ['left', 'right']) if (!covered.has(side)) this.data.currentSides.push({ side, target: ex.target, rhythm: side === this.data.side ? this.data.count : 0, actual: null, unit: ex.unit, status: 'skipped' });
    } else if (ex.sided === 'alternate') {
      for (const side of ['left', 'right']) if (!covered.has(side)) this.data.currentSides.push({ side, target: ex.target, rhythm: side === 'left' ? Math.ceil(this.data.count / 2) : Math.floor(this.data.count / 2), actual: null, unit: ex.unit, status: 'skipped' });
    } else if (!this.data.currentSides.length) {
      this.data.currentSides.push({ side: null, target: ex.target, rhythm: this.data.count, actual: null, unit: ex.unit, status: 'skipped' });
    }
    if (!this.data.records.some(record => record.exerciseId === ex.id && record.setIndex === currentSet)) this.writeCurrentSet(ex, currentSet);
    for (let setIndex = currentSet + 1; setIndex < ex.sets; setIndex++) if (!this.data.records.some(record => record.exerciseId === ex.id && record.setIndex === setIndex)) this.writeSkippedSet(ex, setIndex);
    this.data.currentSides = [];
    this.data.side = 'left'; this.data.count = 0; this.data.elapsed = 0; this.data.overTarget = false;
    const next = this.nextCursor();
    if (next) {
      this.data.exerciseIndex = next.exerciseIndex;
      this.data.setIndex = next.setIndex;
      this.setPhase('ready'); this.emit('ready');
    } else {
      this.setPhase('complete'); this.data.completedAt = Date.now(); this.emit('complete');
    }
    this.emit('exerciseSkipped', { index });
    return true;
  }

  writeCurrentSet(ex, setIndex) {
    const skipped = this.data.currentSides.some(side => side.status === 'skipped');
    this.data.records.push({ exerciseId: ex.id, exerciseName: ex.actualExercise || ex.name, planName: ex.name, part: ex.part,
      setIndex, status: skipped ? 'skipped' : 'completed', mode: ex.mode, target: ex.target,
      sides: [...this.data.currentSides], at: Date.now() });
    this.emit('setEnd', { exerciseId: ex.id, skipped });
  }

  writeSkippedSet(ex, setIndex) {
    const sides = ex.sided === 'single' || ex.sided === 'alternate'
      ? ['left', 'right'].map(side => ({ side, target: ex.target, rhythm: 0, actual: null, unit: ex.unit, status: 'skipped' }))
      : [{ side: null, target: ex.target, rhythm: 0, actual: null, unit: ex.unit, status: 'skipped' }];
    this.data.records.push({ exerciseId: ex.id, exerciseName: ex.actualExercise || ex.name, planName: ex.name, part: ex.part,
      setIndex, status: 'skipped', mode: ex.mode, target: ex.target, sides, at: Date.now() });
  }

  finishSet() {
    const ex = this.exercise;
    this.writeCurrentSet(ex, this.data.setIndex);
    const previous = ex;
    this.data.currentSides = [];
    this.data.side = 'left'; this.data.count = 0; this.data.elapsed = 0; this.data.overTarget = false;
    const next = this.nextCursor();
    if (!next) {
      this.setPhase('complete'); this.data.completedAt = Date.now(); this.emit('complete');
      return;
    }
    this.data.exerciseIndex = next.exerciseIndex;
    this.data.setIndex = next.setIndex;
    const upcoming = this.exercise;
    if (upcoming.part === '拉伸' && previous.part !== '拉伸') {
      this.setPhase('transition'); this.emit('stretchTransition'); return;
    }
    if (previous.part === '热身' || previous.part === '拉伸' || upcoming.part === '拉伸' || previous.supersetWith === upcoming.id) {
      this.setPhase('ready'); this.emit('ready'); return;
    }
    const seconds = Math.max(0, Number(previous.rest ?? this.options.rest / 1000));
    if (!seconds) { this.setPhase('ready'); this.emit('ready'); return; }
    this.setPhase('rest', seconds * 1000);
    this.emit('rest', { seconds });
  }

  nextCursor() {
    const ex = this.exercise;
    const tasks = [];
    const paired = new Set();
    const completed = task => this.data.records.some(r => r.exerciseId === this.data.exercises[task.exerciseIndex].id && r.setIndex === task.setIndex);
    for (let i = 0; i < this.data.exercises.length; i++) {
      if (paired.has(i)) continue;
      const candidate = this.data.exercises[i];
      if (candidate.supersetWith) {
        const partnerIndex = this.data.exercises.findIndex(e => e.id === candidate.supersetWith);
        const partner = this.data.exercises[partnerIndex];
        if (partner) {
          paired.add(i); paired.add(partnerIndex);
          for (let setIndex = 0; setIndex < Math.max(candidate.sets, partner.sets); setIndex++) {
            if (setIndex < candidate.sets) tasks.push({ exerciseIndex: i, setIndex });
            if (setIndex < partner.sets) tasks.push({ exerciseIndex: partnerIndex, setIndex });
          }
          continue;
        }
      }
      for (let setIndex = 0; setIndex < candidate.sets; setIndex++) tasks.push({ exerciseIndex: i, setIndex });
    }
    const currentPosition = tasks.findIndex(task => task.exerciseIndex === this.data.exerciseIndex && task.setIndex === this.data.setIndex);
    return (currentPosition < 0 ? tasks : tasks.slice(currentPosition + 1)).find(task => !completed(task)) || null;
  }

  enterStretch() { if (this.phase !== 'transition') return false; this.setPhase('ready'); this.emit('ready'); return true; }
  skipStretch() {
    if (this.phase !== 'transition') return false;
    for (const ex of this.data.exercises.slice(this.data.exerciseIndex)) {
      if (ex.part !== '拉伸') continue;
      for (let i = 0; i < ex.sets; i++) this.data.records.push({ exerciseId: ex.id, exerciseName: ex.actualExercise || ex.name, planName: ex.name, part: ex.part, setIndex: i, status: 'skipped', mode: ex.mode, target: ex.target, sides: [], at: Date.now() });
    }
    this.setPhase('complete'); this.data.completedAt = Date.now(); this.emit('complete');
    return true;
  }
  pause() {
    if (['paused', 'complete', 'transition'].includes(this.phase)) return false;
    this.data.pausedPhase = this.phase;
    this.setPhase('paused', this.data.remaining);
    this.emit('pause'); return true;
  }
  resume() {
    if (this.phase !== 'paused') return false;
    this.setPhase(this.data.pausedPhase || 'ready', this.data.remaining);
    this.data.pausedPhase = null;
    this.emit('resume'); return true;
  }
  finishRest() { if (this.phase !== 'rest') return false; this.setPhase('ready'); this.emit('restEnd'); return true; }
  addRest(seconds = 15) { if (this.phase !== 'rest') return false; this.data.remaining += seconds * 1000; return true; }
  background(elapsedMs) {
    if (this.phase === 'rest') {
      this.data.remaining = Math.max(0, this.data.remaining - Math.max(0, elapsedMs));
      if (!this.data.remaining) this.finishRest();
    } else if (['active', 'buffer', 'preparing'].includes(this.phase)) {
      this.pause(); this.emit('backgroundInterrupted');
    }
  }
  canAdvanceCycle() {
    if (this.phase !== 'complete') return false;
    return this.data.exercises.filter(ex => ex.part !== '拉伸').every(ex => {
      const records = this.data.records.filter(record => record.exerciseId === ex.id && record.part !== '拉伸');
      if (records.length !== ex.sets) return false;
      const setIndexes = new Set();
      return records.every(record => {
        if (record.status !== 'completed' || setIndexes.has(record.setIndex)) return false;
        setIndexes.add(record.setIndex);
        if (ex.sided === 'single') {
          return ['left', 'right'].every(side => record.sides.some(item => item.side === side && item.status === 'completed'));
        }
        return record.sides.every(item => item.status === 'completed');
      }) && setIndexes.size === ex.sets && Array.from({ length: ex.sets }, (_, i) => setIndexes.has(i)).every(Boolean);
    });
  }
}
