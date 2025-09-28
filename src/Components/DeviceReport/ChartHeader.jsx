import React from "react";
import { Box } from "@mui/material";
import IconRenderer from "iot-icons";
import { ReportLocalization } from "../../Constants/Localizations/Localizations";
import "./DeviceReport.css";

const ChartHeader = ({ chartType, Entity }) => {
  console.log(Entity);

  return (
    <Box className="report-chart-header">
      <h2 className="report-chart-Name">
        {chartType === "hourly" ?
          Entity.includes('sensor.temperature_humidity_sht20_humidity') ? ReportLocalization.hHumidityCart : Entity.includes('sensor.temperature_humidity_sht20_temperature') ? ReportLocalization.hTemperatureCart : ReportLocalization.hAirQualityCart
          :
          Entity.includes('sensor.temperature_humidity_sht20_humidity') ? ReportLocalization.humidityChart : Entity.includes('sensor.temperature_humidity_sht20_temperature') ? ReportLocalization.temperatureCart : ReportLocalization.airQualityCart
        }
      </h2>
      <IconRenderer entityId={Entity} width={32} height={32} />
    </Box>
  );
};

export default ChartHeader;
