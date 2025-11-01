import React, { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import './VoltageCard.css';
import DeviceMoreInfo from '../DeviceMoreInfo/DeviceMoreInfo';

const url = process.env.REACT_APP_IOT;

function VoltageCard({ product, isUserAdmin, deviceState, deviceInfo, deviceStatus }) {
    const [voltage, setVoltage] = useState('');
    const [isShowMoreInfo, setIsShowMoreInfo] = useState(false);

    const deviceType = product.deviceType || 'sensor';
    const deviceId = product.entity_id;

    useEffect(() => {
        async function fetchVoltage() {
            try {
                const res = await fetch(`${url}/api/status/${deviceType}/${deviceId}`);
                const data = await res.json();
                if (data?.state) {
                    const voltageValue = parseFloat(data.state);
                    if (!isNaN(voltageValue)) setVoltage(voltageValue.toFixed(2));
                }
            } catch (err) {
                console.error('Error fetching voltage:', err);
            }
        }

        if (!deviceState) fetchVoltage();
    }, [deviceType, deviceId]);

    useEffect(() => {
        setVoltage(parseFloat(deviceState).toFixed(2));
    }, [deviceState]);

    return (
        <>
            <div className="home-box">
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

                <div className="voltage-card-inner">
                    <div className="voltage-icon">
                        <Zap size={48} />
                    </div>
                    <div className="voltage-info">
                        <h3>Voltage</h3>
                        <p>{voltage ? `${voltage} V` : 'Loading...'}</p>
                    </div>
                </div>
            </div>

            {isShowMoreInfo && (
                <div className="voltage-overlay" onClick={() => setIsShowMoreInfo(false)}>
                    <div className="voltage-modal" onClick={(e) => e.stopPropagation()}>
                        <h4>جزئیات ولتاژ</h4>
                        <table className="voltage-info-table">
                            <tbody>
                                <tr><td>ولتاژ فعلی :</td><td>{voltage} ولت</td></tr>
                                <DeviceMoreInfo deviceInfo={deviceInfo} product={product} />
                            </tbody>
                        </table>
                        <button className="voltage-close-btn" onClick={() => setIsShowMoreInfo(false)}>بستن</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default VoltageCard;
