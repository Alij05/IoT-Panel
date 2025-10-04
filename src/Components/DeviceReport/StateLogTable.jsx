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
} from "@mui/material";
import { Download } from "lucide-react";
import DescriptionIcon from '@mui/icons-material/Description';
import { toJalaliDateString } from "./DateUtils";

const StateLogTable = ({ data = [], deviceId, exportToExcel, deviceInfos }) => {

  return (
    <Box sx={{ mb: 4, fontFamily: "'Lalezar', sans-serif" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontFamily: "'Lalezar', sans-serif",
            fontSize: { xs: "16px", sm: "18px", md: "20px" },
            color: 'var(--text-color)'
          }}
        >
          <DescriptionIcon /> لاگ وضعیت دستگاه ({deviceInfos.deviceName} در {deviceInfos.deviceLocationName})
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
              backgroundColor: "#2daebc",
            },
          }}
        >
          خروجی Excel
        </Button>
      </Box>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        <Table sx={{ background: 'var(--white-50)' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "var(--blue)" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center", fontFamily: "'Lalezar', sans-serif" }}>زمان</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold", textAlign: "center", fontFamily: "'Lalezar', sans-serif" }}>وضعیت</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, index) => {
                const stateLower = String(row.state).toLowerCase();
                const isOn = stateLower === "on" || stateLower === "motion" || stateLower === "true";
                const isOff = stateLower === "off" || stateLower === "clear" || stateLower === "false";
                const chipLabel = isOn ? "روشن" : isOff ? "خاموش" : "غیر فعال";

                return (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "var(--white-50)" : "var(--white)",
                      "&:hover": { backgroundColor: index % 2 === 0 ? "var(--white-50)" : "var(--white)" },
                      transition: "none",
                    }}
                  >
                    <TableCell
                      sx={{
                        textAlign: "center",
                        fontFamily: "'Lalezar', sans-serif",
                        color: "var(--text-color)",
                        fontSize: '16px'
                      }}
                    >
                      {toJalaliDateString(row.timestamp)}
                    </TableCell>
                    <TableCell>
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
                            backgroundColor: isOn
                              ? "#26c6da"  // روشن
                              : isOff
                                ? "#ec407a"  // خاموش
                                : "#868686",  // غیر فعال
                            textAlign: "center",
                          }}
                        />
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={2}
                  align="center"
                  sx={{
                    fontFamily: "'Lalezar', sans-serif",
                    color: "var(--text-color)",
                  }}
                >
                  هیچ لاگی برای نمایش وجود ندارد
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default StateLogTable;
