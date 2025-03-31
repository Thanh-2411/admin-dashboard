import React from 'react';

const Notification = ({ messages }) => {
  return (
    <div className="mt-6">
      <h3>Thông báo</h3>
      <ul className="space-y-2">
        {messages.map((msg, index) => (
          <li key={index} className="notification-item">
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notification;