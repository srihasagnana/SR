import * as React from "react";

export function Button({ children, onClick, variant = "default" }) {
  const baseStyles = "px-4 py-2 rounded-md font-medium focus:outline-none";
  const variants = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    outline: "border border-blue-500 text-blue-500 hover:bg-blue-100",
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </button>
  );
}
