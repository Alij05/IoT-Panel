import React from 'react'
import './SwitchCard.css'

export default function SwitchCard({ id = '1', label = "Switch's Device", owner, deviceName, deviceLocation }) {
  const inputId = `neo-toggle-${id}`

  return (
    <>
      <div className='switch-container home-box'>
        <div style={{ display: "flex", gap: "15px 20px", fontSize: "18px", color: "black", flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
          {/* <span>دستگاه: {deviceName}</span> */}
          <span>مکان : {deviceLocation}</span>
          |
          <span>مالک : {owner}</span>
        </div>        <p className='switch-header'>{label}</p>
        <div className="neo-toggle-container">
          <input className="neo-toggle-input" id={inputId} type="checkbox" />
          <label className="neo-toggle" htmlFor={inputId}>
            <div className="neo-track">
              <div className="neo-background-layer"></div>
              <div className="neo-grid-layer"></div>
              <div className="neo-spectrum-analyzer">
                <div className="neo-spectrum-bar"></div>
                <div className="neo-spectrum-bar"></div>
                <div className="neo-spectrum-bar"></div>
                <div className="neo-spectrum-bar"></div>
                <div className="neo-spectrum-bar"></div>
              </div>
              <div className="neo-track-highlight"></div>
            </div>

            <div className="neo-thumb">
              <div className="neo-thumb-ring"></div>
              <div className="neo-thumb-core">
                <div className="neo-thumb-icon">
                  <div className="neo-thumb-wave"></div>
                  <div className="neo-thumb-pulse"></div>
                </div>
              </div>
            </div>

            <div className="neo-gesture-area"></div>

            <div className="neo-interaction-feedback">
              <div className="neo-ripple"></div>
              <div className="neo-progress-arc"></div>
            </div>

            <div className="neo-status">
              <div className="neo-status-indicator">
                <div className="neo-status-dot"></div>
                <div className="neo-status-text"></div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </>
  )
}
