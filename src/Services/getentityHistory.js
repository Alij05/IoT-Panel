import axios from "axios";

const url = process.env.REACT_APP_URL;

export default async function getEntityHistory(entityId, deviceType = "sensor") {
  try {
    const finalUrl = `${url}/mqtt/api/logs/device/${encodeURIComponent(deviceType)}/${encodeURIComponent(entityId)}?limit=5`;

    const response = await axios.get(finalUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log('response', response);
    
    return response.data.logs || [];
  } catch (error) {
    console.error("⛔ خطا در دریافت لاگ‌های entity/device:", error);
    return [];
  }
}
