'use client';

import React from 'react';
import { SignUp } from '@clerk/nextjs';

export const RegisterPage = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-32 min-h-[85vh] flex flex-col justify-center font-sans text-slate-800">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-xl space-y-6 flex flex-col items-center">
        {/* Header */}
        <div className="text-center space-y-2 mb-2 w-full">
          <span className="text-primary font-bold text-xs uppercase tracking-widest block">Join the Family</span>
          <h2 className="font-display text-2xl font-extrabold text-slate-850">Create Account</h2>
          <p className="text-[11px] text-slate-455 font-semibold leading-relaxed">
            Register to start tracking orders, save address slots, and receive deals.
          </p>
        </div>

        <SignUp
          routing="hash"
          signInUrl="/login"
          forceRedirectUrl="/profile"
        />
      </div>
    </div>
  );
};

export default RegisterPage;
