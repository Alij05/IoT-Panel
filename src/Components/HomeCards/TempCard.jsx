import React, { useEffect, useState } from 'react';
import { Thermometer, Droplets } from 'lucide-react';
import './TempCard.css';
import { toJalaliDateString } from '../DeviceReport/DateUtils';
import DeviceMoreInfo from '../DeviceMoreInfo/DeviceMoreInfo';

const url = process.env.REACT_APP_URL

function TempCard({ product, isUserAdmin, deviceState, deviceInfo, deviceStatus }) {
    console.log("deviceState ==>", deviceState);

    const [temperature, setTemperature] = useState("Loading");
    const [humidity, setHumidity] = useState("Loading");
    const [isShowMoreInfo, setIsShowMoreInfo] = useState(false);

    const deviceType = product.deviceType || 'sensor';
    const deviceId = product.entity_id;


    useEffect(() => {
        async function deviceInitState() {
            try {
                const res = await fetch(`${url}/mqtt/api/status/${deviceType}/${deviceId}`);
                console.log('res Temp Card ==>', res);

                const data = await res.json();
                if (!res.ok) return;

                if (data?.state && typeof data.state === "string" && data.state.includes("/")) {
                    const [t, h] = data.state.split("/");
                    setTemperature(t);
                    setHumidity(h);
                }
            } catch (error) {
                console.error("❌ Error fetching initial status:", error.message);
            }
        }

        deviceInitState()
    }, []);

    useEffect(() => {
        if (typeof deviceState === "string" && deviceState.includes("/")) {
            const [t, h] = deviceState.split("/");
            setTemperature(t);
            setHumidity(h);
        }
    }, [deviceState]);

    return (
        <>
            <div className="sensor-wrapper home-box temp-wrapper">
                {isUserAdmin ? (
                    <div style={{ display: "flex", gap: "10px 12px", fontSize: "16px", color: "var(--text-color)", flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                        <span>مکان : {product.deviceLocationName}</span> |
                        <span>مالک : {product.user}</span>
                    </div>
                ) : (
                    <div style={{ display: "flex", gap: "10px 12px", fontSize: "16px", color: "var(--text-color)", flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                        <span>{product.deviceName} در {product.deviceLocationName}</span>
                    </div>
                )}

                <div className='more-info' onClick={() => setIsShowMoreInfo(true)}>
                    ...
                </div>

                <div
                    className={`status-dot ${deviceStatus?.includes('Sensor status publish OK') || deviceStatus?.includes('Heartbeat - device online')
                        ? 'online'
                        : 'offline'
                        }`}
                ></div>


                <div className='sensor-cards-wrapper'>
                    <div className="sensor-card temperature-card">
                        <Thermometer size={40} />
                        <div className="sensor-info">
                            <h3>Temperature</h3>
                            <p>{temperature}°C</p>
                        </div>
                    </div>
                    <div className="sensor-card humidity-card">
                        <Droplets size={40} />
                        <div className="sensor-info">
                            <h3>Humidity</h3>
                            <p>% {humidity}</p>
                        </div>
                    </div>
                </div>
            </div>

            {isShowMoreInfo && (
                <div className="overlay" onClick={() => setIsShowMoreInfo(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h4>جزئیات سنسور</h4>
                        <table className="info-table">
                            <tbody>
                                <tr><td>دما :</td><td>{temperature} سانتی‌گراد</td></tr>
                                <tr><td>رطوبت :</td><td>{humidity} درصد</td></tr>
                                <DeviceMoreInfo deviceInfo={deviceInfo} product={product} />
                            </tbody>
                        </table>
                        <button className="close-btn" onClick={() => setIsShowMoreInfo(false)}>بستن</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default React.memo(TempCard, (prevProps, nextProps) => {
    return (
        prevProps.deviceState === nextProps.deviceState &&
        prevProps.isUserAdmin === nextProps.isUserAdmin &&
        prevProps.product.entity_id === nextProps.product.entity_id &&
        prevProps.deviceStatus == nextProps.deviceStatus
    );
});
