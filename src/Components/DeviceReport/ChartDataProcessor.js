import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import axios from "axios";
import "dayjs/locale/fa.js";
import { toJalaliDateString } from "./DateUtils";

let url = process.env.REACT_APP_URL

dayjs.extend(utc);
dayjs.locale("fa");

// Helper: Standardize date to Iran local day (YYYY-MM-DD)
const localDayStr = (d) => {
  if (!d) return null;
  return dayjs(d).utcOffset(3.5).format("YYYY-MM-DD");
};

// Helper: Get dayjs object in Iran offset
const localDayjs = (d) => dayjs(d).utcOffset(3.5);

// -------------------- Main Function --------------------

export const processChartData = (rawData, chartType, selectedDate, useRange, range) => {
  if (!Array.isArray(rawData)) return [];
  if (useRange && (!range?.from || !range?.to)) return [];

  return chartType === "hourly"
    ? processHourlyData(rawData, selectedDate, useRange, range)
    : processInstantData(rawData, selectedDate, useRange, range);
};

// -------------------- Hourly Averaging (30-minute buckets) --------------------
const processHourlyData = (rawData, selectedDate, useRange, range) => {
  const getDay = localDayStr;
  const bucketMap = {};

  rawData.forEach((item) => {
    if (!item || item.state === "unavailable") return;
    const ts = item.timestamp || item.last_updated;
    if (!ts) return;

    const value = item.state ?? item.value ?? item.value_text ?? null;
    if (value === null) return;

    // --- Filter by date or range ---
    const itemDay = getDay(ts);
    if (useRange) {
      const fromDay = getDay(range.from);
      const toDay = getDay(range.to);
      if ((fromDay && itemDay < fromDay) || (toDay && itemDay > toDay)) return;
    } else {
      const selDay = getDay(selectedDate);
      if (selDay && itemDay !== selDay) return;
    }

    const dt = localDayjs(ts);

    // --- Half-hour buckets ---
    const minuteBucket = Math.floor(dt.minute() / 30) * 30; // 0 or 30
    const bucketKey = dt.startOf("hour").add(minuteBucket, "minute").format("YYYY-MM-DD HH:mm");

    if (!bucketMap[bucketKey]) bucketMap[bucketKey] = { values: [], items: [] };

    bucketMap[bucketKey].values.push(value);
    bucketMap[bucketKey].items.push(item);
  });

  // --- Fallback if no data found for selected day ---
  if (!useRange && Object.keys(bucketMap).length === 0) {
    const days = rawData
      .map((it) => (it && (it.timestamp || it.last_updated) ? getDay(it.timestamp || it.last_updated) : null))
      .filter(Boolean)
      .sort();

    const lastDay = days.length ? days[days.length - 1] : null;
    if (lastDay) {
      rawData.forEach((item) => {
        if (!item || item.state === "unavailable") return;
        const ts = item.timestamp || item.last_updated;
        if (!ts) return;
        const itemDay = getDay(ts);
        if (itemDay !== lastDay) return;

        const value = item.state ?? item.value ?? item.value_text ?? null;
        if (value === null) return;

        const dt = localDayjs(ts);
        const minuteBucket = Math.floor(dt.minute() / 30) * 30;
        const bucketKey = dt.startOf("hour").add(minuteBucket, "minute").format("YYYY-MM-DD HH:mm");

        if (!bucketMap[bucketKey]) bucketMap[bucketKey] = { values: [], items: [] };
        bucketMap[bucketKey].values.push(value);
        bucketMap[bucketKey].items.push(item);
      });
    }
  }

  const result = Object.entries(bucketMap)
    .filter(([_, { values }]) => values.length > 0)
    .map(([bucketKey, { values, items }]) => ({
      time: toJalaliDateString(bucketKey + ":00"),
      bucketKey,
      value: values.join(" / "), // join multiple values in bucket
      items,
    }))
    .sort((a, b) => (a.bucketKey < b.bucketKey ? -1 : 1));

  return result;
};

// -------------------- Instant (Real-time) Data Function --------------------
const processInstantData = (rawData, selectedDate, useRange, range) => {
  const getDay = localDayStr;

  // Handle range mode: filter by start/end dates
  if (useRange) {
    const fromTime = localDayjs(range.from).startOf("day");
    const toTime = localDayjs(range.to).endOf("day");

    const filtered = rawData
      .filter((item) => {
        if (!item || item.state === "unavailable") return false;
        const ts = item.timestamp || item.last_updated;
        if (!ts) return false;
        const itemTime = localDayjs(ts);
        return !(itemTime.isBefore(fromTime) || itemTime.isAfter(toTime));
      })
      .map((item) => ({
        time: localDayjs(item.timestamp || item.last_updated).toISOString(),
        value: item.state ?? item.value ?? item.value_text ?? null,
        _orig: item,
      }))
      .filter((d) => d.value !== null)
      .sort((a, b) => new Date(a.time) - new Date(b.time));

    return filtered;
  }

  let targetDay = getDay(selectedDate);

  // Initial attempt based on selectedDate
  let matched = rawData.filter((item) => {
    if (!item || item.state === "unavailable") return false;
    const ts = item.timestamp || item.last_updated;
    if (!ts) return false;
    const itemDay = getDay(ts);
    return targetDay ? itemDay === targetDay : true;
  });

  // Fallback if no items found
  if (targetDay && matched.length === 0) {
    const days = rawData
      .map((it) => (it && (it.timestamp || it.last_updated) ? getDay(it.timestamp || it.last_updated) : null))
      .filter(Boolean)
      .sort();
    const lastDay = days.length ? days[days.length - 1] : null;
    if (lastDay) {
      targetDay = lastDay;
      matched = rawData.filter((item) => {
        if (!item || item.state === "unavailable") return false;
        const ts = item.timestamp || item.last_updated;
        if (!ts) return false;
        const itemDay = getDay(ts);
        return itemDay === targetDay;
      });
    }
  }

  const result = matched
    .map((item) => ({
      time: localDayjs(item.timestamp || item.last_updated).toISOString(),
      value: item.state ?? item.value ?? item.value_text ?? null,
      _orig: item,
    }))
    .filter((d) => d.value !== null)
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  return result;
};


// Get detailed data for a specific 30-minute bucket
export const getHourDetails = (rawData, selectedBucketKey) => {
  if (!Array.isArray(rawData) || !selectedBucketKey) return [];

  // Filter items that belong to the selected 30-minute bucket
  const filtered = rawData.filter((item) => {
    const ts = item.timestamp || item.last_updated;
    if (!ts) return false;
    const bucket = localDayjs(ts).startOf("hour")
      .add(Math.floor(localDayjs(ts).minute() / 30) * 30, "minute")
      .format("YYYY-MM-DD HH:mm");
    return bucket === selectedBucketKey;
  });

  return filtered.map((item) => {
    const [temp, hum] = (item.state || "").split("/").map(Number);
    return {
      time: localDayjs(item.timestamp || item.last_updated).format("HH:mm:ss"),
      temperature: isNaN(temp) ? null : temp,
      humidity: isNaN(hum) ? null : hum,
    };
  });

};

// Fetch device logs for a specific date
export const fetchDeviceLogsByDate = async (deviceId, date) => {
  try {
    // const token = localStorage.getItem("token");
    const response = await axios.post(
      `${url}/mqtt/api/logs/device/sensor/${deviceId}?limit=5`,
      { date }, // Request body
      {
        headers: {
          // "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    // console.log('Manual time selection', response);

    // Filter to only include 'status' type messages
    const filteredData = response.data.logs.filter(data => data.messageType === 'status')
    return filteredData;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};

// Fetch device logs for a date range
export const fetchDeviceLogsByRange = async (deviceType, deviceId, startDate, endDate) => {
  try {
    // const token = localStorage.getItem("token");
    const response = await axios.post(
      `${url}/mqtt/api/logs/device/range/sensor/${deviceId}`,
      { startDate, endDate },
      {
        headers: {
          // "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    // Filter to only include 'status' type messages
    const filteredData = response.data.logs.filter(data => data.messageType === 'status')
    // console.log('Manual Range selection ====', response.data);

    return filteredData;

  } catch (error) {
    console.error("fetchDeviceLogsByRange error:", error);
    return [];
  }
};