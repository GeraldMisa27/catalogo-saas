"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface BusinessMapProps {
  latitude: number;
  longitude: number;
  name: string;
}

// Componente Client — el mapa necesita el navegador
export default function BusinessMap({ latitude, longitude, name }: BusinessMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
      center: [longitude, latitude],
      zoom: 15,
      interactive: false, // solo lectura — no se puede mover
    });

    // Marcador con el nombre del negocio
    new maplibregl.Marker({ color: "#6366f1" })
      .setLngLat([longitude, latitude])
      .setPopup(
        new maplibregl.Popup({ offset: 25 }).setText(name)
      )
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, name]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: "100%",
        height: 200,
        borderRadius: 12,
        overflow: "hidden",
      }}
    />
  );
}