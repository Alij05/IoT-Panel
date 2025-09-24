import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/fa.js";
import "./DeviceReport.css";
import { useReportStore } from "../../Store/dateStore";
import { processChartData } from "./ChartDataProcessor";
import { exportToExcel } from "./ExcelExport";
import ChartHeader from "./ChartHeader";
import ChartControls from "./ChartControls";
import ChartDisplay from "./ChartDisplay";

dayjs.extend(utc);
dayjs.locale("fa");

const DeviceReport = ({ rawData, Entity }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [chartType, setChartType] = useState("instant");
  const isHumidity = Entity.includes("humidity");
  const setSelectedDate = useReportStore((state) => state.setSelectedDate);
  const selectedDate = useReportStore((state) => state.selectedDate);
  const [useRange, setUseRange] = useState(false);
  const { range, setRange } = useReportStore();

  const handleExportToExcel = () => {
    exportToExcel(filteredData, Entity);
  };

  useEffect(() => {
    console.log(rawData);
    const processedData = processChartData(
      rawData,
      chartType,
      selectedDate,
      useRange,
      range
    );
    setFilteredData(processedData);
  }, [selectedDate, rawData, chartType, useRange, range]);

  return (
    <Box className="report-chart-container" sx={{ margin: "50px auto" }}>
      <ChartHeader
        chartType={chartType}
        isHumidity={isHumidity}
        Entity={Entity}
      />

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

      <ChartDisplay
        filteredData={filteredData}
        setFilteredData={setFilteredData}
        isHumidity={isHumidity}
        Entity={Entity}
        exportToExcel={handleExportToExcel}
      />
    </Box>
  );
};

export default DeviceReport;
