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

const ChartDisplay = ({ filteredData, setFilteredData, isHumidity, deviceId, exportToExcel }) => {
  const formatValue = (val) =>
    isHumidity
      ? `${parseFloat(val).toFixed(1)}%`
      : `${parseFloat(val).toFixed(1)}°`;

  return (
    <Box className="report-chart-section" sx={{ width: "100%", height: 400 }}>
      {/* دکمه‌ها */}
      <div className="report-chart-buttons-section">
        <Button
          sx={{ mt: 0.5 }}
          onClick={() => setFilteredData([...filteredData])}
          className="report-chart-restart-button"
        >
          {ReportLocalization.resetZoom}
        </Button>
        <Button
          className="report-chart-exel-button"
          sx={{ mt: 0.5 }}
          onClick={exportToExcel}
        >
          خروجی Excel
        </Button>
      </div>

      <ResponsiveContainer>
        <AreaChart
          data={filteredData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#26a69a" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#26a69a" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* محور X بدون تغییر */}
          <XAxis
            tick={{ fontSize: 13.5 }}
            dataKey="time"
            tickFormatter={(timeStr) => toJalaliDateString(timeStr)}
          />

          {/* محور Y سفارشی برای tspan x=0 */}
          <YAxis
            tick={({ x, y, payload }) => (
              <text x={x} y={y} fill="black" textAnchor="end">
                <tspan x={0} dy="0.3em">{formatValue(payload.value)}</tspan>
              </text>
            )}
            domain={["auto", "auto"]}
          />

          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip
            labelFormatter={(label) => `زمان: ${toJalaliDateString(label)}`}
            formatter={(value) => {
              if (isHumidity) {
                return [`${parseFloat(value).toFixed(1)}%`];
              } else {
                return [`${parseFloat(value).toFixed(1)}°`];
              }
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#1d7c73ff"
            fillOpacity={0.5}
            fill="var(--blue)"
          />
          {/* <Brush dataKey="time" height={25} stroke="#26a69a" /> */}
          <Brush
            dataKey="time"
            height={28}
            stroke="var(--blue)"
            travellerWidth={10}
            tickFormatter={() => ''}
            tick={{ fontSize: 11, fill: "#16665f" }}
            tickMargin={20}   // ← فاصله متن از محور
          />


        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ChartDisplay;
