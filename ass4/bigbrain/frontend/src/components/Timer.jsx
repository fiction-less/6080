import React from 'react';
import { useTimer } from 'react-timer-hook';

export function Timer ({ expiryTimestamp, expired }) {
  const {
    seconds,
  } = useTimer({ expiryTimestamp, onExpire: () => expired() });

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>Time remaining:</h3>
      <div style={{ fontSize: '30px' }}>
        <span>{seconds}</span>
      </div>
    </div>
  );
}
