import React from "react";
import { Box, Button } from "@mui/material";
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

const ChartDisplay = ({ filteredData, setFilteredData, deviceId, exportToExcel }) => {

  const processedData = filteredData
    .map(item => {
      const [temperature, humidity] = item.state.split("/").map(Number);
      return {
        time: item.timestamp,
        temperature,
        humidity,
      };
    })
    .sort((a, b) => new Date(a.time) - new Date(b.time)); // مرتب‌سازی بر اساس زمان

  const formatTemperature = (val) => `${parseFloat(val).toFixed(1)}°`;
  const formatHumidity = (val) => `${parseFloat(val).toFixed(1)}%`;

  return (
    <Box className="report-chart-section" sx={{ width: "100%" }}>

      <div className="report-chart-buttons-section">
        <Button sx={{ mt: 0.5 }} className="report-chart-restart-button" onClick={() => setFilteredData([...filteredData])}>
          {ReportLocalization.resetZoom}
        </Button>
        <Button className="report-chart-exel-button" sx={{ mt: 0.5 }} onClick={exportToExcel}>
          خروجی Excel
        </Button>
      </div>

      {/* نمودار دما */}
      <Box sx={{ width: "100%", height: 300, mb: 4 }}>
        <h3 style={{ color: 'var(--text-color)' }}>دمای دستگاه</h3>
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
              dataKey="time"
              tickFormatter={(timeStr) => toJalaliDateString(timeStr)}
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
              labelFormatter={(label) => `زمان: ${toJalaliDateString(label)}`}
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
              dataKey="time"
              height={28}
              stroke="#26c6da"
              travellerWidth={10}
              tickFormatter={() => ''}
              tick={{ fontSize: 11, fill: "#26c6da" }}
              tickMargin={20}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>

      {/* نمودار رطوبت */}
      <Box sx={{ width: "100%", height: 300 }}>
        <h3 style={{ color: 'var(--text-color)' }}>رطوبت دستگاه</h3>
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
              dataKey="time"
              tickFormatter={(timeStr) => toJalaliDateString(timeStr)}
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
              labelFormatter={(label) => `زمان: ${toJalaliDateString(label)}`}
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
              dataKey="time"
              height={28}
              stroke="#ec407a"
              travellerWidth={10}
              tickFormatter={() => ''}
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
