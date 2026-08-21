import React, { useId } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthInput({ label, icon: Icon, type = "text", showPassword, togglePassword, error, id, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const isPassword = type === "password";

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-[10px] font-extrabold uppercase tracking-wider text-neutral-500 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
            <Icon className="w-4 h-4" />
          </span>
        )}
        <input
          id={inputId}
          type={showPassword ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${isPassword ? 'pr-10' : 'pr-4'} py-3 bg-[#f8f9fa] border ${error ? 'border-red-400 focus:ring-red-500' : 'border-neutral-200/80 focus:ring-purple-600'} rounded-xl text-neutral-800 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:bg-white text-sm transition font-medium`}
          {...props}
        />
        {isPassword && togglePassword && (
          <button
            type="button"
            onClick={togglePassword}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-500 hover:text-neutral-600 transition"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-[11px] font-semibold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}