import { create } from "zustand";

export const useIdentityStore = create((set) => ({
  entity_id: [
    // "sensor.temperature_humidity_sht20_temperature",
    "sensor.temperature_humidity_sht20_temperature",
    "sensor.temperature_humidity_sht20_humidity",
    "GC9 Thermo 1C78 GC9 Thermo 1C78 Humidity",
  ],
  setEntityId: (id) => set({ identity_id: id }),
}));

