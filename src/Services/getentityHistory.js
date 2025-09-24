import axios from "axios";

const BASE_URL = process.env.REACT_APP_HA_BASE_URL
const TOKEN = process.env.REACT_APP_HA_TOKEN

export async function getEntityHistory(entityId, dateOrRange) {
  try {
    let url;
    console.log(dateOrRange.from, dateOrRange.to);
    if (dateOrRange.from && dateOrRange.to) {
      const from = new Date(dateOrRange.from).toISOString().split("T")[0];
      const to = new Date(dateOrRange.to).toISOString().split("T")[0];

      url = `${BASE_URL}/api/history/period?filter_entity_id=${entityId}&start_time=${from}T00:00:00&end_time=${to}T23:59:59`;
    } else if (dateOrRange) {
      const date = new Date(dateOrRange).toISOString().split("T")[0];

      url = `${BASE_URL}/api/history/period/${date}?filter_entity_id=${entityId}`;
    } else {
      const today = new Date().toISOString().split("T")[0];

      url = `${BASE_URL}/api/history/period/${today}?filter_entity_id=${entityId}`;
    }

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    return response.data[0] || [];
  } catch (error) {
    console.error("⛔ خطا در دریافت تاریخچه entity:", error);
    return [];
  }
}
