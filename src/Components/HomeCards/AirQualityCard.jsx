import React from 'react';
import GaugeChart from 'react-gauge-chart';
import './AirQualityCard.css';

const AirQualityCard = ({ value, owner, deviceName, deviceLocation }) => {
    const maxAqi = 500;
    const percent = value / maxAqi;

    return (
        <>
            <div className="aqi-card home-box">
                <div style={{ display: "flex", gap: "15px 20px", fontSize: "18px", color: "black", flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
                    {/* <span>دستگاه: {deviceName}</span> */}
                    <span>مکان : {deviceLocation}</span>
                    |
                    <span>مالک : {owner}</span>
                </div>                <GaugeChart
                    id="aqi-gauge"
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
                <div className="aqi-value">AQ • {value}</div>
                <div className="aqi-label">کیفیت هوا</div>
            </div>
        </>
    );
};

export default AirQualityCard;
