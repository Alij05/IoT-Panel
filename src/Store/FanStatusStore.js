// store/fanStore.js
import { create } from "zustand";

const useFanStore = create((set) => ({
  fans: {},

  setFanStatus: (entity_id, state) =>
    set((prev) => ({
      fans: {
        ...prev.fans,
        [entity_id]: state,
      },
    })),

  getFanStatus: (entity_id) =>
    (get().fans[entity_id] !== undefined ? get().fans[entity_id] : "unknown"),
  
}));

export default useFanStore;
