import React from "react";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";

interface ToastProps {
  message: { text: string; type: "success" | "info" | "error" } | null;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  const bgColors = {
    success: "bg-emerald-500",
    info: "bg-blue-500",
    error: "bg-rose-500",
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-white" />,
    info: <Info className="w-5 h-5 text-white" />,
    error: <AlertTriangle className="w-5 h-5 text-white" />,
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
      <div className={`${bgColors[message.type]} text-white px-5 py-3 rounded-full shadow-2xl flex items-center space-x-3 rtl:space-x-reverse min-w-[280px] justify-center`}>
        {icons[message.type]}
        <span className="font-bold text-sm tracking-wide">{message.text}</span>
      </div>
    </div>
  );
};

export default Toast;
