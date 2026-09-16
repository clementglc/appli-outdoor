/** Anneau de progression façon "% du monde visité" (Been) — ici le
 * pourcentage de cols gravis. SVG maison, pas de librairie externe. */
export default function ProgressionRing({
  pourcentage,
  label,
  sousLabel,
}: {
  pourcentage: number;
  label: string;
  sousLabel?: string;
}) {
  const taille = 104;
  const rayon = 44;
  const centre = taille / 2;
  const epaisseur = 10;
  const circonference = 2 * Math.PI * rayon;
  const part = Math.min(Math.max(pourcentage, 0), 100) / 100;
  const decalage = circonference * (1 - part);

  return (
    <div className="flex items-center gap-4">
      <svg
        width={taille}
        height={taille}
        viewBox={`0 0 ${taille} ${taille}`}
        className="shrink-0"
        role="img"
        aria-label={`${Math.round(pourcentage)} % gravis`}
      >
        <circle
          cx={centre}
          cy={centre}
          r={rayon}
          fill="none"
          stroke="#e7e5e4"
          strokeWidth={epaisseur}
        />
        <circle
          cx={centre}
          cy={centre}
          r={rayon}
          fill="none"
          stroke="#10b981"
          strokeWidth={epaisseur}
          strokeLinecap="round"
          strokeDasharray={circonference}
          strokeDashoffset={decalage}
          transform={`rotate(-90 ${centre} ${centre})`}
        />
        <text
          x={centre}
          y={centre + 7}
          textAnchor="middle"
          fontSize={22}
          fontWeight={700}
          fill="#1c1917"
        >
          {Math.round(pourcentage)}%
        </text>
      </svg>
      <div>
        <p className="text-lg font-semibold text-stone-900">{label}</p>
        {sousLabel && <p className="text-sm text-stone-500">{sousLabel}</p>}
      </div>
    </div>
  );
}
