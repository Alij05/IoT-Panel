import React from 'react';
import GaugeChart from 'react-gauge-chart';
import './AirQualityCard.css';
import { useState } from 'react';
import DeviceMoreInfo from '../DeviceMoreInfo/DeviceMoreInfo';

const AirQualityCard = ({ product, isUserAdmin, deviceState, deviceInfo, deviceStatus }) => {
    const [isShowMoreInfo, setIsShowMoreInfo] = useState(false);

    const maxAqi = 500;

    const safeValue = Number(deviceState);
    const percent = !isNaN(safeValue) ? safeValue / maxAqi : 0;

    return (

        <>
            <div className="home-box aqi-card">
                <div
                    className="more-info"
                    onClick={() => setIsShowMoreInfo(true)}
                >
                    ...
                </div>

                <div
                    className={`status-dot ${deviceStatus?.includes("Sensor status publish OK") ||
                        deviceStatus?.includes("Heartbeat - device online")
                        ? "online"
                        : "offline"
                        }`}
                />

                {isUserAdmin ? (
                    <div className="card-header">
                        <span>مکان : {product.deviceLocationName}</span>
                        |
                        <span>مالک : {product.user}</span>
                    </div>
                ) : (
                    <div className="card-header">
                        <span>
                            {product.deviceName} در {product.deviceLocationName}
                        </span>
                    </div>
                )}

                <GaugeChart
                    id={`aqi-gauge-${product?.entity_id}`}
                    nrOfLevels={50}
                    arcsLength={[0.1, 0.1, 0.1, 0.2, 0.2, 0.3]}
                    colors={[
                        "#00e400",
                        "#ffff00",
                        "#ff7e00",
                        "#ff0000",
                        "#8f3f97",
                        "#7e0023",
                    ]}
                    percent={percent}
                    arcWidth={0.2}
                    hideText
                />

                <div className="aqi-value">AQ • {!isNaN(safeValue) ? safeValue : 0}</div>
                <div className="aqi-label">کیفیت هوا</div>
            </div>

            {isShowMoreInfo && (
                <div className="overlay" onClick={() => setIsShowMoreInfo(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h4>جزئیات سنسور</h4>
                        <table className="info-table">
                            <tbody>
                                <DeviceMoreInfo
                                    deviceInfo={deviceInfo}
                                    product={product}
                                />
                            </tbody>
                        </table>
                        <button
                            className="close-btn"
                            onClick={() => setIsShowMoreInfo(false)}
                        >
                            بستن
                        </button>
                    </div>
                </div>
            )}
        </>
    )
};

export default AirQualityCard;
