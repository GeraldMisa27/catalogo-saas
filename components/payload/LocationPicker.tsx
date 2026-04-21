"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useField } from "@payloadcms/ui";

// Coordenadas por defecto — La Habana, Cuba
const DEFAULT_CENTER: [number, number] = [-82.3666, 23.1136];
const DEFAULT_ZOOM = 12;

export default function LocationPicker() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Conecta con los campos latitude y longitude de Payload
  const { value: lat, setValue: setLat } = useField<number>({ path: "latitude" });
  const { value: lng, setValue: setLng } = useField<number>({ path: "longitude" });

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    lat && lng ? { lat, lng } : null
  );

  const setLatRef = useRef(setLat);
  const setLngRef = useRef(setLng);

  useEffect(() => {
    setLatRef.current = setLat;
    setLngRef.current = setLng;
  }, [setLat, setLng]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initial =
      coords &&
      typeof coords.lat === "number" &&
      typeof coords.lng === "number"
        ? coords
        : null;

    // Usa OpenStreetMap — gratuito sin API key
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
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: initial ? [initial.lng, initial.lat] : DEFAULT_CENTER,
      zoom: initial ? 15 : DEFAULT_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl(), "bottom-right");

    // Si ya hay coordenadas guardadas — muestra el marcador
    if (initial) {
      markerRef.current = new maplibregl.Marker({ color: "#6366f1" })
        .setLngLat([initial.lng, initial.lat])
        .addTo(map);
    }

    // El dueño hace clic en el mapa → actualiza las coordenadas
    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;

      // Actualiza o crea el marcador
      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new maplibregl.Marker({ color: "#6366f1" })
          .setLngLat([lng, lat])
          .addTo(map);
      }

      // Guarda en los campos de Payload automáticamente
      setLatRef.current(lat);
      setLngRef.current(lng);
      setCoords({ lat, lng });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // MapLibre: una sola inicialización. coords solo fija centro/marcador del primer pintado;
    // los setters de Payload van por ref para no re-suscribir el efecto al hacer clic.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only map setup
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
        Haz clic en el mapa para marcar la ubicación del negocio
      </p>

      {/* El mapa */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: 350,
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid #e0e0e0",
        }}
      />

      {/* Coordenadas seleccionadas */}
      {coords && (
        <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
          📍 Lat: {coords.lat.toFixed(6)} · Lng: {coords.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}