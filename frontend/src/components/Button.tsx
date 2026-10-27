import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {

  const base =
    "inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold transition";

  const variants = {
    primary:
      "bg-black text-white hover:bg-neutral-800",

    secondary:
      "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",

    danger:
      "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;