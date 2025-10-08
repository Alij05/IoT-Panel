import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import "./DeviceReport.css";
import { useReportStore } from "../../Store/dateStore";
import { processChartData } from "./ChartDataProcessor";
import ChartHeader from "./ChartHeader";
import ChartControls from "./ChartControls";
import ChartDisplay from "./ChartDisplay";
import StateLogTable from "./StateLogTable";
import { exportToExcel } from "./ExcelExport";

const DeviceReport = ({ rawData = [], deviceId = "", deviceInfos, deviceClass }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [chartType, setChartType] = useState("instant");

  console.log('DeviceReport', rawData); // its OK


  const setSelectedDate = useReportStore((state) => state.setSelectedDate);
  const selectedDate = useReportStore((state) => state.selectedDate);
  const [useRange, setUseRange] = useState(false);
  const { range, setRange } = useReportStore();

  const isSensor =
    deviceClass.includes("temperature") ||
    deviceClass.includes("humidity") ||
    deviceClass.includes("air_quality");

  // ---- تابع تبدیل داده‌های غیر سنسوری ----
  // داخل DeviceReport، جایگزین نسخهٔ قبلی کن
  const transformDeviceData = (rawData = []) => {
    const seen = new Set();
    return rawData
      .map((item) => {
        const ts = item.last_changed || item.last_updated || item.timestamp || (item.extra && item.extra.timestamp) || new Date().toISOString();
        return {
          state: item.state ?? item.value ?? "-",   // نگه داشتن state اصلی
          timestamp: ts,                             // همیشه timestamp درج می‌شود
          name: item.attributes?.friendly_name || item.entity_id || item.deviceId || "",
          _orig: item,
        };
      })
      .filter((item) => {
        const key = `${item.timestamp}|${item.state}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };


  // ---- پردازش داده‌ها ----
  useEffect(() => {
    if (isSensor) {
      const processedData = processChartData(
        rawData || [],
        chartType,
        selectedDate,
        useRange,
        range
      );
      setFilteredData(processedData || []);
      console.log("✅ DeviceReport(processed Data) -->", processedData);
    } else {
      const processedData = transformDeviceData(rawData);
      setFilteredData(processedData);
    }
  }, [selectedDate, rawData, chartType, useRange, range, isSensor]);

  // ---- خروجی به اکسل ----
  const handleExportToExcel = () => {
    exportToExcel(rawData, deviceId);
  };

  // ---- رندر ----
  return (
    <Box className="report-chart-container" sx={{ margin: "50px auto" }}>
      {isSensor ? (
        <>
          <ChartHeader chartType={chartType} deviceId={deviceId} />
          <ChartControls
            chartType={chartType}
            setChartType={setChartType}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            useRange={useRange}
            setUseRange={setUseRange}
            range={range}
            setRange={setRange}
          />

          {/* ✅ اینجا داده‌های پردازش‌شده رو بده نه rawData */}
          <ChartDisplay
            filteredData={filteredData}
            setFilteredData={setFilteredData}
            deviceId={deviceId}
            exportToExcel={handleExportToExcel}
          />
        </>
      ) : (
        <StateLogTable data={filteredData} deviceId={deviceId} exportToExcel={handleExportToExcel} deviceInfos={deviceInfos} />
      )}
    </Box>
  );
};

export default DeviceReport;
