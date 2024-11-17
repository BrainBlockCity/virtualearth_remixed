import React from 'react';

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function CyberButton({ 
  variant = 'primary', 
  children, 
  className = '', 
  ...props 
}: CyberButtonProps) {
  const baseStyles = "p-3 bg-black/30 backdrop-blur-md rounded-lg border transition-all";
  const variants = {
    primary: "border-purple-500/30 text-purple-400 hover:bg-purple-900/30 shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)]",
    secondary: "border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/30 shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}