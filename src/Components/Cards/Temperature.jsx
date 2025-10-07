import React, { useEffect, useState } from 'react';
import './Temperature.css';

const url = process.env.REACT_APP_URL

export default function Temperature({ deviceState, product, min = 0, max = 50 }) {
  console.log('deviceState', deviceState);

  const [mercuryHeight, setMercuryHeight] = useState(0);
  const [mercuryColor, setMercuryColor] = useState('#26c6da');

  const [temperature, setTemperature] = useState(0);

  const deviceType = product.deviceType || 'sensor';
  const deviceId = product.entity_id;

  useEffect(() => {
    async function deviceInitState() {
      try {
        const res = await fetch(`${url}/mqtt/api/status/${deviceType}/${deviceId}`);
        const data = await res.json();
        if (!res.ok) return;

        if (data?.state && typeof data.state === "string" && data.state.includes("/")) {
          const [t, h] = data.state.split("/");
          setTemperature(t);
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
      setTemperature(Number(t));
    }
  }, [deviceState]);

  useEffect(() => {
    const percent = ((temperature - min) / (max - min)) * 100;
    setMercuryHeight(Math.min(100, Math.max(0, percent)));

    let color;
    if (temperature < 25) color = '#26c6da';
    else if (temperature < 30) color = '#00bcd4';
    else color = '#f44336';

    setMercuryColor(color);
  }, [temperature, min, max]);

  return (
    <div className="thermometer-container">
      <h2 className="temperature-title">{temperature}°C</h2>
      <div className="thermometer-wrapper" style={{ color: mercuryColor }}>
        <div className="thermometer">
          <div
            className="thermometer-mercury"
            style={{ height: `${mercuryHeight}%`, backgroundColor: mercuryColor }}
          />
        </div>
        <div className="thermometer-ball" />
      </div>
    </div>
  );
}
