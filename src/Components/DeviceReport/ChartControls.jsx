import React from "react";
import { Box, ToggleButtonGroup, ToggleButton } from "@mui/material";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { ReportLocalization } from "../../Constants/Localizations/Localizations";
import "./DeviceReport.css";

const ChartControls = ({
  chartType,
  setChartType,
  selectedDate,
  setSelectedDate,
  useRange,
  setUseRange,
  range,
  setRange,
}) => {
  return (
    <>
      <Box className="report-chart-type-section">
        <ToggleButtonGroup
          className="toggle-group"
          value={chartType}
          exclusive
          onChange={(e, val) => val && setChartType(val)}
        >
          <ToggleButton
            value="hourly"
            className="report-chart-type-button"
            sx={{
              padding: "8px 16px",
              backgroundColor: "rgb(218, 218, 218)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              "&.Mui-selected": {
                backgroundColor: "#26a69a",
                color: "white",
                "&:hover": {
                  backgroundColor: "#20907f",
                },
              },
            }}
          >
            {ReportLocalization.hChart}
          </ToggleButton>
          <ToggleButton
            value="instant"
            className="report-chart-type-button"
            sx={{
              padding: "8px 16px",
              backgroundColor: "rgb(218, 218, 218)",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              "&.Mui-selected": {
                backgroundColor: "#26a69a",
                color: "white",
                "&:hover": {
                  backgroundColor: "#20907f",
                },
              },
            }}
          >
            {ReportLocalization.Chart}
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
          <Box className="range-pickers">
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
