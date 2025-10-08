import React from "react";
import { Box } from "@mui/material";
import IconRenderer from "iot-icons";
import { ReportLocalization } from "../../Constants/Localizations/Localizations";
import "./DeviceReport.css";
import { useSockets } from "../../Contexts/SocketProvider";
import { useEntityStore } from "../../Store/entityStore";

const ChartHeader = ({ chartType, deviceId }) => {
  const { devicesClass } = useEntityStore()
  const deviceClass = devicesClass[deviceId].deviceClass

  const hHumidityLabel = "دما و رطوبت ساعتی";
  const hAirQualityLabel = ReportLocalization?.hAirQualityCart || "کیفیت هوا ساعتی";
  const temperatureLabel = "دما و رطوبت لحظه ای";
  const airQualityLabel = ReportLocalization?.airQualityCart || "کیفیت هوا لحظه ای";


  return (
    <Box className="report-chart-header" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <h2
        className="report-chart-Name"
        style={{
          color: "var(--text-color)",
          margin: 0,
          fontFamily: "Lalezar, sans-serif"
        }}
      >
        {chartType === "hourly"
          ? (deviceClass.includes("temp") ? hHumidityLabel : hAirQualityLabel)
          : (deviceClass.includes("temp") ? temperatureLabel : airQualityLabel)
        }
      </h2>
      <IconRenderer deviceId={deviceId} width={32} height={32} color="#26c6da" />
    </Box>
  );
};

export default ChartHeader;
