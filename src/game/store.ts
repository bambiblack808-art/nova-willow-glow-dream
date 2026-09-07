import { create } from "zustand";
import type { Phase, Targeting, TowerKind, WaveStatus } from "./config";
import { WAVES } from "./config";

export type SelectedHud = {
  id: number;
  kind: TowerKind;
  dmgLevel: number;
  rateLevel: number;
  targeting: Targeting;
  sellFor: number;
  dmgCost: number | null;
  rateCost: number | null;
};

export type HudState = {
  phase: Phase;
  gold: number;
  lives: number;
  wave: number;
  waveTotal: number;
  waveStatus: WaveStatus;
  selectedBuild: TowerKind | null;
  selected: SelectedHud | null;
  muted: boolean;
  callWaveIn: number;
  enemiesAlive: number;
  toast: string | null;
  loaded: boolean;
};

const initial: HudState = {
  phase: "title",
  gold: 0,
  lives: 0,
  wave: 0,
  waveTotal: WAVES.length,
  waveStatus: "prep",
  selectedBuild: null,
  selected: null,
  muted: false,
  callWaveIn: 0,
  enemiesAlive: 0,
  toast: null,
  loaded: false,
};

export const useHud = create<HudState>(() => ({ ...initial }));

export function resetHud(): void {
  useHud.setState({ ...initial, loaded: true });
}
