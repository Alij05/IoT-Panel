import React, { useEffect } from 'react';
import { Droplet, Droplets } from 'lucide-react'; 
import { getSocket } from '../../WebSocket/Socket';

export default function WaterMoistureStatus({ waterStatus }) {
    const isWet = waterStatus === 'Wet';


    const styles = {
        container: {
            padding: '1rem',
            borderRadius: '1rem',
            backgroundColor: isWet ? '#e0f7fa' : '#fff3e0',
            color: isWet ? '#26a69a' : '#e65100',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            width: '220px',
            margin: '1rem auto',
        },
        icon: {
            fontSize: '2rem',
            marginBottom: '0.5rem',
        },
        statusText: {
            fontWeight: 'bold',
            fontSize: '1.5rem',
            marginTop: '20px'
        },
        value: {
            marginTop: '15px',
            fontSize: '1.2rem',
            opacity: 0.8,
        },
    };

    return (
        <div style={styles.container}>
            {isWet ? (
                <Droplets size={36} color="#00796b" />
            ) : (
                <Droplet size={36} color="#e65100" />
            )}
            <div style={styles.statusText}>
                {isWet ? 'خیس' : 'خشک'}
            </div>
            {/* <div style={styles.value}>رطوبت  : {waterMoisture} % </div> */}
        </div>
    );
}
