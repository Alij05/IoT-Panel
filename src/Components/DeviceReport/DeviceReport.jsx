import React, { useEffect, useState, useRef } from "react";
import { Box } from "@mui/material";
import "./DeviceReport.css";
import { useReportStore } from "../../Store/dateStore";
import { fetchDeviceLogsByDate, fetchDeviceLogsByRange, processChartData } from "./ChartDataProcessor";
import ChartHeader from "./ChartHeader";
import ChartControls from "./ChartControls";
import ChartDisplay from "./ChartDisplay";
import StateLogTable from "./StateLogTable";
import { exportToExcel } from "./ExcelExport";
import dayjs from "dayjs";

/**
 * DeviceReport (rewritten)
 *
 * Props:
 * - rawData: array (incoming realtime/history payloads)
 * - deviceId: string
 * - deviceInfos: object (for StateLogTable header)
 * - deviceClass: string (used to decide isSensor)
 *
 * Behavior:
 * - initial: show instant data processed from rawData
 * - date selected (single day): fetch server logs for that day (POST), use them if returned, otherwise fallback to local rawData
 * - useRange: if true and both from/to set -> use local rawData filtered by date range
 * - chartType toggles between "instant" and "hourly" and triggers re-processing
 */

const DeviceReport = ({ rawData = [], deviceId = "", deviceInfos = {}, deviceClass = "" }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [chartType, setChartType] = useState("instant");
  const [loading, setLoading] = useState(false);

  // store (date picker + range) from your zustand store
  const setSelectedDate = useReportStore((s) => s.setSelectedDate);
  const selectedDate = useReportStore((s) => s.selectedDate);
  const { range, setRange } = useReportStore();
  const [useRange, setUseRange] = useState(false);

  const isSensor = typeof deviceClass === "string" && (deviceClass.includes("temperature") || deviceClass.includes("humidity") || deviceClass.includes("air_quality"));

  // keep a ref to latest rawData to avoid stale closures
  const rawDataRef = useRef(rawData);
  useEffect(() => { rawDataRef.current = rawData; }, [rawData]);

  // helper to transform rawData fallback into the processed shape when needed
  const applyProcessing = (dataSource, chartType, selectedDate, useRange, range) => {
    try {
      return processChartData(Array.isArray(dataSource) ? dataSource : [], chartType, selectedDate, useRange, range) || [];
    } catch (e) {
      console.error("processChartData error:", e);
      return [];
    }
  };

  // ---------- Initial / reactive processing logic ----------
  // Three modes:
  // 1) single selected date (useRange === false && selectedDate set) --> try server fetch
  // 2) range mode (useRange === true && range.from/to set) --> process local rawData within range
  // 3) default (no selected date and no range) --> show instant processed from local rawData
  //
  // Important: avoid racing — we use an abort flag per invocation

  useEffect(() => {
    if (!deviceId) return;
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);

      // ---------- Single selected day ----------
      if (!useRange && selectedDate) {
        const formattedDate = dayjs(selectedDate).format("YYYY-MM-DD");
        try {
          const serverLogs = await fetchDeviceLogsByDate(deviceId, formattedDate);
          if (cancelled) return;
          const dataToUse = (Array.isArray(serverLogs) && serverLogs.length > 0)
            ? serverLogs
            : rawDataRef.current;
          const processed = applyProcessing(dataToUse, chartType, selectedDate, useRange, range);
          if (cancelled) return;
          setFilteredData(processed);
        } catch (err) {
          console.error(err);
          if (!cancelled) setFilteredData(applyProcessing(rawDataRef.current, chartType, selectedDate, useRange, range));
        } finally { if (!cancelled) setLoading(false); }
        return;
      }

      // ---------- Range selection ----------
      if (useRange && range?.from && range?.to) {

        try {
          // fetch server
          const startDate = dayjs(range.from).format("YYYY-MM-DD");
          const endDate = dayjs(range.to).format("YYYY-MM-DD");
          const deviceType = deviceClass || "sensor"; // or any mapping needed
          const serverLogs = await fetchDeviceLogsByRange(deviceType, deviceId, startDate, endDate);
          if (cancelled) return;

          const dataToUse = (Array.isArray(serverLogs) && serverLogs.length > 0)
            ? serverLogs
            : rawDataRef.current.filter(item => {
              const ts = item.timestamp || item.last_updated;
              return ts && dayjs(ts).isBetween(startDate, endDate, "day", "[]");
            });

          const processed = applyProcessing(dataToUse, chartType, selectedDate, true, range);
          if (!cancelled) setFilteredData(processed);
        } catch (err) {
          console.error(err);
          if (!cancelled) setFilteredData(applyProcessing(rawDataRef.current, chartType, selectedDate, true, range));
        } finally { if (!cancelled) setLoading(false); }
        return;
      }

      // ---------- Default ----------
      const processed = applyProcessing(rawDataRef.current, chartType, selectedDate, useRange, range);
      if (!cancelled) setFilteredData(processed);
      if (!cancelled) setLoading(false);
    };

    fetchData();
    return () => { cancelled = true; };
  }, [selectedDate, useRange, range?.from, range?.to, chartType, deviceId]);

  // ---------- Reprocess live updates when incoming rawData changes in default mode ----------
  useEffect(() => {
    if (!selectedDate && !useRange) {
      const out = applyProcessing(rawData, chartType, selectedDate, useRange, range);
      setFilteredData(out);
    }
    // keep rawDataRef updated (handled above)
  }, [rawData, chartType, selectedDate, useRange, range]);

  // ---------- Export ----------
  const handleExportToExcel = () => {
    exportToExcel(rawDataRef.current, deviceId);
  };

  
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

          {/* ChartDisplay expects processed data: an array of { time, temperature, humidity, ... } */}
          <ChartDisplay
            filteredData={filteredData}
            setFilteredData={setFilteredData}
            deviceId={deviceId}
            exportToExcel={handleExportToExcel}
          />
        </>
      ) : (
        <StateLogTable
          data={filteredData}
          deviceId={deviceId}
          exportToExcel={handleExportToExcel}
          deviceInfos={deviceInfos}
        />
      )}
    </Box>
  );
};

export default DeviceReport;
