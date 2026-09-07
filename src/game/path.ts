import { WAYPOINTS, type Vec2 } from "./config";

export type PathData = {
  points: Vec2[];
  segLen: number[];
  total: number;
};

export function buildPath(points: Vec2[] = WAYPOINTS): PathData {
  const segLen: number[] = [];
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const len = Math.hypot(dx, dy);
    segLen.push(len);
    total += len;
  }
  return { points, segLen, total };
}

export function samplePath(path: PathData, dist: number): { x: number; y: number; tx: number; ty: number } {
  const d = Math.max(0, Math.min(dist, path.total));
  let remain = d;
  for (let i = 0; i < path.segLen.length; i++) {
    const len = path.segLen[i];
    if (remain <= len || i === path.segLen.length - 1) {
      const a = path.points[i];
      const b = path.points[i + 1];
      const t = len <= 0 ? 1 : remain / len;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const l = Math.hypot(dx, dy) || 1;
      return {
        x: a.x + dx * t,
        y: a.y + dy * t,
        tx: dx / l,
        ty: dy / l,
      };
    }
    remain -= len;
  }
  const last = path.points[path.points.length - 1];
  return { x: last.x, y: last.y, tx: 1, ty: 0 };
}

export const MAIN_PATH = buildPath();
