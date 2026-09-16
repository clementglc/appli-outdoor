/** Couleur par tranche de pente, convention habituelle des profils de
 * cols (vert = facile, rouge = raide). */
function couleurPente(pente: number): string {
  if (pente < 3) return "#a3d9a5";
  if (pente < 6) return "#5cb85c";
  if (pente < 9) return "#f0ad4e";
  if (pente < 12) return "#e8703a";
  return "#d9534f";
}

export default function ProfilVersant({ profilKm }: { profilKm: number[] }) {
  const largeur = 700;
  const hauteur = 220;
  const marge = { haut: 16, bas: 24, gauche: 32, droite: 8 };
  const largeurGraphe = largeur - marge.gauche - marge.droite;
  const hauteurGraphe = hauteur - marge.haut - marge.bas;

  const penteMax = Math.max(...profilKm, 10);
  const largeurBarre = largeurGraphe / profilKm.length;

  return (
    <svg viewBox={`0 0 ${largeur} ${hauteur}`} className="w-full" role="img" aria-label="Profil kilomètre par kilomètre">
      {[0, 5, 10, 15].map((repere) => {
        if (repere > penteMax + 2) return null;
        const y = marge.haut + hauteurGraphe - (repere / penteMax) * hauteurGraphe;
        return (
          <g key={repere}>
            <line
              x1={marge.gauche}
              x2={largeur - marge.droite}
              y1={y}
              y2={y}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <text x={4} y={y + 3} fontSize={9} fill="#9ca3af">
              {repere}%
            </text>
          </g>
        );
      })}

      {profilKm.map((pente, index) => {
        const x = marge.gauche + index * largeurBarre;
        const h = (Math.max(pente, 0) / penteMax) * hauteurGraphe;
        const y = marge.haut + hauteurGraphe - h;
        return (
          <g key={index}>
            <rect
              x={x + 1}
              y={y}
              width={Math.max(largeurBarre - 2, 1)}
              height={h}
              fill={couleurPente(pente)}
            />
            <text
              x={x + largeurBarre / 2}
              y={hauteur - marge.bas + 12}
              fontSize={8}
              textAnchor="middle"
              fill="#9ca3af"
            >
              {index + 1}
            </text>
          </g>
        );
      })}

      <line
        x1={marge.gauche}
        x2={largeur - marge.droite}
        y1={marge.haut + hauteurGraphe}
        y2={marge.haut + hauteurGraphe}
        stroke="#d1d5db"
        strokeWidth={1}
      />
    </svg>
  );
}
