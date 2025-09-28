import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toJalaliDateString  } from "./DateUtils";

export const exportToExcel = (filteredData = [], Entity = "") => {
  if (!filteredData || filteredData.length === 0) return;

  const dataForExcel = filteredData.map((item) => ({
    زمان: toJalaliDateString (item.time),
    مقدار:
      typeof item.value === "string"
        ? item.value.toLowerCase() === "on"
          ? "روشن"
          : item.value.toLowerCase() === "off"
          ? "خاموش"
          : item.value
        : item.value,
  }));

  const ws = XLSX.utils.json_to_sheet(dataForExcel);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, `Report-${Entity}.xlsx`);
};
