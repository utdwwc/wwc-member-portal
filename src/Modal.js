import React from 'react';

const Modal = ({ isOpen, onClose, onAddToCalendar }) => {
    if (!isOpen) return null;

    return (
        <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
                <h2>RSVP Confirmation</h2>
                <p>You have RSVPed for this event. Would you like to add it to your Google Calendar?</p>
                <button onClick={onAddToCalendar} style={styles.button}>Yes</button>
                <button onClick={onClose} style={styles.button}>No</button>
            </div>
        </div>
    );
};

// Modal styles
const styles = {
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        background: 'white',
        padding: '20px',
        borderRadius: '5px',
        textAlign: 'center',
    },
    button: {
        margin: '10px',
        padding: '10px 20px',
        cursor: 'pointer',
    },
};

export default Modal;
