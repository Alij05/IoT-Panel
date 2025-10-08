import React from "react";
import { Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { ReportLocalization } from "../../Constants/Localizations/Localizations";
import "./DeviceReport.css";

const ChartControls = ({ chartType, setChartType, selectedDate, setSelectedDate, useRange, setUseRange, range, setRange }) => {
  console.log('ReportLocalization.hChart', ReportLocalization.hChart);

  const buttons = [
    { value: "hourly", label: ReportLocalization.hChart },
    { value: "instant", label: ReportLocalization.Chart }
  ];

  return (
    <>
      <Box className="report-chart-type-section" sx={{ display: "flex", gap: 8, mb: 2 }}>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={(e, val) => val && setChartType(val)}
          sx={{ display: "flex", gap: 2 }}
        >
          <ToggleButton
            value="hourly"
            sx={{
              padding: "8px 16px",
              borderRadius: "4px",
              color: "var(--white)",
              textTransform: "none",
              fontFamily: "'Lalezar', sans-serif",
              backgroundColor: "#bfbfbf",
              "&.Mui-selected": {
                backgroundColor: "var(--blue)",
                color: "var(--white)",
              },
              "&:hover": {
                backgroundColor: "var(--blue)",
              },
            }}
          >
            {"نمودار ساعتی"}
          </ToggleButton>

          <ToggleButton
            value="instant"
            sx={{
              padding: "8px 16px",
              borderRadius: "4px",
              color: "var(--white)",
              textTransform: "none",
              fontFamily: "'Lalezar', sans-serif",
              backgroundColor: "#bfbfbf",
              "&.Mui-selected": {
                backgroundColor: "var(--blue)",
                color: "var(--white)",
              },
              "&:hover": {
                backgroundColor: "var(--blue)",
              },
            }}
          >
            {"نمودار لحظه‌ای"}
          </ToggleButton>
        </ToggleButtonGroup>

      </Box>

      <Box className="report-chart-datePicker-section">
        {!useRange && (
          <DatePicker
            className="report-chart-DatePicker"
            value={selectedDate}
            onChange={(date) =>
              setSelectedDate(date.toDate ? date.toDate() : date)
            }
            calendar={persian}
            locale={persian_fa}
            calendarPosition="bottom-center"
            format="YYYY/MM/DD"
          />
        )}
      </Box>

      <Box className="report-chart-period-datePicker-section">
        <div className="report-period-toggle">
          <label htmlFor="report-period-toggle" className="date-picker-label">
            {ReportLocalization.periodDate}
          </label>
          <input
            type="checkbox"
            id="report-period-toggle"
            checked={useRange}
            onChange={(e) => setUseRange(e.target.checked)}
            className="report-chart-period-datePicker-checkbox"
          />
        </div>

        {useRange && (
          <Box className="range-pickers" sx={{ display: "flex", gap: 1 }}>
            <DatePicker
              placeholder={ReportLocalization.fromDate}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              value={range.from}
              onChange={(val) =>
                setRange({ ...range, from: val?.toDate?.() ?? val })
              }
            />
            <DatePicker
              placeholder={ReportLocalization.toDate}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              value={range.to}
              onChange={(val) =>
                setRange({ ...range, to: val?.toDate?.() ?? val })
              }
            />
          </Box>
        )}
      </Box>
    </>
  );
};

export default ChartControls;
