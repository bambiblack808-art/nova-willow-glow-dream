import type { EnemyKind, TowerKind } from "./config";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function sliceSheet(img: HTMLImageElement, cols: number, rows: number): HTMLCanvasElement[] {
  const fw = Math.floor(img.width / cols);
  const fh = Math.floor(img.height / rows);
  const frames: HTMLCanvasElement[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const canvas = document.createElement("canvas");
      canvas.width = fw;
      canvas.height = fh;
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(img, c * fw, r * fh, fw, fh, 0, 0, fw, fh);
      frames.push(canvas);
    }
  }
  return frames;
}

export type GameAssets = {
  map: HTMLImageElement | null;
  towers: Record<TowerKind, HTMLImageElement | null>;
  creeps: Record<EnemyKind, HTMLCanvasElement[]>;
  gate: HTMLImageElement | null;
  ready: boolean;
};

export async function loadAssets(): Promise<GameAssets> {
  const [map, sentry, mortar, frost, lance, mite, runner, brute, boss, gate] = await Promise.all([
    loadImage("/game/map/foundation.png"),
    loadImage("/game/towers/sentry.png"),
    loadImage("/game/towers/mortar.png"),
    loadImage("/game/towers/frost.png"),
    loadImage("/game/towers/lance.png"),
    loadImage("/game/creeps/mite.png"),
    loadImage("/game/creeps/runner.png"),
    loadImage("/game/creeps/brute.png"),
    loadImage("/game/creeps/boss.png"),
    loadImage("/game/props/gate.png"),
  ]);

  const empty: HTMLCanvasElement[] = [];
  return {
    map,
    towers: { sentry, mortar, frost, lance },
    creeps: {
      mite: mite ? sliceSheet(mite, 2, 2) : empty,
      runner: runner ? sliceSheet(runner, 2, 2) : empty,
      brute: brute ? sliceSheet(brute, 2, 2) : empty,
      boss: boss ? sliceSheet(boss, 2, 2) : empty,
    },
    gate,
    ready: true,
  };
}
