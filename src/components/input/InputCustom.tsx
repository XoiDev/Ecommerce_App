import React from "react";
import { Controller } from "react-hook-form";

type InputCustomProps = {
  name: string;
  control: any;
  children?: React.ReactNode;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  className?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const InputCustom: React.FC<InputCustomProps> = ({
  name,
  control,
  placeholder,
  children,
  type = "text",
  autoComplete = "off",
  className,
  onChange,
}) => {
  return control ? (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={`relative w-max`}>
          <input
            {...field}
            type={type}
            autoComplete={autoComplete}
            placeholder={placeholder}
            className={`w-full px-4 py-5 rounded-lg font-medium transition-all duration-200 border ${className} ${
              children ? "pr-14" : ""
            } bg-gray-100 focus:bg-white focus:border-primary outline-none`}
          >
            {children && (
              <div className="absolute transform -translate-y-1/2 cursor-pointer right-5 top-1/2">
                {children}
              </div>
            )}
          </input>
        </div>
      )}
    />
  ) : (
    <input
      // {...field}
      type={type}
      onChange={onChange}
      autoComplete={autoComplete}
      placeholder={placeholder}
      className={`px-4 py-5 rounded-lg font-medium transition-all duration-200 border  ${
        children ? "pr-14" : ""
      } bg-gray-100 focus:bg-white focus:border-primary outline-none ${className}`}
    >
      {children && (
        <div className="absolute transform -translate-y-1/2 cursor-pointer right-5 top-1/2">
          {children}
        </div>
      )}
    </input>
  );
};

export default InputCustom;
