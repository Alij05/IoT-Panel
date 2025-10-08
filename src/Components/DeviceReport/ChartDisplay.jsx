import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button } from "@mui/material";
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
 * ChartDisplay (fixed)
 * - Accepts either rawData items ({ state: "25.5/42.2", timestamp: "..." })
 *   OR processed items ({ temperature, humidity, time })
 * - Normalizes to: { time: ISO-or-string, temperature: Number, humidity: Number, _orig: original }
 * - Uses an internal originalRef to allow reliable reset
 */

const ChartDisplay = ({ filteredData = [], setFilteredData, deviceId, exportToExcel }) => {
  const originalRef = useRef([]);
  const [localData, setLocalData] = useState([]);

  // keep a stable copy of the original incoming data so reset works
  useEffect(() => {
    originalRef.current = Array.isArray(filteredData) ? filteredData : [];
    // build normalized local data whenever filteredData prop changes
    setLocalData(normalizeData(filteredData));
  }, [filteredData]);

  // Normalization helper
  function normalizeData(data) {
    if (!Array.isArray(data)) return [];

    const normalized = data
      .map((item) => {
        // If item already has temperature/humidity/time use it
        if (item && (item.temperature !== undefined || item.humidity !== undefined) && item.time) {
          return {
            time: item.time,
            temperature: Number(item.temperature),
            humidity: Number(item.humidity),
            _orig: item,
          };
        }

        // If item has state/timestamp (raw format)
        if (item && typeof item.state === "string" && (item.timestamp || item.last_updated)) {
          const ts = item.timestamp || item.last_updated;
          const parts = item.state.split("/").map((v) => Number(v));
          const [temperature, humidity] = parts.length >= 2 ? parts : [parts[0], undefined];
          return {
            time: ts,
            temperature: Number(temperature),
            humidity: Number(humidity),
            _orig: item,
          };
        }

        // If item is already a simple map like { time, temperature, humidity }
        if (item && item.time && (item.temperature !== undefined || item.humidity !== undefined)) {
          return {
            time: item.time,
            temperature: Number(item.temperature),
            humidity: Number(item.humidity),
            _orig: item,
          };
        }

        // Unknown shape -> skip
        return null;
      })
      .filter(Boolean)
      // sort ascending by time (try Date parsing; if not parseable, keep original order)
      .sort((a, b) => {
        const ta = Date.parse(a.time);
        const tb = Date.parse(b.time);
        if (!isNaN(ta) && !isNaN(tb)) return ta - tb;
        if (!isNaN(ta)) return -1;
        if (!isNaN(tb)) return 1;
        return 0;
      });

    return normalized;
  }

  // processedData memoized
  const processedData = useMemo(() => {
    return localData.map((d) => {
      // displayTime: if time parses as ISO -> convert to Jalali friendly string
      let displayTime = d.time;
      const parsed = Date.parse(d.time);
      if (!isNaN(parsed)) {
        // if it's a valid ISO/Date string -> convert to Jalali via helper
        displayTime = toJalaliDateString(d.time);
      } else {
        // otherwise assume it's already formatted (maybe Jalali) -> keep as is
        displayTime = d.time;
      }
      return {
        ...d,
        displayTime,
      };
    });
  }, [localData]);

  const formatTemperature = (val) => (val === undefined || val === null ? "-" : `${parseFloat(val).toFixed(1)}°`);
  const formatHumidity = (val) => (val === undefined || val === null ? "-" : `${parseFloat(val).toFixed(1)}%`);

  const handleReset = () => {
    // restore original prop data (not mutated)
    setLocalData(normalizeData(originalRef.current));
    // if parent expects filteredData to change as well, update it:
    if (typeof setFilteredData === "function") {
      setFilteredData(originalRef.current);
    }
  };

  return (
    <Box className="report-chart-section" sx={{ width: "100%" }}>
      <div className="report-chart-buttons-section">
        <Button
          sx={{ mt: 0.5 }}
          className="report-chart-restart-button"
          onClick={handleReset}
        >
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
            "&:hover": {
              backgroundColor: "#041235",
            },
          }}
        >
          خروجی Excel
        </Button>
      </div>

      {/* نمودار دما */}
      <Box sx={{ width: "100%", height: 300, mb: 4 }}>
        <h3 style={{ color: "var(--text-color)" }}>دمای دستگاه</h3>
        <ResponsiveContainer>
          <AreaChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#26c6da" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#26c6da" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="displayTime"
              tickFormatter={(timeStr) => (timeStr ? timeStr : "")}
              tick={{ fontSize: 12 }}
            />

            <YAxis
              tick={({ x, y, payload }) => (
                <text x={x} y={y} fill="var(--text-color)" textAnchor="end">
                  <tspan x={0} dy="0.3em">{formatTemperature(payload.value)}</tspan>
                </text>
              )}
              domain={["auto", "auto"]}
            />

            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip
              labelFormatter={(label) => `زمان: ${label}`}
              formatter={(value) => [formatTemperature(value)]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="#26c6da"
              fillOpacity={0.5}
              fill="url(#tempGradient)"
            />
            <Brush
              dataKey="displayTime"
              height={28}
              stroke="#26c6da"
              travellerWidth={10}
              tickFormatter={() => ""}
              tick={{ fontSize: 11, fill: "#26c6da" }}
              tickMargin={20}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      {/* نمودار رطوبت */}
      <Box sx={{ width: "100%", height: 300 }}>
        <h3 style={{ color: "var(--text-color)" }}>رطوبت دستگاه</h3>
        <ResponsiveContainer>
          <AreaChart
            data={processedData}
            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="humGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec407a" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ec407a" stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="displayTime"
              tickFormatter={(timeStr) => (timeStr ? timeStr : "")}
              tick={{ fontSize: 12 }}
            />

            <YAxis
              tick={({ x, y, payload }) => (
                <text x={x} y={y} fill="var(--text-color)" textAnchor="end">
                  <tspan x={0} dy="0.3em">{formatHumidity(payload.value)}</tspan>
                </text>
              )}
              domain={["auto", "auto"]}
            />

            <CartesianGrid strokeDasharray="3 3" />
            <Tooltip
              labelFormatter={(label) => `زمان: ${label}`}
              formatter={(value) => [formatHumidity(value)]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="humidity"
              stroke="#ec407a"
              fillOpacity={0.5}
              fill="url(#humGradient)"
            />
            <Brush
              dataKey="displayTime"
              height={28}
              stroke="#ec407a"
              travellerWidth={10}
              tickFormatter={() => ""}
              tick={{ fontSize: 11, fill: "#ec407a" }}
              tickMargin={20}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export default ChartDisplay;
