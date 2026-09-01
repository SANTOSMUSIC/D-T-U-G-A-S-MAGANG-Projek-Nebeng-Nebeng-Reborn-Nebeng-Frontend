import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthInput({
  label,
  icon: Icon,
  type = "text",
  showPassword: externalShowPassword,
  togglePassword: externalTogglePassword,
  error,
  id,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const isPassword = type === "password";

  const [internalShowPassword, setInternalShowPassword] = useState(false);
  const isControlled = externalShowPassword !== undefined;
  const isShowPassword = isControlled ? externalShowPassword : internalShowPassword;
  
  const handleToggle = () => {
    if (isControlled) {
      externalTogglePassword?.();
    } else {
      setInternalShowPassword(prev => !prev);
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-600 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-500">
            <Icon className="w-[18px] h-[18px]" />
          </span>
        )}
        <input
          id={inputId}
          type={isPassword ? (isShowPassword ? "text" : "password") : type}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} ${isPassword ? 'pr-12' : 'pr-4'} py-3.5 bg-white border ${error ? 'border-red-400 focus:ring-red-500' : 'border-neutral-200 focus:ring-[#4B2172]'} rounded-full text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 text-[15px] transition font-normal placeholder:font-normal`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={handleToggle}
            aria-label={isShowPassword ? "Sembunyikan password" : "Tampilkan password"}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-zinc-700 transition"
          >
            {isShowPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 ml-1 text-[11px] font-semibold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}