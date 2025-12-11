import React from "react";
import { Box, Button } from "@mui/material";
import IconRenderer from "iot-icons";
import { ReportLocalization } from "../../Constants/Localizations/Localizations";
import "./DeviceReport.css";
import { useEntityStore } from "../../Store/entityStore";
import { Delete } from "lucide-react";
import axios from "axios";

const url = process.env.REACT_APP_HA_BASE_URL

const ChartHeader = ({ chartType, deviceId, deviceInfos }) => {
  const { devicesClass } = useEntityStore();
  const deviceClass = devicesClass[deviceId].deviceClass;

  const hHumidityLabel = "دما و رطوبت ساعتی";
  const hAirQualityLabel = ReportLocalization?.hAirQualityCart || "کیفیت هوا ساعتی";
  const temperatureLabel = "دما و رطوبت لحظه ای";
  const airQualityLabel = ReportLocalization?.airQualityCart || "کیفیت هوا لحظه ای";

  const handleClearLogs = async () => {
    try {
      const res = await axios.delete(
        `${url}/api/logs/execute/device/${deviceInfos.deviceType}/${deviceId}`
      );

      console.log("Logs cleared successfully", res.data);

      // اگر لازم است دیتای جدول را دوباره بگیری
      // fetchData && fetchData();

    } catch (err) {
      console.error("Clear logs error:", err);
    }
  };


  return (
    <Box
      className="report-chart-header"
      sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "space-between" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <h2
          className="report-chart-Name"
          style={{
            color: "var(--text-color)",
            margin: 0,
            fontFamily: "Lalezar, sans-serif",
          }}
        >
          {chartType === "hourly"
            ? deviceClass.includes("temp")
              ? hHumidityLabel
              : hAirQualityLabel
            : deviceClass.includes("temp")
              ? temperatureLabel
              : airQualityLabel}
        </h2>
        <IconRenderer deviceId={deviceId} width={32} height={32} color="#26c6da" />
      </Box>

      <Button
        variant="contained"
        startIcon={<Delete size={18} />}
        onClick={handleClearLogs}
        sx={{
          borderRadius: "10px",
          backgroundColor: "red",
          color: "white",
          px: 2,
          fontFamily: "Lalezar, sans-serif",
          fontSize: "14px",
          textTransform: "none",
          "&:hover": { backgroundColor: "#b30000" },
        }}
      >
        پاک کردن لاگ‌ها
      </Button>
    </Box>
  );
};

export default ChartHeader;


// import React from "react";
// import { Box } from "@mui/material";
// import IconRenderer from "iot-icons";
// import { ReportLocalization } from "../../Constants/Localizations/Localizations";
// import "./DeviceReport.css";
// import { useSockets } from "../../Contexts/SocketProvider";
// import { useEntityStore } from "../../Store/entityStore";

// const ChartHeader = ({ chartType, deviceId }) => {
//   const { devicesClass } = useEntityStore()
//   const deviceClass = devicesClass[deviceId].deviceClass

//   const hHumidityLabel = "دما و رطوبت ساعتی";
//   const hAirQualityLabel = ReportLocalization?.hAirQualityCart || "کیفیت هوا ساعتی";
//   const temperatureLabel = "دما و رطوبت لحظه ای";
//   const airQualityLabel = ReportLocalization?.airQualityCart || "کیفیت هوا لحظه ای";


//   return (
//     <Box className="report-chart-header" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//       <h2
//         className="report-chart-Name"
//         style={{
//           color: "var(--text-color)",
//           margin: 0,
//           fontFamily: "Lalezar, sans-serif"
//         }}
//       >
//         {chartType === "hourly"
//           ? (deviceClass.includes("temp") ? hHumidityLabel : hAirQualityLabel)
//           : (deviceClass.includes("temp") ? temperatureLabel : airQualityLabel)
//         }
//       </h2>
//       <IconRenderer deviceId={deviceId} width={32} height={32} color="#26c6da" />
//     </Box>
//   );
// };

// export default ChartHeader;

