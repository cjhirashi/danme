import Link from "next/link";

type Variant = "primary" | "secondary" | "danger";
type Element = "button" | "link";

interface AdminButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  element?: Element;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const variantStyles = {
  primary:
    "bg-verde-danme text-white hover:bg-verde-danme/90 hover:shadow-md hover:scale-105",
  secondary:
    "border border-verde-danme text-verde-danme hover:bg-verde-danme/5 hover:shadow-sm",
  danger: "bg-red-600 text-white hover:bg-red-700 hover:shadow-md",
};

const baseStyles =
  "rounded px-4 py-2 font-medium transition-all duration-200 inline-block";

export default function AdminButton({
  children,
  variant = "primary",
  element = "button",
  href,
  onClick,
  disabled = false,
  className = "",
}: AdminButtonProps) {
  const styles = `${baseStyles} ${variantStyles[variant]} ${className}`;

  if (element === "link" && href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={styles}>
      {children}
    </button>
  );
}
