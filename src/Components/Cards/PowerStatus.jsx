import React, { useEffect, useState } from 'react';
import './PowerStatus.css';

export default function PowerStatus({ deviceState, product, min = 0, max = 240 }) {
    const [voltage, setVoltage] = useState(0);
    const [barHeight, setBarHeight] = useState(0);
    const [barColor, setBarColor] = useState('#26c6da');

    const deviceType = product.deviceType || 'sensor';
    const deviceId = product.entity_id;
    const url = process.env.REACT_APP_URL;

    // دریافت وضعیت اولیه دستگاه
    useEffect(() => {
        async function deviceInitState() {
            try {
                const res = await fetch(`${url}/mqtt/api/status/${deviceType}/${deviceId}`);
                const data = await res.json();
                if (!res.ok) return;

                if (data?.state && !isNaN(Number(data.state))) {
                    setVoltage(Number(data.state));
                }
            } catch (error) {
                console.error("❌ Error fetching initial voltage:", error.message);
            }
        }

        deviceInitState();
    }, [deviceId, deviceType, url]);

    // بروزرسانی با props جدید
    useEffect(() => {
        if (deviceState && !isNaN(Number(deviceState))) {
            setVoltage(Number(deviceState));
        }
    }, [deviceState]);

    // محاسبه ارتفاع و رنگ نوار ولتاژ
    useEffect(() => {
        const percent = ((voltage - min) / (max - min)) * 100;
        setBarHeight(Math.min(100, Math.max(0, percent)));

        let color;
        if (voltage < 120) color = '#26c6da'; // پایین
        else if (voltage < 200) color = '#00bcd4'; // نرمال
        else color = '#f44336'; // ولتاژ بالا / خطر

        setBarColor(color);
    }, [voltage, min, max]);

    return (
        <div className="voltage-container">
            <h2 className="voltage-title">{voltage} V</h2>
            <div className="voltage-wrapper" style={{ color: barColor }}>
                <div className="voltage-bar">
                    <div
                        className="voltage-fill"
                        style={{ height: `${barHeight}%`, backgroundColor: barColor }}
                    />
                </div>
            </div>
        </div>
    );
}
