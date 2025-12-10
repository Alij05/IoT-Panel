import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment-jalaali";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import "./Notifications.css";
import { useSockets } from "../../Contexts/SocketProvider";

const url = process.env.REACT_APP_HA_BASE_URL;


export default function Notifications() {
    const { sensorsAlert } = useSockets()

    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        const getInitAlerts = async () => {
            try {
                const res = await axios.get(`${url}/api/alerts`);
                const dbAlerts = Array.isArray(res.data.alerts) ? res.data.alerts.slice(0, 20) : [];

                setAlerts(dbAlerts);
            } catch (err) {
                console.error("Error fetching alerts:", err);
            }
        };

        getInitAlerts();
    }, []);


    useEffect(() => {
        if (sensorsAlert.length > 0) {
            setAlerts(prev => {
                const newAlerts = sensorsAlert.filter(alert =>
                    !prev.some(a => a.timestamp === alert.timestamp && a.deviceId === alert.deviceId)
                );
                return [...newAlerts, ...prev];
            });
        }
    }, [sensorsAlert]);


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
                                    <td>{moment(notif?.timestamp).format("jYYYY/jMM/jDD HH:mm:ss")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
