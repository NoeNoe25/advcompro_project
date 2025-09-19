"use client";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icon issue
const icon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function RealMapComponent({ reviews, onSelectPosition }) {
  const [position, setPosition] = useState(null);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onSelectPosition(e.latlng);
      },
    });

    return position === null ? null : (
      <Marker position={position} icon={icon}>
        <Popup>
          Selected Location: <br /> {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
        </Popup>
      </Marker>
    );
  }

  return (
    <MapContainer
  center={[13.7367, 100.5231]}
  zoom={13}
  style={{ height: "100vh", width: "50%" }}  // CSS gives full height
>

      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
      {reviews.map((r, idx) => (
        <Marker key={idx} position={r.position} icon={icon}>
          <Popup>
            <b>{r.name}</b>: {r.review}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
