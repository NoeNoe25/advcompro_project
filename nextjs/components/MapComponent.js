"use client";

import dynamic from "next/dynamic";

// Import map dynamically so it only loads on client
const LeafletMap = dynamic(() => import("./RealMapComponent"), {
  ssr: false, // disable server-side rendering
});

export default function MapComponent(props) {
  return <LeafletMap {...props} />;
}
