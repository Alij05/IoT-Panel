import React, { useEffect, useState } from "react";
import "./WeatherWidget.css";


const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const CITY = "Tehran";

export default function WeatherWidget() {
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&units=metric&lang=fa`
        );
        const data = await res.json();

        // فقط 5 روز اول رو میگیریم (یکی از هر روز)
        const daily = data.list.filter((item) =>
          item.dt_txt.includes("12:00:00")
        );
        setForecast(daily.slice(0, 4));
      } catch (err) {
        console.error("خطا در گرفتن دیتای آب و هوا:", err);
      }
    };

    fetchWeather();
  }, []);


  return (
    <div className="weather-widget">
      {forecast.map((item, index) => (
        <div className="weather-card" key={index}>
          <div className="day">
            {new Date(item.dt_txt).toLocaleDateString("fa-IR", {
              weekday: "long",
            })}
          </div>
          <div className="icon">
            <img
              src={`https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`}
              alt={item.weather[0].description}
            />
          </div>
          <div className="temp">
            <span className="max">{Math.round(item.main.temp_max)}°</span>
            <span className="min">{Math.round(item.main.temp_min)}°</span>
          </div>
        </div>
      ))}
    </div>
  );
}
