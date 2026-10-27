import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  primary: "vero-btn",
  secondary: "vero-btn vero-btn--ghost",
  danger: "vero-btn",
};

const dangerStyle: CSSProperties = {
  background: "var(--danger)",
  borderColor: "var(--danger)",
  color: "var(--on-ink)",
};

function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${variantClass[variant]} gap-2 ${className}`.trim()}
      style={variant === "danger" ? { ...dangerStyle, ...style } : style}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;