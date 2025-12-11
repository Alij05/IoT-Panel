import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Download, Delete } from "lucide-react";
import DescriptionIcon from "@mui/icons-material/Description";
import { toJalaliDateString } from "./DateUtils";
import axios from "axios";

const url = process.env.REACT_APP_HA_BASE_URL

const StateLogTable = ({ data = [], deviceId, exportToExcel, deviceInfos }) => {
  // helper: extract timestamp from multiple possible keys
  const extractTimestamp = (row) => {
    if (!row) return null;
    return (
      row.timestamp ||
      row.time ||
      row.last_changed ||
      row.last_updated ||
      row.ts ||
      (row.extra && row.extra.timestamp) ||
      null
    );
  };

  const formatTime = (rawTs) => {
    if (!rawTs) return "-";
    try {
      // Convert to Jalali format if parsable
      return toJalaliDateString(rawTs);
    } catch (e) {
      // If conversion fails, show raw string
      return String(rawTs);
    }
  };

  const detectStateLabel = (stateVal) => {
    if (stateVal === null || stateVal === undefined)
      return { label: "نامشخص", color: "#868686" };

    const s = String(stateVal).trim().toLowerCase();

    // "on" states
    const onSet = new Set(["on", "true", "1", "motion", "open", "active"]);
    const offSet = new Set(["off", "false", "0", "clear", "closed", "inactive"]);

    if (onSet.has(s)) return { label: "روشن", color: "#00a053" };
    if (offSet.has(s)) return { label: "خاموش", color: "#d9000e" };

    // Numeric values (like temperature)
    if (!Number.isNaN(Number(s))) return { label: s, color: "#26c6da" };

    // Fallback
    return { label: stateVal, color: "#868686" };
  };

  const handleClearLogs = async () => {
    console.log(deviceInfos);

    if (!deviceInfos?.deviceType || !deviceId) return;

    try {
      const res = await axios.delete(
        `${url}/api/logs/execute/device/${deviceInfos.deviceType}/${deviceId}`
      );

      console.log(res);

      // Optional: refresh data after deletion
      // if (fetchData) fetchData();

    } catch (error) {
      console.error("Clear logs error:", error);
    }
  };

  const isLoading = !data || data.length === 0;

  return (
    <Box sx={{ mb: 4, fontFamily: "'Lalezar', sans-serif" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={1}
      >
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontFamily: "'Lalezar', sans-serif",
            fontSize: { xs: "16px", sm: "18px", md: "20px" },
            color: "var(--text-color)",
          }}
        >
          <DescriptionIcon /> لاگ وضعیت دستگاه (
          {deviceInfos?.deviceName || ""} در{" "}
          {deviceInfos?.deviceLocationName || ""})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Download size={18} />}
          onClick={exportToExcel}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            px: 2,
            backgroundColor: "var(--blue)",
            color: "white",
            fontFamily: "'Lalezar', sans-serif",
            fontSize: { xs: "12px", sm: "14px", md: "16px" },
            "&:hover": {
              backgroundColor: "#041235",
            },
          }}
        >
          خروجی Excel
        </Button>

        <Button
          variant="contained"
          startIcon={<Delete size={18} />}
          onClick={handleClearLogs}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            px: 2,
            backgroundColor: "red",
            color: "white",
            fontFamily: "'Lalezar', sans-serif",
            fontSize: { xs: "12px", sm: "14px", md: "16px" },
            "&:hover": {
              backgroundColor: "#b30000",
            },
          }}
        >
          پاک کردن لاگ‌ها
        </Button>

      </Box>

      {/* Loader while data is loading */}
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
            flexDirection: "column",
            color: "var(--text-color)",
          }}
        >
          <CircularProgress sx={{ color: "var(--blue)", mb: 2 }} />
          <Typography sx={{ fontFamily: "'Lalezar', sans-serif" }}>
            در حال بارگذاری داده‌ها...
          </Typography>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          }}
        >
          <Table sx={{ background: "var(--white-50)", borderCollapse: "separate" }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: "var(--blue)" }}>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                    fontFamily: "'Lalezar', sans-serif",
                    borderBottom: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  زمان
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                    fontFamily: "'Lalezar', sans-serif",
                    borderBottom: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  وضعیت
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...data].reverse().map((row, index) => {
                const ts = extractTimestamp(row);
                const timeStr = formatTime(ts);
                const stateVal =
                  row.state ??
                  row.value ??
                  row.value_text ??
                  row._orig?.state ??
                  null;
                const { label: chipLabel, color: chipColor } =
                  detectStateLabel(stateVal);

                return (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor:
                        index % 2 === 0
                          ? "var(--white-50)"
                          : "color-mix(in oklab, var(--white) 20%, transparent) !important",
                      "&:hover": {
                        backgroundColor:
                          index % 2 === 0
                            ? "var(--white-50)"
                            : "color-mix(in oklab, var(--white) 20%, transparent) !important",
                      },
                      transition: "none",
                      borderBottom: "none",
                    }}
                  >
                    <TableCell
                      sx={{
                        textAlign: "center",
                        fontFamily: "'Lalezar', sans-serif",
                        color: "var(--text-color)",
                        fontSize: "16px",
                        borderBottom: "none",
                      }}
                    >
                      {timeStr}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                        }}
                      >
                        <Chip
                          label={chipLabel}
                          variant="filled"
                          sx={{
                            fontFamily: "'Lalezar', sans-serif",
                            fontSize: "0.85rem",
                            borderRadius: "8px",
                            width: 80,
                            height: 36,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            color: "white",
                            backgroundColor: chipColor,
                            textAlign: "center",
                          }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default StateLogTable;
