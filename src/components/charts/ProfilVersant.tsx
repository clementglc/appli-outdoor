const BANDES = [
  { max: 0, couleur: "#93c5fd", label: "descente" },
  { max: 3, couleur: "#bbe6a8", label: "< 3 %" },
  { max: 6, couleur: "#6cbf5e", label: "3–6 %" },
  { max: 9, couleur: "#f4b73d", label: "6–9 %" },
  { max: 12, couleur: "#ea7a3c", label: "9–12 %" },
  { max: Infinity, couleur: "#c0392b", label: "> 12 %" },
];

function couleurPente(pente: number): string {
  return (BANDES.find((b) => pente < b.max) ?? BANDES[BANDES.length - 1]).couleur;
}

function arrondiPas(valeur: number, pas: number): number {
  return Math.round(valeur / pas) * pas;
}

export default function ProfilVersant({
  profilKm,
  altitudeDepart,
  distanceKm,
}: {
  profilKm: number[];
  altitudeDepart: number | null;
  distanceKm: number | null;
}) {
  const n = profilKm.length;
  const altitudeConnue = altitudeDepart != null;
  const depart = altitudeDepart ?? 0;

  const segments = profilKm.map((pente, i) => {
    const dernier = i === n - 1;
    const distanceSegment =
      dernier && distanceKm != null ? Math.max(distanceKm - (n - 1), 0.2) : 1;
    return { pente, gain: (pente / 100) * distanceSegment * 1000 };
  });

  const cumul = [depart];
  for (const { gain } of segments) cumul.push(cumul[cumul.length - 1] + gain);

  const yDonneesMin = Math.min(depart, ...cumul);
  const yDonneesMax = Math.max(...cumul);
  const pas = yDonneesMax - yDonneesMin > 800 ? 200 : 100;
  const yMin = arrondiPas(yDonneesMin, pas) - (yDonneesMin < arrondiPas(yDonneesMin, pas) ? pas : 0);
  const yMax = arrondiPas(yDonneesMax, pas) + (yDonneesMax > arrondiPas(yDonneesMax, pas) ? pas : 0);

  const largeur = 700;
  const hauteur = 260;
  const marge = { haut: 22, bas: 26, gauche: 36, droite: 8 };
  const largeurGraphe = largeur - marge.gauche - marge.droite;
  const hauteurGraphe = hauteur - marge.haut - marge.bas;

  const echelleY = (alt: number) =>
    marge.haut + hauteurGraphe - ((alt - yMin) / (yMax - yMin)) * hauteurGraphe;
  const largeurBarre = largeurGraphe / n;

  const gridlines: number[] = [];
  for (let v = Math.ceil(yMin / pas) * pas; v <= yMax; v += pas) gridlines.push(v);

  return (
    <div>
      <svg
        viewBox={`0 0 ${largeur} ${hauteur}`}
        className="w-full"
        role="img"
        aria-label="Profil altimétrique kilomètre par kilomètre"
      >
        {gridlines.map((alt) => (
          <g key={alt}>
            <line
              x1={marge.gauche}
              x2={largeur - marge.droite}
              y1={echelleY(alt)}
              y2={echelleY(alt)}
              stroke="#e7e5e4"
              strokeWidth={1}
            />
            <text x={2} y={echelleY(alt) + 3} fontSize={9} fill="#a8a29e">
              {altitudeConnue ? alt : ""}
            </text>
          </g>
        ))}

        {segments.map(({ pente }, i) => {
          const x = marge.gauche + i * largeurBarre;
          const yHaut = echelleY(cumul[i + 1]);
          const yBas = echelleY(yMin);
          const hauteurBarre = Math.max(yBas - yHaut, 0);
          const altitudeLabel = Math.round(cumul[i + 1]);
          return (
            <g key={i}>
              <rect
                x={x + 0.5}
                y={yHaut}
                width={Math.max(largeurBarre - 1, 1)}
                height={hauteurBarre}
                fill={couleurPente(pente)}
              />
              {altitudeConnue && (
                <text
                  x={x + largeurBarre / 2}
                  y={yHaut - 4}
                  fontSize={8.5}
                  textAnchor="middle"
                  fill="#78716c"
                >
                  {altitudeLabel}
                </text>
              )}
              {hauteurBarre > 13 && (
                <text
                  x={x + largeurBarre / 2}
                  y={yBas - 5}
                  fontSize={9}
                  fontWeight={600}
                  textAnchor="middle"
                  fill="#ffffff"
                >
                  {pente.toFixed(1)}
                </text>
              )}
              <text
                x={x + largeurBarre / 2}
                y={hauteur - marge.bas + 13}
                fontSize={8}
                textAnchor="middle"
                fill="#a8a29e"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        <line
          x1={marge.gauche}
          x2={largeur - marge.droite}
          y1={echelleY(yMin)}
          y2={echelleY(yMin)}
          stroke="#d6d3d1"
          strokeWidth={1}
        />
      </svg>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {BANDES.slice(1).map((b) => (
          <span key={b.label} className="flex items-center gap-1 text-[10px] text-stone-500">
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: b.couleur }}
            />
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}
