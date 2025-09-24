import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/fa.js";
import { toJalaliDateString } from "./DateUtils";

dayjs.extend(utc);
dayjs.locale("fa");

export const processChartData = (
  rawData,
  chartType,
  selectedDate,
  useRange,
  range
) => {
  if (!Array.isArray(rawData)) {
    return [];
  }

  if (useRange && (!range.from || !range.to)) {
    return [];
  }

  const getFormatted = (date) => dayjs(date).utc().format("YYYY-MM-DD");

  if (chartType === "hourly") {
    return processHourlyData(
      rawData,
      selectedDate,
      useRange,
      range,
      getFormatted
    );
  } else {
    return processInstantData(
      rawData,
      selectedDate,
      useRange,
      range,
      getFormatted
    );
  }
};

const processHourlyData = (
  rawData,
  selectedDate,
  useRange,
  range,
  getFormatted
) => {
  const hourlyMap = {};

  rawData.forEach((item) => {
    if (!item || item.state === "unavailable") return;

    const itemDate = getFormatted(item.last_updated);
    const fromStr = useRange ? getFormatted(range.from) : null;
    const toStr = useRange ? getFormatted(range.to) : null;

    if (useRange) {
      if (fromStr && itemDate < fromStr) return;
      if (toStr && itemDate > toStr) return;
    } else {
      const dateStr = getFormatted(selectedDate);
      if (
        !dayjs(item.last_updated)
          .utcOffset(3.5)
          .format("YYYY-MM-DD")
          .startsWith(dateStr)
      )
        return;
    }

    const hourKey = dayjs(item.last_updated)
      .utcOffset(3.5)
      .format("YYYY-MM-DD HH");
    if (!hourlyMap[hourKey]) {
      hourlyMap[hourKey] = { sum: 0, count: 0 };
    }
    hourlyMap[hourKey].sum += parseFloat(item.state);
    hourlyMap[hourKey].count += 1;
  });

  return Object.entries(hourlyMap)
    .filter(([_, { count }]) => count > 0)
    .map(([hourKey, { sum, count }]) => ({
      time: toJalaliDateString(hourKey + ":00"),
      value: (sum / count).toFixed(1),
    }));
};

const processInstantData = (
  rawData,
  selectedDate,
  useRange,
  range,
  getFormatted
) => {
  return rawData
    .filter((item) => {
      if (!item || item.state === "unavailable") return false;
      const itemDate = getFormatted(item.last_updated);

      if (useRange) {
        const fromStr = getFormatted(range.from);
        const toStr = getFormatted(range.to);
        if (fromStr && itemDate < fromStr) return false;
        if (toStr && itemDate > toStr) return false;
        return true;
      }

      const dateStr = getFormatted(selectedDate);
      return item.last_updated?.startsWith(dateStr);
    })
    .map((item) => ({
      time: dayjs(item.last_updated)
        .utcOffset(3.5)
        .locale("fa")
        .format("YYYY/MM/DD HH:mm"),
      value: parseFloat(item.state).toFixed(1),
    }));
};
