import React from 'react';
import GaugeChart from 'react-gauge-chart';
import './AirQualityCard.css';

const AirQualityCard = ({ product, deviceState, deviceInfo }) => {
    const maxAqi = 500;

    // مقدار AQI را از deviceState یا deviceInfo بگیر
    // فرض می‌کنیم deviceState عدد کیفیت هواست
    const value = Number(deviceState);
    const percent = !isNaN(value) ? value / maxAqi : 0;

    const owner = product?.owner || '-';
    const deviceName = product?.deviceName || '-';
    const deviceLocation = product?.deviceLocation || '-';

    return (
        <div className="home-box aqi-card">
            <div style={{
                display: "flex",
                gap: "15px 20px",
                fontSize: "18px",
                color: "black",
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <span>دستگاه: {deviceName}</span>
                |
                <span>مکان: {deviceLocation}</span>
                |
                <span>مالک: {owner}</span>
            </div>

            <GaugeChart
                id={`aqi-gauge-${product?.entity_id}`}
                nrOfLevels={50}
                arcsLength={[0.1, 0.1, 0.1, 0.2, 0.2, 0.3]}
                colors={["#00e400", "#ffff00", "#ff7e00", "#ff0000", "#8f3f97", "#7e0023"]}
                percent={percent}
                arcWidth={0.3}
                needleColor="#ffffff"
                textColor="#ffffff"
                needleBaseColor="#ffffff"
                hideText={true}
            />

            <div className="aqi-value">AQ • {!isNaN(value) ? value : 0}</div>
            <div className="aqi-label">کیفیت هوا</div>
        </div>
    );
};

export default AirQualityCard;
