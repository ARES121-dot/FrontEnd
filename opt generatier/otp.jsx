import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Otp() {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleVerify = () => {
    if (otp === "1234") {
      alert("OTP Verified Successfully!");
      navigate("/home");
    } else {
      alert("Invalid OTP! Please try again.");
    }
  };

  return (
    <div className="container">
      <h1>OTP Verification</h1>

      <p>Enter your 4-digit OTP</p>

      <input
        type="text"
        maxLength="4"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />

      <button onClick={handleVerify}>
        Verify OTP
      </button>
    </div>
  );
}

export default Otp;