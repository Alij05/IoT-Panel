import { create } from "zustand";

export const useReportStore = create((set) => ({
  selectedDate: new Date(),
  dataMap: {},
  range: { from: null, to: null },
  useRange: false,
  setSelectedDate: (date) => set({ selectedDate: date }),
  resetDate: () => set({ selectedDate: new Date() }),
  setDataMap: (data) => set({ dataMap: data }),
  setRange: (range) => set({ range }),
  resetRange: () => set({ range: { from: null, to: null } }),
  setUseRange: (useRange) => set({ useRange }),
}));
