import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { Download } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Brush,
  Legend,
} from "recharts";
import { ReportLocalization } from "../../Constants/Localizations/Localizations";
import { toJalaliDateString } from "./DateUtils";
import "./DeviceReport.css";

/**
 * ChartDisplay component (dynamic labels for value1/value2)
 */
const ChartDisplay = ({ filteredData = [], setFilteredData, deviceId, exportToExcel, loading = false }) => {
  const originalRef = useRef([]);
  const [localData, setLocalData] = useState([]);
  const [labels, setLabels] = useState({ value1: "مقدار ۱", value2: "مقدار ۲" });

  // Keep a stable copy of original data
  useEffect(() => {
    originalRef.current = Array.isArray(filteredData) ? filteredData : [];
    const normalized = normalizeData(filteredData);
    setLocalData(normalized);

    // Determine labels dynamically
    if (normalized.length > 0) {
      const first = normalized[0];
      if (first.value1 && first.value2) {
        // Check if values are numeric and likely temp/humidity
        if (!isNaN(first.value1) && !isNaN(first.value2)) {
          setLabels({ value1: "دمای دستگاه", value2: "رطوبت دستگاه" });
        } else {
          setLabels({ value1: "مقدار ۱", value2: "مقدار ۲" });
        }
      } else {
        setLabels({ value1: "مقدار", value2: null });
      }
    }
  }, [filteredData]);

  // Normalize data to consistent format for charts
  const normalizeData = (data) => {
    if (!Array.isArray(data)) return [];
    return data
      .map((item) => {
        if (!item || !item.time || item.value === undefined) return null;
        const val = String(item.value);
        const parts = val.includes("/") ? val.split("/") : [val];
        return {
          time: item.time,
          value1: parts[0],
          value2: parts[1],
          _orig: item,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  };

  // Processed data for chart
  const processedData = useMemo(() => {
    return localData.map((d) => {
      let displayTime = d.time;
      const parsed = Date.parse(d.time);
      if (!isNaN(parsed)) displayTime = toJalaliDateString(d.time);
      return { ...d, displayTime };
    });
  }, [localData]);

  const formatValue = (val) => (val === undefined || val === null ? "-" : val);

  // Reset chart
  const handleReset = () => {
    setLocalData(normalizeData(originalRef.current));
    if (typeof setFilteredData === "function") setFilteredData(originalRef.current);
  };

  const isLoading = loading || !filteredData || filteredData.length === 0;

  return (
    <Box className="report-chart-section" sx={{ width: "100%" }}>
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: "400px",
            color: "var(--text-color)",
          }}
        >
          <CircularProgress sx={{ color: "var(--blue)", mb: 2 }} />
          <Typography sx={{ fontFamily: "'Lalezar', sans-serif" }}>
            در حال بارگذاری داده‌ها...
          </Typography>
        </Box>
      ) : (
        <>
          <div className="report-chart-buttons-section">
            <Button sx={{ mt: 0.5 }} className="report-chart-restart-button" onClick={handleReset}>
              {ReportLocalization.resetZoom}
            </Button>

            <Button
              variant="contained"
              startIcon={<Download size={18} />}
              onClick={exportToExcel}
              sx={{
                mt: 0.5,
                borderRadius: "12px",
                textTransform: "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                px: 2,
                backgroundColor: "var(--blue)",
                color: "white",
                fontFamily: "'Lalezar', sans-serif",
                fontSize: { xs: "12px", sm: "14px", md: "16px" },
                "&:hover": { backgroundColor: "#041235" },
              }}
            >
              خروجی Excel
            </Button>
          </div>

          {/* First Value Chart */}
          <Box sx={{ width: "100%", height: 300, mb: 4 }}>
            <h3 style={{ color: "var(--text-color)" }}>{labels.value1}</h3>
            <ResponsiveContainer>
              <AreaChart data={processedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="value1Gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#26c6da" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#26c6da" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="displayTime" tickFormatter={(timeStr) => (timeStr ? timeStr : "")} tick={{ fontSize: 12 }} />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip labelFormatter={(label) => `زمان: ${label}`} formatter={(value) => [formatValue(value)]} />
                <Legend />
                <Area type="monotone" dataKey="value1" stroke="#26c6da" fillOpacity={0.5} fill="url(#value1Gradient)" />
                <Brush dataKey="displayTime" height={28} stroke="#26c6da" travellerWidth={10} tickFormatter={() => ""} />
              </AreaChart>
            </ResponsiveContainer>
          </Box>

          {/* Second Value Chart (only if value2 exists) */}
          {labels.value2 && (
            <Box sx={{ width: "100%", height: 300 }}>
              <h3 style={{ color: "var(--text-color)" }}>{labels.value2}</h3>
              <ResponsiveContainer>
                <AreaChart data={processedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="value2Gradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec407a" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ec407a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="displayTime" tickFormatter={(timeStr) => (timeStr ? timeStr : "")} tick={{ fontSize: 12 }} />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip labelFormatter={(label) => `زمان: ${label}`} formatter={(value) => [formatValue(value)]} />
                  <Legend />
                  <Area type="monotone" dataKey="value2" stroke="#ec407a" fillOpacity={0.5} fill="url(#value2Gradient)" />
                  <Brush dataKey="displayTime" height={28} stroke="#ec407a" travellerWidth={10} tickFormatter={() => ""} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ChartDisplay;
