"use client";
import React, { useState, useEffect } from "react";

/**
 * ForgatePass Component - Only open when `open` prop is true
 * - Email > receive OTP > verify OTP > set new password
 * - Calls relevant endpoints, minimal styling.
 */
export default function ForgatePass({ open, onClose }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  const [form, setForm] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Reset when modal becomes open after closed
  useEffect(() => {
    if (open) {
      setStep(1);
      setForm({ email: "", otp: "", newPassword: "", confirmPassword: "" });
      setMessage("");
      setError("");
      setIsLoading(false);
      setResendTimer(0);
    }
  }, [open]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (e) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
    setError("");
    setMessage("");
  };

  const handleSendOtp = async (e) => {
    e && e.preventDefault();
    setError("");
    setMessage("");
    if (!form.email) {
      setError("Please enter your email.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("OTP has been sent to your email.");
        setStep(2);
        setResendTimer(60);
      } else {
        setError(data?.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("Failed to send OTP. Please try again.");
    }
    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    setError("");
    setMessage("");
    if (!form.email) {
      setError("Please enter your email.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("OTP resent to your email.");
        setResendTimer(60);
      } else {
        setError(data?.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setError("Failed to resend OTP.");
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e && e.preventDefault();
    setError("");
    setMessage("");
    if (!form.otp) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp: form.otp }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("OTP verified! Set your new password.");
        setStep(3);
      } else {
        setError(data?.message || "Invalid OTP.");
      }
    } catch (err) {
      setError("Failed to verify OTP, please try again.");
    }
    setIsLoading(false);
  };

  const handleResetPassword = async (e) => {
    e && e.preventDefault();
    setError("");
    setMessage("");
    if (!form.newPassword || !form.confirmPassword) {
      setError("Enter and confirm your new password.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          otp: form.otp,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Password reset! You may now log in.");
        setStep(4);
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        setError(data?.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    }
    setIsLoading(false);
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed z-40 inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md px-6 py-8 relative">
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-black text-2xl font-bold"
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold text-center mb-4">Forgot Password</h2>

        {message && (
          <div className="bg-green-100 text-green-700 px-3 py-2 rounded mb-2 text-center">{message}</div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-2 text-center">{error}</div>
        )}

        {step === 1 && (
          <form className="flex flex-col gap-5" onSubmit={handleSendOtp}>
            <label className="font-medium">Email address</label>
            <input
              autoFocus
              className="border rounded-lg px-4 py-2 text-base"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold py-2 transition flex items-center justify-center"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-blue-100 border-t-blue-700 rounded-full animate-spin inline-block mr-2"></span>
              ) : null}
              Send OTP
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="flex flex-col gap-5" onSubmit={handleVerifyOtp}>
            <label className="font-medium">Enter OTP sent to email</label>
            <input
              autoFocus
              className="border rounded-lg px-4 py-2 text-base tracking-wider"
              type="text"
              name="otp"
              value={form.otp}
              onChange={handleChange}
              placeholder="6-digit OTP"
              maxLength={6}
              required
            />
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold py-2 transition flex items-center justify-center"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-blue-100 border-t-blue-700 rounded-full animate-spin inline-block mr-2"></span>
              ) : null}
              Verify OTP
            </button>
            <div className="text-center text-sm mt-2 text-gray-500">
              {resendTimer > 0 ? (
                <span>Resend OTP in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-blue-600 hover:underline"
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        )}

        {step === 3 && (
          <form className="flex flex-col gap-5" onSubmit={handleResetPassword}>
            <label className="font-medium">Set new password</label>
            <input
              className="border rounded-lg px-4 py-2 text-base"
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="New password (min 8 chars)"
              minLength={8}
              required
            />
            <input
              className="border rounded-lg px-4 py-2 text-base"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              minLength={8}
              required
            />
            <button
              className="w-full bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold py-2 transition flex items-center justify-center"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-green-100 border-t-green-700 rounded-full animate-spin inline-block mr-2"></span>
              ) : null}
              Reset Password
            </button>
          </form>
        )}

        {step === 4 && (
          <div className="py-10 text-center">
            <div className="text-3xl mb-2 text-green-600">✔</div>
            <div className="text-lg font-semibold">Password successfully reset!</div>
            <div className="text-gray-700 mt-2">You may now log in with your new password.</div>
            <button
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 transition"
              onClick={handleClose}
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
