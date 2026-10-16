import React from 'react';
import { Link } from 'react-router-dom';

const Pending = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-4xl shadow-2xl shadow-amber-500/30 mb-6">
          ⏳
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">Registration Pending</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Your account is waiting for Super Admin approval. You'll be able to log in once it's approved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
};

export default Pending;