"use client";
import { useState, useEffect } from "react";

/**
 * Props:
 * - onAddReview(newReview) -> callback after backend returns the saved review
 * - selectedPosition -> object { lat, lng, label? } (from map)
 */
export default function ReviewForm({ onAddReview, selectedPosition }) {
  const [formData, setFormData] = useState({
    title: "",
    comment: "",
    rating: 1,
    latitude: "",
    longitude: "",
    address: "",
  });
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When selectedPosition changes, populate latitude/longitude/address
  useEffect(() => {
    if (selectedPosition) {
      setFormData(prev => ({
        ...prev,
        latitude: selectedPosition.lat ?? selectedPosition.latitude ?? prev.latitude,
        longitude: selectedPosition.lng ?? selectedPosition.longitude ?? prev.longitude,
        address: selectedPosition.label ?? prev.address,
      }));
    }
  }, [selectedPosition]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.comment) {
      return alert("Please fill in title and comment.");
    }

    if (!formData.latitude || !formData.longitude) {
      return alert("Please select a place on the map.");
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("comment", formData.comment);
      submitData.append("rating", String(formData.rating));
      submitData.append("latitude", String(formData.latitude));
      submitData.append("longitude", String(formData.longitude));
      submitData.append("address", formData.address || "");
      submitData.append("user_id", "1"); // replace with real auth user

      if (image) {
        submitData.append("image", image);
      }

      const response = await fetch("http://localhost:8000/api/reviews", { method: "POST", body: submitData });



      if (!response.ok) {
  const err = await response.json().catch(() => ({}));
  throw new Error(err.detail || "Failed to submit review");
}

const newReview = await response.json();



      // lift saved review up to parent for immediate display
      if (onAddReview) onAddReview(newReview);

      // reset except keep location (optional)
      setFormData({
        title: "",
        comment: "",
        rating: 1,
        latitude: formData.latitude, // keep selected
        longitude: formData.longitude,
        address: formData.address,
      });
      setImage(null);
      alert("Review submitted!");
    } catch (err) {
      console.error(err);
      alert("Error submitting review: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 p-4 border rounded-lg">
      <h2 className="text-xl font-bold">Add a Review</h2>

      <input
        type="text"
        name="title"
        placeholder="Review Title"
        className="border p-2 rounded"
        value={formData.title}
        onChange={handleInputChange}
        required
      />

      <textarea
        name="comment"
        placeholder="Write your review comment"
        className="border p-2 rounded"
        rows="4"
        value={formData.comment}
        onChange={handleInputChange}
        required
      />

      <div className="flex items-center space-x-2">
        <label>Rating:</label>
        <select
          name="rating"
          className="border p-2 rounded"
          value={formData.rating}
          onChange={handleInputChange}
        >
          {[1, 2, 3, 4, 5].map(num => (
            <option key={num} value={num}>{num} Star{num !== 1 ? 's' : ''}</option>
          ))}
        </select>
      </div>

      <input
        type="text"
        name="address"
        placeholder="Location Address"
        className="border p-2 rounded"
        value={formData.address}
        onChange={handleInputChange}
        required
      />

      {formData.latitude && formData.longitude && (
        <div className="text-sm text-gray-600">
          Location: {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
        </div>
      )}

      <div>
        <label className="block mb-2">Upload Image (Optional):</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border p-2 rounded w-full"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
