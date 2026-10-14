import type { NoticeVariant } from "@/lib/admin/flash";

const STYLES: Record<NoticeVariant, { box: string; icon: string }> = {
  success: { box: "border-verde-danme bg-verde-danme/10 text-verde-danme", icon: "✓" },
  error: { box: "border-red-600 bg-red-50 text-red-700", icon: "✕" },
  warning: { box: "border-ambar bg-ambar/15 text-verde-oscuro", icon: "!" },
};

// RF-121 — aviso visible de éxito / error / éxito parcial de una operación de escritura.
export default function Notice({
  variant,
  message,
  onClose,
}: {
  variant: NoticeVariant;
  message: string;
  onClose?: () => void;
}) {
  const style = STYLES[variant];
  return (
    <div
      role={variant === "success" ? "status" : "alert"}
      className={`flex items-start gap-3 rounded border px-4 py-3 text-sm font-medium ${style.box}`}
    >
      <span aria-hidden="true">{style.icon}</span>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Cerrar aviso" className="leading-none opacity-70 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
}
