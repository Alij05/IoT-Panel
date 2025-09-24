import React from 'react'
import ReactDOM from 'react-dom';
import './DeleteModal.css'

export default function DeleteModal({ closeModal, submitModal, msg='آیا از حذف اطمینان دارید؟' }) {

    return ReactDOM.createPortal(
        <div className='modal-parent active'> {/* Add 'active' Class to Show Modal */}
            <div className='delete-modal'>
                <h1>{msg}</h1>
                <div className='delete-modal-btns'>
                    <button className='delete-btn delete-modal-accept-btn' onClick={(event) => submitModal(event)}>بله</button>
                    <button className='delete-btn delete-modal-reject-btn' onClick={() => closeModal()}>خیر</button>
                </div>
            </div>
        </div>
        , document.getElementById('modals-parent')
    )
}
