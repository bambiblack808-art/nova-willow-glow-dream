export const WORLD_W = 1280;
export const WORLD_H = 720;
export const COLS = 16;
export const ROWS = 9;
export const CELL = 80;
export const FIXED_DT = 1 / 60;
export const START_GOLD = 200;
export const START_LIVES = 20;
export const SELL_RATIO = 0.55;
export const MAX_UPGRADE = 3;
export const WAVE_AUTO_DELAY = 14;
export const EARLY_CALL_BONUS = 12;

export type Vec2 = { x: number; y: number };

export type TowerKind = "sentry" | "mortar" | "frost" | "lance";
export type EnemyKind = "mite" | "runner" | "brute" | "boss";
export type Targeting = "first" | "last" | "strong";
export type Phase = "title" | "playing" | "paused" | "victory" | "defeat";
export type WaveStatus = "prep" | "combat" | "clear";

export const PATH_CELLS: Array<[number, number]> = (() => {
  const cells: Array<[number, number]> = [];
  for (let c = 0; c <= 11; c++) cells.push([c, 1]);
  for (let r = 2; r <= 4; r++) cells.push([11, r]);
  for (let c = 10; c >= 3; c--) cells.push([c, 4]);
  for (let r = 5; r <= 7; r++) cells.push([3, r]);
  for (let c = 4; c <= 15; c++) cells.push([c, 7]);
  return cells;
})();

export const WAYPOINTS: Vec2[] = [
  { x: 0.0 * CELL, y: 1.5 * CELL },
  { x: 11.5 * CELL, y: 1.5 * CELL },
  { x: 11.5 * CELL, y: 4.5 * CELL },
  { x: 3.5 * CELL, y: 4.5 * CELL },
  { x: 3.5 * CELL, y: 7.5 * CELL },
  { x: 15.5 * CELL, y: 7.5 * CELL },
];

export type TowerDef = {
  kind: TowerKind;
  name: string;
  blurb: string;
  cost: number;
  range: number;
  damage: number;
  fireRate: number;
  projectileSpeed: number;
  splash: number;
  slow: number;
  slowTime: number;
  pierce: number;
  color: string;
  projectile: "bolt" | "shell" | "shard" | "lance";
};

export const TOWERS: Record<TowerKind, TowerDef> = {
  sentry: {
    kind: "sentry",
    name: "Sentry",
    blurb: "Fast bolts, short reach",
    cost: 55,
    range: CELL * 2.55,
    damage: 11,
    fireRate: 1.55,
    projectileSpeed: 520,
    splash: 0,
    slow: 0,
    slowTime: 0,
    pierce: 0,
    color: "#8a6a48",
    projectile: "bolt",
  },
  mortar: {
    kind: "mortar",
    name: "Mortar",
    blurb: "Slow shells, wide splash",
    cost: 95,
    range: CELL * 3.35,
    damage: 26,
    fireRate: 0.48,
    projectileSpeed: 280,
    splash: 88,
    slow: 0,
    slowTime: 0,
    pierce: 0.2,
    color: "#b56a3a",
    projectile: "shell",
  },
  frost: {
    kind: "frost",
    name: "Frost",
    blurb: "Chills a lane of foes",
    cost: 80,
    range: CELL * 2.75,
    damage: 7,
    fireRate: 1.05,
    projectileSpeed: 400,
    splash: 36,
    slow: 0.42,
    slowTime: 1.9,
    pierce: 0,
    color: "#8eb4c4",
    projectile: "shard",
  },
  lance: {
    kind: "lance",
    name: "Lance",
    blurb: "Long range, heavy hit",
    cost: 145,
    range: CELL * 4.55,
    damage: 52,
    fireRate: 0.62,
    projectileSpeed: 680,
    splash: 0,
    slow: 0,
    slowTime: 0,
    pierce: 0.65,
    color: "#6d7380",
    projectile: "lance",
  },
};

export const TOWER_ORDER: TowerKind[] = ["sentry", "mortar", "frost", "lance"];

export type EnemyDef = {
  kind: EnemyKind;
  name: string;
  hp: number;
  speed: number;
  gold: number;
  radius: number;
  armor: number;
  leak: number;
  scale: number;
};

export const ENEMIES: Record<EnemyKind, EnemyDef> = {
  mite: { kind: "mite", name: "Ash mite", hp: 38, speed: 68, gold: 7, radius: 14, armor: 0, leak: 1, scale: 0.78 },
  runner: { kind: "runner", name: "Horn runner", hp: 26, speed: 118, gold: 9, radius: 13, armor: 0, leak: 1, scale: 0.82 },
  brute: { kind: "brute", name: "Stone brute", hp: 165, speed: 42, gold: 18, radius: 20, armor: 0.28, leak: 1, scale: 1.05 },
  boss: { kind: "boss", name: "Rift ogre", hp: 980, speed: 34, gold: 90, radius: 28, armor: 0.18, leak: 3, scale: 1.45 },
};

export type SpawnSpec = { kind: EnemyKind; count: number; interval: number; delay: number };

export const WAVES: SpawnSpec[][] = [
  [{ kind: "mite", count: 8, interval: 0.85, delay: 0 }],
  [{ kind: "mite", count: 12, interval: 0.62, delay: 0 }],
  [
    { kind: "mite", count: 8, interval: 0.7, delay: 0 },
    { kind: "runner", count: 5, interval: 0.85, delay: 1.6 },
  ],
  [
    { kind: "mite", count: 10, interval: 0.55, delay: 0 },
    { kind: "runner", count: 8, interval: 0.55, delay: 1.2 },
  ],
  [
    { kind: "brute", count: 4, interval: 1.4, delay: 0 },
    { kind: "mite", count: 8, interval: 0.5, delay: 0.4 },
  ],
  [
    { kind: "runner", count: 12, interval: 0.42, delay: 0 },
    { kind: "mite", count: 8, interval: 0.5, delay: 2 },
  ],
  [
    { kind: "brute", count: 6, interval: 1.15, delay: 0 },
    { kind: "runner", count: 8, interval: 0.55, delay: 1.5 },
  ],
  [{ kind: "mite", count: 22, interval: 0.32, delay: 0 }],
  [
    { kind: "brute", count: 8, interval: 0.95, delay: 0 },
    { kind: "runner", count: 6, interval: 0.5, delay: 2 },
  ],
  [
    { kind: "boss", count: 1, interval: 0.1, delay: 0 },
    { kind: "mite", count: 14, interval: 0.4, delay: 1.2 },
    { kind: "runner", count: 6, interval: 0.6, delay: 4 },
  ],
  [
    { kind: "brute", count: 8, interval: 0.8, delay: 0 },
    { kind: "runner", count: 12, interval: 0.38, delay: 1 },
    { kind: "mite", count: 10, interval: 0.4, delay: 3 },
  ],
  [
    { kind: "boss", count: 1, interval: 0.1, delay: 0 },
    { kind: "brute", count: 6, interval: 1.1, delay: 2.2 },
    { kind: "runner", count: 10, interval: 0.45, delay: 4 },
    { kind: "mite", count: 12, interval: 0.35, delay: 6 },
  ],
];

export function cellCenter(col: number, row: number): Vec2 {
  return { x: (col + 0.5) * CELL, y: (row + 0.5) * CELL };
}

export function worldToCell(x: number, y: number): { col: number; row: number } {
  return { col: Math.floor(x / CELL), row: Math.floor(y / CELL) };
}

export function upgradeDamageCost(baseCost: number, level: number): number {
  return Math.round(baseCost * [0.55, 0.8, 1.15][level] ?? 9999);
}

export function upgradeRateCost(baseCost: number, level: number): number {
  return Math.round(baseCost * [0.5, 0.75, 1.05][level] ?? 9999);
}

export function damageMul(level: number): number {
  return 1 + 0.38 * level;
}

export function rateMul(level: number): number {
  return 1 + 0.28 * level;
}
