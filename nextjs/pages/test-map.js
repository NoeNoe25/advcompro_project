"use client";

import { useState } from "react";
import MapComponent from "../components/MapComponent";
import ReviewForm from "../components/ReviewForm";

export default function Home() {
  const [reviews, setReviews] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);

  const handleAddReview = (newReview) => {
    if (!selectedPosition) return alert("Please select a place on the map first!");
    setReviews([...reviews, { ...newReview, position: selectedPosition }]);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1">
        <MapComponent
          reviews={reviews}
          onSelectPosition={setSelectedPosition}
        />
      </div>
      <div className="border-t p-4 bg-gray-50">
        <ReviewForm onAddReview={handleAddReview} />
      </div>
    </div>
  );
}
