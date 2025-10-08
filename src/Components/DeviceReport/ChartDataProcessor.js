import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/fa.js";
import { toJalaliDateString } from "./DateUtils";

dayjs.extend(utc);
dayjs.locale("fa");

// Helper: استاندارد کردن تاریخ به روز محلی ایران (YYYY-MM-DD)
const localDayStr = (d) => {
  if (!d) return null;
  return dayjs(d).utcOffset(3.5).format("YYYY-MM-DD");
};

// Helper: get dayjs object in Iran offset
const localDayjs = (d) => dayjs(d).utcOffset(3.5);

// -------------------- اصلی --------------------

export const processChartData = (rawData, chartType, selectedDate, useRange, range) => {
  console.log("🟢 processChartData called with:", {
    chartType,
    selectedDate,
    useRange,
    range,
    rawSampleCount: Array.isArray(rawData) ? rawData.length : 0,
    rawDataSample: Array.isArray(rawData) ? rawData.slice(0, 2) : [],
  });

  if (!Array.isArray(rawData)) return [];
  if (useRange && (!range?.from || !range?.to)) return [];

  return chartType === "hourly"
    ? processHourlyData(rawData, selectedDate, useRange, range)
    : processInstantData(rawData, selectedDate, useRange, range);
};

// -------------------- میانگین‌گیری ساعتی --------------------

// const processHourlyData = (rawData, selectedDate, useRange, range) => {
//   const getDay = localDayStr;
//   const hourlyMap = {};

//   // اگر کاربر بازه نخواسته و تاریخ انتخاب‌شده دیتایی نداره، بعد از اسکن، به آخرین روز موجود fallback می‌کنیم
//   rawData.forEach((item) => {
//     if (!item || item.state === "unavailable") return;
//     const ts = item.timestamp || item.last_updated;
//     if (!ts) return;

//     const parts = (item.state || "").split("/").map(Number);
//     const [temp, hum] = parts;
//     if (isNaN(temp) || isNaN(hum)) return;

//     const itemDay = getDay(ts);

//     // در صورت استفاده از بازه، بررسی روز انجام می‌شود
//     if (useRange) {
//       const fromDay = getDay(range.from);
//       const toDay = getDay(range.to);
//       if ((fromDay && itemDay < fromDay) || (toDay && itemDay > toDay)) return;
//     } else {
//       const selDay = getDay(selectedDate);
//       // اگر selectedDate مشخص است و ناهماهنگی وجود دارد، فعلاً از این تابع صرفا عبور می‌دهیم.
//       if (selDay && itemDay !== selDay) return;
//     }

//     const hourKey = localDayjs(ts).format("YYYY-MM-DD HH"); // iran offset hour key

//     if (!hourlyMap[hourKey]) hourlyMap[hourKey] = { tempSum: 0, humSum: 0, count: 0, items: [] };
//     hourlyMap[hourKey].tempSum += temp;
//     hourlyMap[hourKey].humSum += hum;
//     hourlyMap[hourKey].count += 1;
//     hourlyMap[hourKey].items.push(item);
//   });

//   // اگر کاربر روزی انتخاب کرده بود ولی hourlyMap خالی است (یعنی آن روز دیتایی نداشته)
//   // باید fallback به آخرین روز داده‌شده انجام بدیم: آخرین روز از rawData
//   if (!useRange && Object.keys(hourlyMap).length === 0) {
//     // پیدا کردن آخرین تاریخ موجود در rawData (بر اساس offset ایران)
//     const days = rawData
//       .map((it) => it && (it.timestamp || it.last_updated) ? localDayStr(it.timestamp || it.last_updated) : null)
//       .filter(Boolean)
//       .sort();
//     const lastDay = days.length ? days[days.length - 1] : null;
//     if (lastDay) {
//       // دوباره iterate کن و موارد آن روز را اضافه کن
//       rawData.forEach((item) => {
//         if (!item || item.state === "unavailable") return;
//         const ts = item.timestamp || item.last_updated;
//         if (!ts) return;
//         const itemDay = localDayStr(ts);
//         if (itemDay !== lastDay) return;
//         const parts = (item.state || "").split("/").map(Number);
//         const [temp, hum] = parts;
//         if (isNaN(temp) || isNaN(hum)) return;
//         const hourKey = localDayjs(ts).format("YYYY-MM-DD HH");
//         if (!hourlyMap[hourKey]) hourlyMap[hourKey] = { tempSum: 0, humSum: 0, count: 0, items: [] };
//         hourlyMap[hourKey].tempSum += temp;
//         hourlyMap[hourKey].humSum += hum;
//         hourlyMap[hourKey].count += 1;
//         hourlyMap[hourKey].items.push(item);
//       });
//     }
//   }

//   const result = Object.entries(hourlyMap)
//     .filter(([_, { count }]) => count > 0)
//     .map(([hourKey, { tempSum, humSum, count, items }]) => ({
//       time: toJalaliDateString(hourKey + ":00"),
//       hourKey,
//       temperature: parseFloat((tempSum / count).toFixed(1)),
//       humidity: parseFloat((humSum / count).toFixed(1)),
//       items,
//     }))
//     .sort((a, b) => {
//       // sort by hourKey ascending
//       return a.hourKey < b.hourKey ? -1 : 1;
//     });

//   console.log("⚪ processHourlyData -> produced entries:", result.length);
//   return result;
// };

const processHourlyData = (rawData, selectedDate, useRange, range) => {
  const getDay = localDayStr;
  const bucketMap = {};

  rawData.forEach((item) => {
    if (!item || item.state === "unavailable") return;
    const ts = item.timestamp || item.last_updated;
    if (!ts) return;

    const parts = (item.state || "").split("/").map(Number);
    const [temp, hum] = parts;
    if (isNaN(temp) || isNaN(hum)) return;

    // فیلتر بر اساس بازه یا تاریخ انتخابی (همان منطق قبلی)
    if (useRange) {
      const fromDay = getDay(range.from);
      const toDay = getDay(range.to);
      const itemDay = getDay(ts);
      if ((fromDay && itemDay < fromDay) || (toDay && itemDay > toDay)) return;
    } else {
      const selDay = getDay(selectedDate);
      const itemDay = getDay(ts);
      if (selDay && itemDay !== selDay) return;
    }

    // اینجا باکت نیم‌ساعتی می‌سازیم: دقیقه را به 0 یا 30 گرد می‌کنیم
    const dt = localDayjs(ts);
    const minuteBucket = Math.floor(dt.minute() / 30) * 30; // 0 یا 30
    const bucketKey = dt.startOf("hour").add(minuteBucket, "minute").format("YYYY-MM-DD HH:mm");

    if (!bucketMap[bucketKey]) {
      bucketMap[bucketKey] = { tempSum: 0, humSum: 0, count: 0, items: [] };
    }

    bucketMap[bucketKey].tempSum += temp;
    bucketMap[bucketKey].humSum += hum;
    bucketMap[bucketKey].count += 1;
    bucketMap[bucketKey].items.push(item);
  });

  // fallback مشابه قبل: اگر user day انتخاب کرده ولی هیچ باکتی نبود، می‌تونیم به آخرین روز fallback کنیم
  if (!useRange && Object.keys(bucketMap).length === 0) {
    const days = rawData
      .map((it) => it && (it.timestamp || it.last_updated) ? getDay(it.timestamp || it.last_updated) : null)
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
        const parts = (item.state || "").split("/").map(Number);
        const [temp, hum] = parts;
        if (isNaN(temp) || isNaN(hum)) return;
        const dt = localDayjs(ts);
        const minuteBucket = Math.floor(dt.minute() / 30) * 30;
        const bucketKey = dt.startOf("hour").add(minuteBucket, "minute").format("YYYY-MM-DD HH:mm");
        if (!bucketMap[bucketKey]) bucketMap[bucketKey] = { tempSum: 0, humSum: 0, count: 0, items: [] };
        bucketMap[bucketKey].tempSum += temp;
        bucketMap[bucketKey].humSum += hum;
        bucketMap[bucketKey].count += 1;
        bucketMap[bucketKey].items.push(item);
      });
    }
  }

  const result = Object.entries(bucketMap)
    .filter(([_, { count }]) => count > 0)
    .map(([bucketKey, { tempSum, humSum, count, items }]) => ({
      // bucketKey مثال: "2025-10-07 09:00" یا "2025-10-07 09:30"
      time: toJalaliDateString(bucketKey + ":00"), // به فرمت قابل نمایش تبدیل
      hourKey: bucketKey, // حالا شامل دقیقه هم هست
      temperature: parseFloat((tempSum / count).toFixed(1)),
      humidity: parseFloat((humSum / count).toFixed(1)),
      items,
    }))
    .sort((a, b) => (a.hourKey < b.hourKey ? -1 : 1));

  return result;
};


// -------------------- تابع لحظه‌ای (instant) --------------------

const processInstantData = (rawData, selectedDate, useRange, range) => {
  console.log("🔵 processInstantData input:", {
    rawCount: rawData.length,
    selectedDate,
    useRange,
    range,
  });

  const getDay = localDayStr;

  // حالت بازه (inclusive: from startOf day, to endOf day)
  if (useRange) {
    const fromTime = localDayjs(range.from).startOf("day");
    const toTime = localDayjs(range.to).endOf("day");

    const filtered = rawData
      .filter((item) => {
        if (!item || item.state === "unavailable") return false;
        const ts = item.timestamp || item.last_updated;
        if (!ts) return false;
        const itemTime = localDayjs(ts);
        if (itemTime.isBefore(fromTime) || itemTime.isAfter(toTime)) return false;
        return true;
      })
      .map((item) => {
        const [temp, hum] = (item.state || "").split("/").map(Number);
        const ts = item.timestamp || item.last_updated;
        return {
          time: localDayjs(ts).toISOString(),
          temperature: isNaN(temp) ? null : temp,
          humidity: isNaN(hum) ? null : hum,
          _orig: item,
        };
      })
      .sort((a, b) => new Date(a.time) - new Date(b.time));

    console.log("🔵 processInstantData (range) -> matched:", filtered.length);
    return filtered;
  }

  // حالت single-day: سعی کن ابتدا براساس selectedDate فیلتر کنی
  let targetDay = getDay(selectedDate);

  // تلاش اولیه براساس selectedDate (اگر داده‌ای پیدا شد)
  let matched = rawData
    .filter((item) => {
      if (!item || item.state === "unavailable") return false;
      const ts = item.timestamp || item.last_updated;
      if (!ts) return false;
      const itemDay = getDay(ts);
      return targetDay ? itemDay === targetDay : true;
    });

  // اگر selectedDate مشخص بود ولی هیچ آیتمی پیدا نشد -> fallback به آخرین روز موجود
  if (targetDay && matched.length === 0) {
    const days = rawData
      .map((it) => it && (it.timestamp || it.last_updated) ? getDay(it.timestamp || it.last_updated) : null)
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
      console.log("🔁 processInstantData: selectedDate had no items, fallback to lastDay:", lastDay, "matched:", matched.length);
    } else {
      console.log("⚠️ processInstantData: no days available in rawData");
    }
  }

  // اگر selectedDate خالی بوده یا matched با targetDay بدست آمد، map نهایی را بساز
  const result = matched
    .map((item) => {
      const [temp, hum] = (item.state || "").split("/").map(Number);
      const ts = item.timestamp || item.last_updated;
      return {
        time: localDayjs(ts).toISOString(),
        temperature: isNaN(temp) ? null : temp,
        humidity: isNaN(hum) ? null : hum,
        _orig: item,
      };
    })
    .sort((a, b) => new Date(a.time) - new Date(b.time));

  console.log("🔵 processInstantData -> final matched count:", result.length, "targetDay:", targetDay);
  return result;
};

// -------------------- جزئیات ساعت انتخاب‌شده --------------------

// export const getHourDetails = (rawData, selectedHourKey) => {
//   if (!Array.isArray(rawData) || !selectedHourKey) return [];

//   const filtered = rawData.filter((item) => {
//     const ts = item.timestamp || item.last_updated;
//     if (!ts) return false;
//     const hour = localDayjs(ts).format("YYYY-MM-DD HH");
//     return hour === selectedHourKey;
//   });

//   return filtered.map((item) => {
//     const [temp, hum] = (item.state || "").split("/").map(Number);
//     return {
//       time: localDayjs(item.timestamp || item.last_updated).format("HH:mm:ss"),
//       temperature: isNaN(temp) ? null : temp,
//       humidity: isNaN(hum) ? null : hum,
//     };
//   });
// };

export const getHourDetails = (rawData, selectedBucketKey) => {
  if (!Array.isArray(rawData) || !selectedBucketKey) return [];

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
