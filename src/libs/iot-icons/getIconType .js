export function getIconType(entityId) {
  if (!entityId) return "default";

  const lower = entityId.toLowerCase();

  if (lower.includes("fan")) return "fan";
  if (lower.includes("relay")) return "outlet";
  if (lower.includes("motion")) return "motion";
  if (lower.includes("air")) return "air";
  if (lower.includes("lock")) return "lock";
  if (lower.includes("temp")) return "temperature";
  if (lower.includes("rgb")) return "rgb";
  if (lower.includes("hum")) return "humidity";
  if (lower.includes("flame")) return "flame";
  if (lower.includes("co2")) return "co2";
  if (lower.includes("water")) return "water";
  if (lower.includes("light") || lower.includes("lamp")) return "light";

  return "default";
}