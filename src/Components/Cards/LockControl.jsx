import React, { useState } from 'react';

export default function LockControl({ isLock }) {
    const [isLockOn, setIsLock] = useState(isLock);

    return (
        <div style={{ textAlign: 'center', cursor: 'pointer' }} >
            <p>{isLockOn ? 'قفل' : 'باز'}</p>
            <img
                src={isLockOn === 'on' ? 'svgs/lock-open.svg' : 'svgs/lock-close.svg'}
                alt={isLockOn === 'on' ? 'قفل' : 'باز'}
                style={{ width: '200px', transition: '0.3s ease-in-out', marginTop:'15px' }}
            />
        </div>
    );
}
