import React, { useEffect, useState } from 'react';
import { Thermometer, Droplets } from 'lucide-react';
import './TempCard.css';
import { toJalaliDateString } from '../DeviceReport/DateUtils';

const url = process.env.REACT_APP_URL

function TempCard({ product, isUserAdmin, deviceState, deviceInfo }) {
    const [temperature, setTemperature] = useState("Loading");
    const [humidity, setHumidity] = useState("Loading");
    const [isShowMoreInfo, setIsShowMoreInfo] = useState(false);

    console.log('deviceInfo -->', deviceInfo);
    console.log('PRODUCT -->', product);


    async function fetchInitialStatus() {
        try {
            const deviceType = product.deviceType || 'sensor';
            const deviceId =  product.entity_id;

            const response = await fetch(`${url}/mqtt/api/status/${deviceType}/${deviceId}`);
            if (!response.ok) return;

            const data = await response.json();
            if (data?.state && typeof data.state === "string" && data.state.includes("/")) {
                const [t, h] = data.state.split("/");
                setTemperature(t);
                setHumidity(h);
            }
        } catch (error) {
            console.error("❌ Error fetching initial status:", error.message);
        }
    }

    useEffect(() => {
        fetchInitialStatus();
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
                                <tr><td>شناسه دیوایس :</td><td>{deviceInfo?.deviceId || deviceInfo?.device_Id}</td></tr>
                                <tr><td>نوع دیوایس :</td><td>{deviceInfo?.deviceType || 'سنسور'}</td></tr>
                                <tr><td>کلاس دیوایس :</td><td>{product?.device_class || product?.deviceClass}</td></tr>
                                <tr><td>نام دیوایس :</td><td>{product?.deviceName}</td></tr>
                                <tr><td>مکان :</td><td>{product?.deviceLocationName}</td></tr>
                                <tr><td>مالک :</td><td>{product?.user}</td></tr>
                                <tr><td>دما :</td><td>{temperature} سانتی‌گراد</td></tr>
                                <tr><td>رطوبت :</td><td>{humidity} درصد</td></tr>
                                <tr><td>باتری :</td><td>{deviceInfo?.battery_percent}%</td></tr>
                                <tr><td>در حال شارژ :</td><td>{deviceInfo?.battery_charging ? 'بلی' : 'خیر'}</td></tr>
                                <tr><td>ولتاژ باتری :</td><td>{(deviceInfo?.battery_v)?.toFixed(2)} ولت</td></tr>
                                <tr><td>قدرت سیگنال wifi :</td><td>{deviceInfo?.rssi}</td></tr>
                                <tr><td>نام شبکه (SSID) :</td><td>{deviceInfo?.ssid}</td></tr>
                                <tr><td>IP :</td><td>{deviceInfo?.ip}</td></tr>
                                <tr><td>فضای آزاد SD Card:</td><td>{deviceInfo?.heap_free} مگابایت</td></tr>
                                <tr><td>مدت زمان فعالیت :</td><td>{(deviceInfo?.uptime_ms / 60)?.toFixed(0)} دقیقه</td></tr>
                                <tr><td>تاریخ و زمان :</td><td>{toJalaliDateString(deviceInfo?.time)}</td></tr>
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
        prevProps.product.entity_id === nextProps.product.entity_id
    );
});
