import React from 'react';
import '../css/Modal.css';

const Modal = ({ isOpen, onClose, onAddToCalendar }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>RSVP Confirmation</h2>
                <p>You have RSVPed for this event. Would you like to add it to your Google Calendar?</p>
                <button
                    onClick={onAddToCalendar}
                    className="modal-button modal-button-primary"
                >
                    Yes
                </button>
                <button
                    onClick={onClose}
                    className="modal-button modal-button-secondary"
                >
                    No
                </button>
            </div>
        </div>
    );
};

export default Modal;
