import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function AuthInput({
  label,
  type = 'text',
  showPassword: externalShowPassword,
  togglePassword: externalTogglePassword,
  error,
  id,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  const isPassword = type === 'password';

  const [internalShowPassword, setInternalShowPassword] =
    useState(false);

  const isControlled =
    externalShowPassword !== undefined;

  const isShowPassword = isControlled
    ? externalShowPassword
    : internalShowPassword;

  const handleToggle = () => {
    if (isControlled) {
      externalTogglePassword?.();
    } else {
      setInternalShowPassword((prev) => !prev);
    }
  };

  return (
    <div className="w-full">

      {/* LABEL */}
      {label && (
        <label
          htmlFor={inputId}
          className="
            block
            mb-1.5
            text-[11px]
            leading-[1.4]
            font-normal
            text-[#999999]
          "
        >
          {label}
        </label>
      )}

      <div className="relative">

        {/* INPUT */}
        <input
          id={inputId}
          type={
            isPassword
              ? isShowPassword
                ? 'text'
                : 'password'
              : type
          }
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : undefined
          }
          className={`
            w-full
            h-10
            sm:h-10.25

            pl-4
            ${isPassword ? 'pr-11' : 'pr-4'}

            bg-white
            border

            ${
              error
                ? `
                  border-[#E57373]
                  focus:border-[#E57373]
                  focus:ring-[#E57373]/10
                `
                : `
                  border-[#E3E3E3]
                  focus:border-[#74B4D9]
                  focus:ring-[#74B4D9]/15
                `
            }

            rounded-full

            text-[10px]
            sm:text-[10.5px]

            leading-none
            font-normal
            text-[#333333]

            placeholder:text-[#333333]
            placeholder:font-normal

            outline-none
            focus:ring-2

            transition-all
            duration-200
          `}
          {...props}
        />

        {/* PASSWORD TOGGLE */}
        {isPassword && (
          <button
            type="button"
            onClick={handleToggle}
            aria-label={
              isShowPassword
                ? 'Sembunyikan password'
                : 'Tampilkan password'
            }
            className="
              absolute
              inset-y-0
              right-0
              w-10.5

              flex
              items-center
              justify-center

              text-[#999999]
              hover:text-[#10367D]

              transition-colors
              duration-150
            "
          >
            {isShowPassword ? (
              <EyeOff className="w-3.75 h-3.75" />
            ) : (
              <Eye className="w-3.75 h-3.75" />
            )}
          </button>
        )}

      </div>

      {/* ERROR */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="
            mt-1.5
            ml-1
            text-[9px]
            leading-[1.4]
            font-medium
            text-[#E57373]
          "
        >
          {error}
        </p>
      )}

    </div>
  );
}