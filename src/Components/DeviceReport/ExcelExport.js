import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toJalaliDateString } from "./DateUtils";

/**
 * Exports filteredData to Excel file with dynamic column names
 * @param {Array} filteredData - Array of device data
 * @param {string} deviceId - Optional device ID for file name
 */
export const exportToExcel = (filteredData = [], deviceId = "") => {
  if (!filteredData || filteredData.length === 0) return;

  // Determine labels dynamically based on first row
  let labels = { value1: "مقدار", value2: null };
  const firstItem = filteredData[0];
  if (firstItem) {
    const val = String(firstItem.value ?? firstItem.state ?? "");
    const parts = val.includes("/") ? val.split("/") : [val];
    if (parts.length >= 2) {
      // Check if numeric (likely temp/humidity)
      if (!isNaN(parts[0]) && !isNaN(parts[1])) {
        labels.value1 = "دمای دستگاه";
        labels.value2 = "رطوبت دستگاه";
      } else {
        labels.value1 = "مقدار ۱";
        labels.value2 = "مقدار ۲";
      }
    } else {
      labels.value1 = "مقدار";
      labels.value2 = null;
    }
  }

  // Map data to Excel format
  const dataForExcel = filteredData.map((item) => {
    const time = item.time ? toJalaliDateString(item.time) : "-";
    const val = String(item.value ?? item.state ?? "");
    const parts = val.includes("/") ? val.split("/") : [val];
    const value1 = parts[0] ?? "-";
    const value2 = parts[1] ?? null;

    // Map "on"/"off" to Persian text
    const mapValue = (v) => {
      const lower = String(v).toLowerCase();
      if (lower === "on") return "روشن";
      if (lower === "off") return "خاموش";
      return v;
    };

    const row = { زمان: time, [labels.value1]: mapValue(value1) };
    if (labels.value2) row[labels.value2] = mapValue(value2);
    return row;
  });

  // Create worksheet and workbook
  const ws = XLSX.utils.json_to_sheet(dataForExcel);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  // Write workbook and trigger download
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, `Report-${deviceId || "Device"}.xlsx`);
};
