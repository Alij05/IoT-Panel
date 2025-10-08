import axios from "axios";

const url = process.env.REACT_APP_URL;

export default async function getEntityHistory(deviceId, deviceType = "sensor", time) {
  // const isSensor = (deviceType.includes('temperature') || deviceType.includes('air')) ? 'sensor' : 'switch'

  try {
    const finalUrl = `${url}/mqtt/api/logs/device/sensor/${deviceId}?limit=5`;

    const response = await axios.get(finalUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    // console.log('response.data.logs ::', response.data.logs);


    return response.data.logs || [];
  } catch (error) {
    console.error("⛔ خطا در دریافت لاگ‌های entity/device:", error);
    return [];
  }
}
