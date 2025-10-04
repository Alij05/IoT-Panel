import React from "react";
import { Box } from "@mui/material";
import IconRenderer from "iot-icons";
import { ReportLocalization } from "../../Constants/Localizations/Localizations";
import "./DeviceReport.css";

const ChartHeader = ({ chartType, deviceId }) => {

  return (
    <Box className="report-chart-header" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <h2
        className="report-chart-Name"
        style={{
          color: "#26c6da",
          margin: 0,
          fontFamily: "Lalezar, sans-serif"
        }}
      >
        {chartType === "hourly"
          ? deviceId.includes('sensor.temperature_humidity_sht20_humidity')
            ? ReportLocalization.hHumidityCart
            : deviceId.includes('sensor.temperature_humidity_sht20_temperature')
              ? ReportLocalization.hTemperatureCart
              : ReportLocalization.hAirQualityCart
          : deviceId.includes('sensor.temperature_humidity_sht20_humidity')
            ? ReportLocalization.humidityChart
            : deviceId.includes('sensor.temperature_humidity_sht20_temperature')
              ? ReportLocalization.temperatureCart
              : ReportLocalization.airQualityCart
        }
      </h2>
      <IconRenderer deviceId={deviceId} width={32} height={32} color="#26c6da" />
    </Box>
  );
};

export default ChartHeader;
