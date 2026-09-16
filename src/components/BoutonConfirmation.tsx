"use client";

import type { ButtonHTMLAttributes } from "react";

/** Bouton de soumission qui demande une confirmation JS avant de laisser
 * le formulaire partir — pour les actions irréversibles (suppression). */
export default function BoutonConfirmation({
  message,
  children,
  ...props
}: {
  message: string;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      type="submit"
      onClick={(e) => {
        if (!window.confirm(message)) {
          e.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
