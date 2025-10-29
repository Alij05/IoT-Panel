import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment-jalaali";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import "./Notifications.css";

const url = process.env.REACT_APP_IOT;

export default function Notifications() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const getAlertsHandler = async () => {
            try {
                const res = await axios.get(`${url}/api/alerts`);
                setAlerts(res.data.alerts);
            } catch (err) {
                console.error("Error fetching alerts:", err);
            }
        };

        getAlertsHandler();
    }, []);

    return (
        <div className="notif-page">
            <h1 className="users-title">لیست اعلان ها</h1>

            {alerts.length === 0 ? (
                <div className="notif-empty">هیچ نوتیفیکیشنی وجود ندارد</div>
            ) : (
                <div className="notif-table-wrapper">
                    <table className="notif-table">
                        <thead>
                            <tr>
                                <th>سطح</th>
                                <th>پیغام</th>
                                <th>دستگاه</th>
                                <th>زمان</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alerts.map((notif) => (
                                <tr
                                    key={notif._id}
                                    className={`notif-item ${notif.level === "Danger"
                                        ? "danger"
                                        : notif.level === "Warning"
                                            ? "warning"
                                            : "info"
                                        }`}
                                >
                                    <td className="notif-icon">
                                        {notif.level === "Danger" ? (
                                            <ErrorOutlineIcon />
                                        ) : notif.level === "Warning" ? (
                                            <WarningAmberIcon />
                                        ) : (
                                            <InfoOutlinedIcon />
                                        )}
                                    </td>
                                    <td>{notif.message}</td>
                                    <td>{notif.deviceId}</td>
                                    <td>{moment(notif.extra.timestamp).format("jYYYY/jMM/jDD HH:mm:ss")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
