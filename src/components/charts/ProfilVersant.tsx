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
  const echelleX = (km: number) => marge.gauche + (km / n) * largeurGraphe;
  const yBas = echelleY(yMin);

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

        {/* Silhouette continue : chaque km est un trapèze dont le sommet
            va de l'altitude cumulée précédente à la suivante, pour que
            les km s'enchaînent sans cassure (pas de vision créneau). */}
        {segments.map(({ pente }, i) => {
          const xG = echelleX(i);
          const xD = echelleX(i + 1);
          const yG = echelleY(cumul[i]);
          const yD = echelleY(cumul[i + 1]);
          return (
            <polygon
              key={i}
              points={`${xG},${yBas} ${xG},${yG} ${xD},${yD} ${xD},${yBas}`}
              fill={couleurPente(pente)}
              stroke="#ffffff"
              strokeWidth={0.5}
            >
              <title>{`km ${i + 1} : ${pente.toFixed(1)} %`}</title>
            </polygon>
          );
        })}

        {segments.map(({ pente }, i) => {
          const xCentre = (echelleX(i) + echelleX(i + 1)) / 2;
          const yG = echelleY(cumul[i]);
          const yD = echelleY(cumul[i + 1]);
          const hauteurMoyenne = yBas - (yG + yD) / 2;
          if (hauteurMoyenne <= 13) return null;
          return (
            <text
              key={i}
              x={xCentre}
              y={yBas - 5}
              fontSize={9}
              fontWeight={600}
              textAnchor="middle"
              fill="#ffffff"
            >
              {pente.toFixed(1)}
            </text>
          );
        })}

        {cumul.map((alt, i) => (
          <g key={i}>
            {altitudeConnue && (
              <text
                x={echelleX(i)}
                y={echelleY(alt) - 4}
                fontSize={8.5}
                textAnchor="middle"
                fill="#78716c"
              >
                {Math.round(alt)}
              </text>
            )}
            <text
              x={echelleX(i)}
              y={hauteur - marge.bas + 13}
              fontSize={8}
              textAnchor="middle"
              fill="#a8a29e"
            >
              {i}
            </text>
          </g>
        ))}

        <line
          x1={marge.gauche}
          x2={largeur - marge.droite}
          y1={yBas}
          y2={yBas}
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
