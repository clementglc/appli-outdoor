"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIENS = [
  { href: "/checklist", label: "Checklist" },
  { href: "/ascensions", label: "Mes ascensions" },
];

/** Nav principale (Checklist / Mes ascensions) avec indication visuelle
 * de l'onglet actif. */
export default function NavPrincipale() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 text-sm font-medium">
      {LIENS.map((lien) => {
        const actif = pathname === lien.href;
        return (
          <Link
            key={lien.href}
            href={lien.href}
            className={`whitespace-nowrap rounded-full px-2.5 py-1 ${
              actif
                ? "bg-gray-900 text-white"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            {lien.label}
          </Link>
        );
      })}
    </nav>
  );
}
