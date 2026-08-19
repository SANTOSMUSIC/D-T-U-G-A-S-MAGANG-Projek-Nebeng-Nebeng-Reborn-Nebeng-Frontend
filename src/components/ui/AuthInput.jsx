import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthInput({ label, icon: Icon, type = "text", showPassword, togglePassword, ...props }) {
  const isPassword = type === "password";

  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <input
          type={showPassword ? "text" : type}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${isPassword ? 'pr-10' : 'pr-4'} py-3 bg-[#f8f9fa] border border-neutral-200/80 rounded-xl text-neutral-800 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white text-sm transition font-medium`}
          {...props}
        />
        {isPassword && togglePassword && (
          <button
            type="button"
            onClick={togglePassword}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 hover:text-neutral-600 transition"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}