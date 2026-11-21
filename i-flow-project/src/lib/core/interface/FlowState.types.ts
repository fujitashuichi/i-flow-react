import type { TimelineEntry } from "./TimelineEntry.types";

export interface FlowState {
  timeline: TimelineEntry[];
  currentIndex: number;
  status: 'running' | 'completed';
}
