import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("../components/RealMapComponent"), {
  ssr: false,
});

export default function Home() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapComponent />
    </div>
  );
}
