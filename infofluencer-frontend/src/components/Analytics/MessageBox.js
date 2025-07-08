import React from "react";

const MessageBox = ({ message, messageType }) => {
  if (!message) return null;
  return (
    <div
      className={`mb-6 p-4 rounded-md ${
        messageType === "success"
          ? "bg-green-50 border border-green-200 text-green-700"
          : "bg-red-50 border border-red-200 text-red-700"
      }`}
    >
      {message}
    </div>
  );
};

export default MessageBox;
