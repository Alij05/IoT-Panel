import React from "react";
import "./CameraCard.css";

export default function CameraCard({ url }) {
  return (
    // <div className="switch-container home-box">
    //   <div className="camera-header">دوربین</div>

    //   {/* قاب iframe */}
    //   <div className="video-container">
    //     <iframe
    //       src={url}
    //       title="Live Stream"
    //       frameBorder="0"
    //       allow="autoplay; fullscreen"
    //     ></iframe>
    //   </div>
    // </div>

    <div className="switch-container home-box">
      <div className="camera-header">دوربین</div>
      <div className="video-container">
        <img src={url} alt="camera" />
      </div>
    </div>

  );
}
