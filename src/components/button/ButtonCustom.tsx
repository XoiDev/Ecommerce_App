import React from "react";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: string;
}

const ButtonCustom: React.FC<ButtonProps> = ({
  text,
  onClick,
  disabled = false,
  className = "",
  type = "submit",
}) => {
  return (
    <button
      className={`bg-[#00152a] ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      } h-[50px] text-bold transition-all hover:bg-primary hover:text-white flex items-center justify-center px-8 ml-4 font-bold text-white rounded-lg ${className}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {text}
    </button>
  );
};

export default ButtonCustom;
