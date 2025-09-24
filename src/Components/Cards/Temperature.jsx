import React, { useEffect, useState } from 'react';
import './Temperature.css';

export default function Temperature({ temperature, min = 0, max = 50 }) {
  const [mercuryHeight, setMercuryHeight] = useState(0);
  const [mercuryColor, setMercuryColor] = useState('#26c6da');

  useEffect(() => {
    const percent = ((temperature - min) / (max - min)) * 100;
    setMercuryHeight(Math.min(100, Math.max(0, percent)));

    let color;
    if (temperature < 20) color = '#26c6da';
    else if (temperature < 25) color = '#00bcd4';
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
