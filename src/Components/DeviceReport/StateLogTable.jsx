import React from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Button, Chip, } from "@mui/material";
import { Download } from "lucide-react";
import { toJalaliDateString } from "./DateUtils";
import DescriptionIcon from '@mui/icons-material/Description';

import './StateLogTable.css'

const StateLogTable = ({ data = [], deviceId, exportToExcel, deviceInfos }) => {

  console.log(deviceInfos);
  

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          < DescriptionIcon /> لاگ وضعیت دستگاه ({deviceInfos.deviceName} در {deviceInfos.deviceLocationName})
        </Typography>
        <Button
          variant="contained"
          color="success"
          startIcon={<Download size={18} />}
          onClick={exportToExcel}
          sx={{ borderRadius: "12px", textTransform: "none" }}
        >
          خروجی Excel
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "var(--blue)" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>زمان</TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>وضعیت</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "#f9f9f9" },
                    "&:hover": { backgroundColor: "#e3f2fd" },
                    transition: "0.2s",
                  }}
                >
                  <TableCell>{toJalaliDateString(row.time)}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        String(row.value).toLowerCase() === "on"
                          ? "روشن"
                          : String(row.value).toLowerCase() === "off"
                            ? "خاموش"
                            : 'غیر فعال'
                      }
                      color={
                        String(row.value).toLowerCase() === "on"
                          ? "success"
                          : String(row.value).toLowerCase() === "off"
                            ? "error"
                            : "default"
                      }
                      variant="filled"
                      sx={{ fontWeight: "bold", borderRadius: "8px", px: 1.5, py: 0.5 }}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center">
                  <Typography color="text.secondary">
                    هیچ لاگی برای نمایش وجود ندارد
                  </Typography>
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
