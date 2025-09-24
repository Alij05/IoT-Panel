import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jalaali from "jalaali-js";

export const exportToExcel = (filteredData, Entity) => {
  if (!filteredData || filteredData.length === 0) return;

  const dataForExcel = filteredData.map((item) => {
    const date = new Date(item.time);
    const { jy, jm, jd } = jalaali.toJalaali(date);

    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");

    const formattedTime = `${jy}/${String(jm).padStart(2, "0")}/${String(
      jd
    ).padStart(2, "0")} ${hour}:${minute}`;

    return {
      time: formattedTime,
      value: item.value,
    };
  });

  const ws = XLSX.utils.json_to_sheet(dataForExcel);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");

  const excelBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array",
  });

  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  //TODO بعد از ایجاد نام برای دستگاه نام فایل از ENTITY به نام دستگاه تغییر کند
  saveAs(data, `Report-${Entity}.xlsx`);
};
