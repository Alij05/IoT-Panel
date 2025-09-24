import React from "react";
import { Box } from "@mui/material";
import IconRenderer from "iot-icons";
import { ReportLocalization } from "../../Constants/Localizations/Localizations";
import "./DeviceReport.css";

const ChartHeader = ({ chartType, isHumidity, Entity }) => {
  return (
    <Box className="report-chart-header">
      <h2 className="report-chart-Name">
        {chartType === "hourly"
          ? isHumidity
            ? ReportLocalization.hHumidityCart
            : ReportLocalization.hTemperatureCart
          : isHumidity
          ? ReportLocalization.humidityChart
          : ReportLocalization.temperatureCart}
      </h2>
      <IconRenderer entityId={Entity} width={32} height={32} />
    </Box>
  );
};

export default ChartHeader;
