import axios from "axios";

const url = process.env.REACT_APP_URL;

export default async function getEntityHistory(
  deviceId,
  deviceType = "sensor",
  limit = 10
) {
  if (!deviceId) return [];

  try {
    const finalUrl = `${url}/mqtt/api/logs/device/${deviceType}/${deviceId}?limit=${limit}`;

    const response = await axios.get(finalUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return Array.isArray(response.data?.logs)
      ? response.data.logs
      : [];
  } catch (error) {
    console.error("⛔ خطا در دریافت لاگ‌ها:", error);
    return [];
  }
}
