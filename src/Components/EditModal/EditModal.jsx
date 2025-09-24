import React, { useEffect, useState } from "react";
import ReactDOM from 'react-dom';
import "./EditModal.css";


export default function EditModal({ children, submitModal, closeModal }) {

  return ReactDOM.createPortal(
    <div className="modal-parent active">
      <form className="edit-modal-form">
        <div className="close-btn-wrapper">
          <span className="close-btn" onClick={closeModal}>X</span>
        </div>
        <h1>اطلاعات جدید را وارد نمایید</h1>

        {children}
        <button className="edit-form-submit" onClick={(event) => submitModal(event)}>ثبت اطلاعات جدید</button>
      </form>
    </div>
    , document.getElementById('modals-parent')
  );
}
