import React, { useState } from "react";
import ReactDOM from "react-dom";
import "./CameraCard.css";

export default function CameraCard({ url }) {
  const [isOpen, setIsOpen] = useState(false);

  const showFullCamera = () => setIsOpen(true);
  const closeFullCamera = () => setIsOpen(false);

  return (
    <div className="switch-container home-box">
      <div className="camera-header">دوربین</div>
      <div className="video-container">
        <img className="full-page-icon" src="svgs/full-page.svg" alt="fullscreen" onClick={showFullCamera}
        />
        <img src={url} alt="camera" className="camera-img" />
      </div>

      {isOpen &&
        ReactDOM.createPortal(
          <div className="popup-overlay">
            <img src={url} alt="camera-full" className="popup-image" />
            <button className="close-camera-btn" onClick={closeFullCamera}>
              ×
            </button>
          </div>,
          document.body
        )}
    </div>
  );
}
