"use client";

import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import Link from "next/link";
import type { ColAvecStatut } from "@/lib/cols";

type ColAvecCoordonnees = ColAvecStatut & { latitude: number; longitude: number };

/** Carte interactive des Pyrénées : un point par col, orange s'il est
 * gravi (au moins un versant), gris sinon — même code couleur que la
 * grille "collection" de la checklist. Fonds de carte OpenStreetMap
 * (gratuit, pas de clé API). */
export default function CarteInteractive({ cols }: { cols: ColAvecCoordonnees[] }) {
  return (
    <MapContainer
      center={[42.85, 0.5]}
      zoom={8}
      scrollWheelZoom={true}
      className="h-[70vh] w-full rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {cols.map((col) => (
        <CircleMarker
          key={col.id}
          center={[col.latitude, col.longitude]}
          radius={9}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: col.gravi ? "#ea580c" : "#a8a29e",
            fillOpacity: 1,
          }}
        >
          <Popup>
            <div className="space-y-1">
              <p className="font-medium text-stone-900">
                {col.nom}
                {col.altitude_m != null && (
                  <span className="font-normal text-stone-500"> · {col.altitude_m} m</span>
                )}
              </p>
              <ul className="space-y-0.5">
                {col.versants.map((versant) => {
                  const statut = col.versantsStatut.find((v) => v.versantId === versant.id);
                  return (
                    <li key={versant.id}>
                      <Link
                        href={`/checklist/${versant.id}`}
                        className={`text-sm hover:underline ${
                          statut?.gravi ? "text-emerald-700" : "text-orange-700"
                        }`}
                      >
                        {statut?.gravi ? "✓ " : ""}
                        {versant.nom}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
