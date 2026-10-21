import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Icon } from "./Icon";
export function Modal({
  children,
  title,
  onClose,
  wide = false,
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "wide-modal" : ""}`}
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-heading">
        <span className="eyebrow">{title}</span>
        <button className="icon-button" aria-label="Жабу" onClick={onClose}>
          <Icon name="X" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
