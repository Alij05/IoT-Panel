import React, { useEffect } from "react";
import "./DetailsModal.css";

export default function DetailsModal({ children, closeModal }) {


  return (
    <div className='modal-parent active'>
      <div className="details-modal">
        <div className="close-btn-wrapper">
          <span className="close-btn" onClick={closeModal}>X</span>
        </div>
        {children}
      </div>
    </div>
  );
}
