export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  muted = false;
  private noise: AudioBuffer | null = null;

  unlock(): void {
    if (!this.ctx) {
      const ctx = new AudioContext({ latencyHint: "interactive" });
      const master = ctx.createGain();
      const sfx = ctx.createGain();
      master.gain.value = 0.7;
      sfx.gain.value = 0.9;
      sfx.connect(master);
      master.connect(ctx.destination);
      this.ctx = ctx;
      this.master = master;
      this.sfx = sfx;
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.noise = buf;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.master) {
      const t = this.ctx!.currentTime;
      this.master.gain.setTargetAtTime(muted ? 0 : 0.7, t, 0.03);
    }
  }

  private env(gain: GainNode, peak: number, dur: number, t: number): void {
    const g = gain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(0.0001, t);
    g.exponentialRampToValueAtTime(peak, t + 0.012);
    g.exponentialRampToValueAtTime(0.0001, t + dur);
  }

  private tone(freq: number, dur: number, type: OscillatorType, peak: number, slide = 0): void {
    if (!this.ctx || !this.sfx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    this.env(gain, peak, dur, t);
    osc.connect(gain);
    gain.connect(this.sfx);
    osc.start(t);
    osc.stop(t + dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  private burst(dur: number, peak: number, hpFreq = 800): void {
    if (!this.ctx || !this.sfx || !this.noise || this.muted) return;
    const t = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = hpFreq;
    filter.Q.value = 0.7;
    const gain = this.ctx.createGain();
    this.env(gain, peak, dur, t);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfx);
    src.start(t);
    src.stop(t + dur + 0.02);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  place(): void {
    this.burst(0.08, 0.18, 400);
    this.tone(190, 0.12, "triangle", 0.08);
  }
  shootBolt(): void {
    this.tone(760, 0.05, "square", 0.05, -200);
    this.burst(0.04, 0.08, 1800);
  }
  shootShell(): void {
    this.burst(0.16, 0.22, 180);
    this.tone(90, 0.18, "sine", 0.12, -40);
  }
  shootFrost(): void {
    this.tone(980, 0.1, "triangle", 0.07, 220);
  }
  shootLance(): void {
    this.tone(140, 0.12, "sawtooth", 0.08, -50);
    this.burst(0.07, 0.12, 900);
  }
  hit(): void {
    this.tone(420, 0.04, "square", 0.04);
  }
  death(): void {
    this.burst(0.14, 0.16, 320);
    this.tone(110, 0.16, "sine", 0.07, -70);
  }
  leak(): void {
    this.tone(180, 0.35, "sawtooth", 0.1, -120);
  }
  wave(): void {
    this.tone(330, 0.12, "triangle", 0.08);
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    window.setTimeout(() => this.tone(392, 0.12, "triangle", 0.07), 90);
    window.setTimeout(() => this.tone(523, 0.18, "triangle", 0.06), 180);
    void t;
  }
  upgrade(): void {
    this.tone(520, 0.1, "triangle", 0.08, 180);
  }
  deny(): void {
    this.tone(120, 0.12, "square", 0.06);
  }
  win(): void {
    this.tone(523, 0.2, "triangle", 0.1);
    window.setTimeout(() => this.tone(659, 0.2, "triangle", 0.09), 140);
    window.setTimeout(() => this.tone(784, 0.4, "triangle", 0.1), 280);
  }
  lose(): void {
    this.tone(196, 0.3, "sawtooth", 0.1, -80);
    window.setTimeout(() => this.tone(147, 0.5, "sine", 0.1, -40), 220);
  }
  sell(): void {
    this.tone(240, 0.1, "triangle", 0.06, -80);
  }
}
