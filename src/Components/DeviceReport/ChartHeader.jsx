import React from "react";
import { Box } from "@mui/material";
import IconRenderer from "iot-icons";
import { ReportLocalization } from "../../Constants/Localizations/Localizations";
import "./DeviceReport.css";

const ChartHeader = ({ chartType, deviceId }) => {
  console.log(deviceId);

  return (
    <Box className="report-chart-header">
      <h2 className="report-chart-Name">
        {chartType === "hourly" ?
          deviceId.includes('sensor.temperature_humidity_sht20_humidity') ? ReportLocalization.hHumidityCart : deviceId.includes('sensor.temperature_humidity_sht20_temperature') ? ReportLocalization.hTemperatureCart : ReportLocalization.hAirQualityCart
          :
          deviceId.includes('sensor.temperature_humidity_sht20_humidity') ? ReportLocalization.humidityChart : deviceId.includes('sensor.temperature_humidity_sht20_temperature') ? ReportLocalization.temperatureCart : ReportLocalization.airQualityCart
        }
      </h2>
      <IconRenderer deviceId={deviceId} width={32} height={32} />
    </Box>
  );
};

export default ChartHeader;
