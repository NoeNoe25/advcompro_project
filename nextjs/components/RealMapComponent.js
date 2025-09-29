"use client";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-geosearch/dist/geosearch.css";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

// 📌 Fix marker icon issue
const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// 🔎 Search Field Component
function SearchField({ onSelectPosition }) {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      showMarker: true,
      showPopup: false,
      marker: { icon },
      retainZoomLevel: true,
      autoClose: true,
      keepResult: true,
      searchLabel: "Enter address or place",
    });

    map.addControl(searchControl);

    map.on("geosearch/showlocation", (result) => {
      const { x, y, label } = result.location;
      const latlng = { lat: y, lng: x }; // ✅ Ensure correct format

      if (onSelectPosition) {
        onSelectPosition({ ...latlng, label });
      }

      map.setView(latlng, 15);
    });

    return () => map.removeControl(searchControl);
  }, [map, onSelectPosition]);

  return null;
}

// 📍 Main Map Component
export default function RealMapComponent({ reviews = [], onSelectPosition }) {
  const [position, setPosition] = useState(null);

  // 📍 Handle manual click selection
  function LocationMarker() {
    useMapEvents({
      click(e) {
        const latlng = { lat: e.latlng.lat, lng: e.latlng.lng };
        setPosition(latlng);
        if (onSelectPosition) {
          onSelectPosition({ ...latlng, label: "Custom Location" });
        }
      },
    });

    return position === null ? null : (
      <Marker position={[position.lat, position.lng]} icon={icon}>
        <Popup>
          Selected Location: <br /> {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
        </Popup>
      </Marker>
    );
  }

  return (
    <MapContainer
      center={[13.7367, 100.5231]} // Bangkok
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🔎 Search bar */}
      <SearchField onSelectPosition={onSelectPosition} />

      {/* 📍 Manual selection marker */}
      <LocationMarker />

      {/* 📍 Review markers */}
      {reviews.map((r, idx) => {
        if (!r.position || !r.position.lat || !r.position.lng) return null; // ✅ skip invalid
        return (
          <Marker key={idx} position={[r.position.lat, r.position.lng]} icon={icon}>
            <Popup>
              <b>{r.placeName}</b>
              <br />
              {r.name}: {r.review}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
