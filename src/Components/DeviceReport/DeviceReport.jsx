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
  const setSelectedDate = useReportStore((state) => state.setSelectedDate);
  const selectedDate = useReportStore((state) => state.selectedDate);
  const [useRange, setUseRange] = useState(false);
  const { range, setRange } = useReportStore();

  // تشخیص نوع دیوایس
  console.log('deviceClass ->', deviceClass);
  
  const isSensor = deviceClass.includes("temperature") || deviceClass.includes("humidity") || deviceClass.includes("air_quality");

  const transformDeviceData = (rawData = []) => {
    const seen = new Set();
    return rawData
      .map((item) => ({
        value: item.state || "-",
        time: item.last_changed || item.last_updated || new Date().toISOString(),
        name: item.attributes?.friendly_name || item.entity_id,
      }))
      .filter((item) => {
        const key = item.time + item.value;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => new Date(b.time) - new Date(a.time));
  };

  useEffect(() => {
    if (isSensor) {
      const processedData = processChartData(rawData || [], chartType, selectedDate, useRange, range);
      setFilteredData(processedData || []);
      console.log('processed Data --->', rawData);
      

    } else {
      const processedData = transformDeviceData(rawData);
      setFilteredData(processedData);
    }
  }, [selectedDate, rawData, chartType, useRange, range, isSensor]);


  const handleExportToExcel = () => {
    exportToExcel(rawData, deviceId);
  };

  return (
    <Box className="report-chart-container" sx={{ margin: "50px auto" }}>
      {isSensor ? (
        <>
          <ChartHeader chartType={chartType} deviceId={deviceId} />
          <ChartControls chartType={chartType} setChartType={setChartType} selectedDate={selectedDate} setSelectedDate={setSelectedDate} useRange={useRange} setUseRange={setUseRange} range={range} setRange={setRange} />
          {/* <ChartDisplay filteredData={filteredData} setFilteredData={setFilteredData} isHumidity={isHumidity} deviceId={deviceId} exportToExcel={handleExportToExcel} /> */}
          <ChartDisplay filteredData={rawData} setFilteredData={setFilteredData} deviceId={deviceId} exportToExcel={handleExportToExcel} />
        </>
      ) : (
        // <StateLogTable data={filteredData} deviceId={deviceId} exportToExcel={handleExportToExcel} deviceInfos={deviceInfos} />
        <StateLogTable data={rawData} deviceId={deviceId} exportToExcel={handleExportToExcel} deviceInfos={deviceInfos} />
      )}
    </Box>
  );
};

export default DeviceReport;
