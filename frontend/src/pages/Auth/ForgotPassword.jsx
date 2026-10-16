import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/apiClient';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setStep(2);
      startResendTimer();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.verifyOtp(email, otp);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.resetPassword(email, otp, newPassword);
      alert('✅ Password reset successfully! Please sign in.');
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    setError('');
    try {
      await api.forgotPassword(email);
      startResendTimer();
      alert('✅ New code sent!');
    } catch (err) {
      setError(err.message);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl mb-4 shadow-2xl shadow-blue-500/30">
            🔐
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-slate-400 text-sm mt-1">
            {step === 1 && 'Enter your registered email to receive a code'}
            {step === 2 && `Code sent to ${email}`}
            {step === 3 && 'Create your new password'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                s <= step ? 'bg-blue-500 w-12' : 'bg-slate-700 w-8'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
              ❌ {error}
            </div>
          )}

          {/* STEP 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-registered-email@gmail.com"
                  className={inputClass}
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Enter the email you registered with — the code will be sent only to this email.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
              >
                {loading ? '⏳ Sending...' : '📧 Send Reset Code'}
              </button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className={
                    inputClass +
                    ' text-center text-2xl tracking-[12px] font-mono font-bold'
                  }
                />
                <p className="text-xs text-slate-500 mt-2 text-center">
                  Check your email inbox (and spam folder)
                </p>
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
              >
                {loading ? '⏳ Verifying...' : '✓ Verify Code'}
              </button>

              <div className="text-center text-sm">
                {resendTimer > 0 ? (
                  <span className="text-slate-500">
                    Resend code in <b className="text-slate-300">{resendTimer}s</b>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    🔄 Resend Code
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition"
              >
                ← Change email
              </button>
            </form>
          )}

          {/* STEP 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
              >
                {loading ? '⏳ Saving...' : '✓ Reset Password'}
              </button>
            </form>
          )}

          {/* Back to login */}
          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <Link
              to="/"
              className="text-sm text-slate-400 hover:text-slate-200 transition"
            >
              ← Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;