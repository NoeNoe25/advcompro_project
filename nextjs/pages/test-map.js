"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Rating,
  Button,
  Avatar,
  Pagination,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { LocationOn, Add, Map, Star, Close, CloudUpload } from "@mui/icons-material";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false,
  loading: () => (
    <Box 
      sx={{ 
        height: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100'
      }}
    >
      <CircularProgress />
    </Box>
  )
});

export default function ReviewsAndMapPage() {
  // Default location (Bangkok, Thailand example)
  const defaultLocation = {
    lat: 13.7563,
    lng: 100.5018,
    label: "Bangkok, Thailand"
  };

  // State for reviews and modal
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]); 
  const [filteredReviews, setFilteredReviews] = useState([]); 
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [newReview, setNewReview] = useState({
    title: "",
    comment: "",
    rating: 1,
    address: "",
  });

  // Fetch all reviews on component mount
  useEffect(() => {
    fetchAllReviews();
  }, []);

  // Filter reviews when selected position or data changes
  useEffect(() => {
    if (selectedPosition) {
      filterReviewsByLocation(selectedPosition.lat, selectedPosition.lng);
    } else {
      // No selection → show default location
      filterReviewsByLocation(defaultLocation.lat, defaultLocation.lng);
    }
  }, [selectedPosition, allReviews]);

  // Fetch all reviews from the database
  const fetchAllReviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/reviews");
      if (!response.ok) {
        throw new Error("Failed to fetch reviews");
      }
      const reviewsData = await response.json();
      setAllReviews(reviewsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      alert("Error loading reviews: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter reviews by location (within a small radius)
  const filterReviewsByLocation = async (lat, lng) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/reviews?latitude=${lat}&longitude=${lng}`
      );
      
      if (response.ok) {
        const locationReviews = await response.json();
        setFilteredReviews(locationReviews);
      } else {
        // fallback: nearby reviews
        const nearbyReviews = allReviews.filter(review => {
          const distance = calculateDistance(lat, lng, review.latitude, review.longitude);
          return distance < 1;
        });
        setFilteredReviews(nearbyReviews);
      }
    } catch (error) {
      console.error("Error filtering reviews by location:", error);
      const nearbyReviews = allReviews.filter(review => {
        const distance = calculateDistance(lat, lng, review.latitude, review.longitude);
        return distance < 1;
      });
      setFilteredReviews(nearbyReviews);
    }
  };

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
      return 0;
    }
    const numLat1 = parseFloat(lat1);
    const numLon1 = parseFloat(lon1);
    const numLat2 = parseFloat(lat2);
    const numLon2 = parseFloat(lon2);
    if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) {
      return 0;
    }

    const R = 6371;
    const dLat = (numLat2 - numLat1) * Math.PI / 180;
    const dLon = (numLon2 - numLon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(numLat1 * Math.PI / 180) * Math.cos(numLat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Handle image selection
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Handle adding new review
  const handleAddReview = async () => {
    if (!newReview.title || !newReview.comment) {
      alert("Please fill in title and comment.");
      return;
    }
    const pos = selectedPosition || defaultLocation;
    setIsSubmitting(true);
    try {
      const submitData = new FormData();
      submitData.append("title", newReview.title);
      submitData.append("comment", newReview.comment);
      submitData.append("rating", String(newReview.rating));
      submitData.append("latitude", String(pos.lat));
      submitData.append("longitude", String(pos.lng));
      submitData.append("address", newReview.address || pos.label || "Selected Location");
      submitData.append("user_id", "1");
      if (selectedImage) {
        submitData.append("image", selectedImage);
      }

      const response = await fetch("http://localhost:8000/api/reviews", {
        method: "POST",
        body: submitData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || "Failed to submit review");
      }

      await fetchAllReviews();
      setNewReview({ title: "", comment: "", rating: 1, address: "" });
      setSelectedImage(null);
      setImagePreview(null);
      setOpenModal(false);
      setSelectedPosition(null);
    } catch (err) {
      console.error(err);
      alert("Error submitting review: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    if (!isSubmitting) {
      setOpenModal(false);
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const handlePageChange = (event, value) => setPage(value);

  const handleSelectPosition = (position) => {
    setSelectedPosition(position);
    setNewReview(prev => ({ ...prev, address: position.label || "Selected Location" }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getAvatarInitial = (userName) => userName ? userName.charAt(0).toUpperCase() : "U";

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000/${imagePath}`;
  };

  // Pagination
  const reviewsPerPage = 5;
  const startIndex = (page - 1) * reviewsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + reviewsPerPage);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        Place Reviews & Location
      </Typography>

      <Grid container spacing={3}>
        {/* Reviews Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h2">
                  Customer Reviews
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setOpenModal(true)}>
                  Add Review
                </Button>
              </Box>

              {isLoading && (
                <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {!isLoading && paginatedReviews.length === 0 ? (
                <Typography variant="body2" align="center" sx={{ py: 4 }}>
                  No reviews yet for {selectedPosition?.label || defaultLocation.label}.
                </Typography>
              ) : (
                paginatedReviews.map((review) => (
                  <Card key={review.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                        {getAvatarInitial(review.user_name || "User")}
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {review.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {review.user_name || "User"} • {formatDate(review.created_at)}
                        </Typography>
                      </Box>
                    </Box>
                    <Rating value={review.rating} precision={0.5} readOnly sx={{ mb: 1 }} />
                    <Typography variant="body2" paragraph>{review.comment}</Typography>
                    {review.image_path && (
                      <Box sx={{ mb: 2 }}>
                        <img 
                          src={getImageUrl(review.image_path)} 
                          alt="Review" 
                          style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      </Box>
                    )}
                    {review.address && (
                      <Chip icon={<LocationOn />} label={review.address} size="small" variant="outlined" />
                    )}
                  </Card>
                ))
              )}

              {filteredReviews.length > reviewsPerPage && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Pagination 
                    count={Math.ceil(filteredReviews.length / reviewsPerPage)} 
                    page={page} 
                    onChange={handlePageChange} 
                    color="primary" 
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Map Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 0, height: '100%' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h5">
                  <LocationOn sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Interactive Map
                </Typography>
                <Chip 
                  icon={<Map />} 
                  label={selectedPosition ? "Location Selected" : "Default Location"} 
                  variant={selectedPosition ? "filled" : "outlined"}
                  color={selectedPosition ? "success" : "primary"}
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Showing {filteredReviews.length} review(s) for {selectedPosition?.label || defaultLocation.label}
                </Typography>
              </Box>

              <Box sx={{ height: 400 }}>
                <MapComponent
                  reviews={allReviews}
                  onSelectPosition={handleSelectPosition}
                  selectedPosition={selectedPosition || defaultLocation}
                />
              </Box>

              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedPosition ? "Selected Location" : "Default Location"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPosition?.label || defaultLocation.label}<br />
                  Latitude: {(selectedPosition?.lat || defaultLocation.lat).toFixed(6)}<br />
                  Longitude: {(selectedPosition?.lng || defaultLocation.lng).toFixed(6)}<br />
                  Reviews: {filteredReviews.length}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Review Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <Star sx={{ mr: 1, color: 'gold' }} />
            Add Your Review
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Review Title"
            fullWidth
            value={newReview.title}
            onChange={(e) => setNewReview({...newReview, title: e.target.value})}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <Typography component="legend">Your Rating</Typography>
            <Rating
              value={newReview.rating}
              precision={1}
              onChange={(e, val) => setNewReview({...newReview, rating: val})}
            />
          </Box>
          <TextField
            margin="dense"
            label="Location Address"
            fullWidth
            value={newReview.address}
            onChange={(e) => setNewReview({...newReview, address: e.target.value})}
            helperText="Auto-filled from map"
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Add Photo (Optional)
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="review-image-upload"
              type="file"
              onChange={handleImageSelect}
            />
            <label htmlFor="review-image-upload">
              <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth>
                Upload Photo
              </Button>
            </label>
            {selectedImage && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                Selected: {selectedImage.name}
              </Typography>
            )}
          </Box>
          {imagePreview && (
            <Box sx={{ mb: 2, position: 'relative', display: 'inline-block' }}>
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} />
              <IconButton
                size="small"
                onClick={handleRemoveImage}
                sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
              >
                <Close />
              </IconButton>
            </Box>
          )}
          <TextField
            margin="dense"
            label="Your Review"
            fullWidth
            multiline
            rows={4}
            value={newReview.comment}
            onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} disabled={isSubmitting}>Cancel</Button>
          <Button 
            onClick={handleAddReview} 
            variant="contained"
            disabled={!newReview.title || !newReview.comment || newReview.rating === 0 || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
