// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';

// const Register = () => {
//   const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Intern' });
//   const navigate = useNavigate();

//    const handleSubmit = async (e) => {
//   e.preventDefault();
//   try {
//     const res = await fetch('http://localhost:5000/api/auth/register', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         name: form.name,
//         email: form.email,
//         password: form.password,
//         role: form.role.toUpperCase(),
//       }),
//     });
//     const data = await res.json();
//     if (!res.ok) return alert(data.error);
//     alert('✅ ' + data.message);
//     navigate('/');
//   } catch {
//     alert('Server error');
//   }
// };
//   return (
//     <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
//       <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl">
//         <h2 className="text-2xl font-bold text-slate-100 mb-2">Create Account</h2>
//         <p className="text-slate-400 text-sm mb-6">Your request will be reviewed by the Super Admin.</p>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <input
//             type="text"
//             placeholder="Full name"
//             required
//             onChange={(e) => setForm({ ...form, name: e.target.value })}
//             className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
//           />
//           <input
//             type="email"
//             placeholder="Email"
//             required
//             onChange={(e) => setForm({ ...form, email: e.target.value })}
//             className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             required
//             onChange={(e) => setForm({ ...form, password: e.target.value })}
//             className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none"
//           />
//           <select
//             onChange={(e) => setForm({ ...form, role: e.target.value })}
//             className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
//           >
//             <option>Intern</option>
//             <option>Manager</option>
//             <option>Admin</option>
//             <option>Viewer</option>
//           </select>
//           <button
//             type="submit"
//             className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition"
//           >
//             Register
//           </button>
//         </form>
//         <p className="mt-6 text-center text-sm text-slate-500">
//           Already have an account? <Link to="/" className="text-blue-400">Sign in</Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=form, 2=otp, 3=success
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Intern' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const startTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.register(form);
      setStep(2);
      startTimer();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.verifyEmail(form.email, otp);
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (resendTimer > 0) return;
    try {
      await api.resendVerifyOtp(form.email);
      startTimer();
      alert('✅ New code sent!');
    } catch (err) {
      setError(err.message);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl mb-4 shadow-2xl shadow-blue-500/30">
            {step === 1 ? '📝' : step === 2 ? '📧' : '✅'}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {step === 1 && 'Create Account'}
            {step === 2 && 'Verify Your Email'}
            {step === 3 && 'All Set!'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {step === 1 && 'Sign up to get started'}
            {step === 2 && `Code sent to ${form.email}`}
            {step === 3 && 'Pending Super Admin approval'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${s <= step ? 'bg-blue-500 w-12' : 'bg-slate-700 w-8'}`} />
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          {error && (
            <div className="mb-5 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
              ❌ {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                <input type="email" required value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@gmail.com" className={inputClass} />
                <p className="text-[11px] text-slate-500 mt-1.5">⚠️ A verification code will be sent to this email</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <input type="password" required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimum 6 characters" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requested Role</label>
                <select value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className={inputClass + ' cursor-pointer'}>
                  <option>Intern</option>
                  <option>Manager</option>
                  <option>Admin</option>
                  <option>Viewer</option>
                </select>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50">
                {loading ? '⏳ Sending code...' : '📧 Send Verification Code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Enter 6-Digit Code</label>
                <input type="text" required maxLength="6" value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className={inputClass + ' text-center text-2xl tracking-[12px] font-mono font-bold'} />
                <p className="text-xs text-slate-500 mt-2 text-center">Check your inbox (and spam folder)</p>
              </div>
              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition disabled:opacity-50">
                {loading ? '⏳ Verifying...' : '✓ Verify Email'}
              </button>
              <div className="text-center text-sm">
                {resendTimer > 0 ? (
                  <span className="text-slate-500">Resend in <b className="text-slate-300">{resendTimer}s</b></span>
                ) : (
                  <button type="button" onClick={resend} className="text-blue-400 hover:text-blue-300 font-semibold">
                    🔄 Resend Code
                  </button>
                )}
              </div>
              <button type="button" onClick={() => setStep(1)}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition">
                ← Change details
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-4xl">
                ✅
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">Email Verified!</h3>
                <p className="text-sm text-slate-400">
                  Your account is pending Super Admin approval. You'll be able to log in once approved.
                </p>
              </div>
              <Link to="/" className="inline-block w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition">
                ← Back to Sign In
              </Link>
            </div>
          )}

          {step === 1 && (
            <div className="mt-6 pt-6 border-t border-slate-800 text-center text-sm">
              <span className="text-slate-400">Already have an account? </span>
              <Link to="/" className="text-blue-400 hover:text-blue-300 font-semibold">Sign in</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;