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
      setFormData((prev) => ({
        ...prev,
        latitude:
          selectedPosition.lat ?? selectedPosition.latitude ?? prev.latitude,
        longitude:
          selectedPosition.lng ?? selectedPosition.longitude ?? prev.longitude,
        address: selectedPosition.label ?? prev.address,
      }));
    }
  }, [selectedPosition]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value,
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

      const response = await fetch("http://localhost:8000/api/reviews", {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to submit review");
      }

      const newReview = await response.json();

      if (onAddReview) onAddReview(newReview);

      setFormData({
        title: "",
        comment: "",
        rating: 1,
        latitude: formData.latitude,
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
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-4 p-6 rounded-xl shadow-md bg-[#2f2a27] border border-[#bfa14a]/40 text-white"
    >
      <h2 className="text-xl font-bold text-[#bfa14a]">Add a Review</h2>

      <input
        type="text"
        name="title"
        placeholder="Review Title"
        className="border border-[#bfa14a]/40 bg-transparent text-white p-2 rounded focus:border-[#bfa14a] focus:outline-none placeholder-gray-400"
        value={formData.title}
        onChange={handleInputChange}
        required
      />

      <textarea
        name="comment"
        placeholder="Write your review comment"
        className="border border-[#bfa14a]/40 bg-transparent text-white p-2 rounded focus:border-[#bfa14a] focus:outline-none placeholder-gray-400"
        rows="4"
        value={formData.comment}
        onChange={handleInputChange}
        required
      />

      <div className="flex items-center space-x-2">
        <label className="text-[#bfa14a]">Rating:</label>
        <select
          name="rating"
          className="border border-[#bfa14a]/40 bg-[#2f2a27] text-white p-2 rounded focus:border-[#bfa14a] focus:outline-none"
          value={formData.rating}
          onChange={handleInputChange}
        >
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num} className="bg-[#2f2a27] text-white">
              {num} Star{num !== 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      <input
        type="text"
        name="address"
        placeholder="Location Address"
        className="border border-[#bfa14a]/40 bg-transparent text-white p-2 rounded focus:border-[#bfa14a] focus:outline-none placeholder-gray-400"
        value={formData.address}
        onChange={handleInputChange}
        required
      />

      {formData.latitude && formData.longitude && (
        <div className="text-sm text-gray-400">
          Location:{" "}
          <span className="text-[#bfa14a]">
            {Number(formData.latitude).toFixed(6)},{" "}
            {Number(formData.longitude).toFixed(6)}
          </span>
        </div>
      )}

      <div>
        <label className="block mb-2 text-[#bfa14a]">
          Upload Image (Optional):
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="border border-[#bfa14a]/40 bg-transparent text-white p-2 rounded w-full focus:border-[#bfa14a] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-[#bfa14a] text-[#2f2a27] font-semibold p-2 rounded hover:bg-[#d6b65e] disabled:bg-[#bfa14a]/50 transition"
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
