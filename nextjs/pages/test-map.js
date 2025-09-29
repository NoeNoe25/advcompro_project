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
  // State for reviews and modal
  const [reviews, setReviews] = useState([]);
  const [allReviews, setAllReviews] = useState([]); // All reviews from database
  const [filteredReviews, setFilteredReviews] = useState([]); // Reviews filtered by location
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

  // Filter reviews when selected position changes
  useEffect(() => {
    if (selectedPosition) {
      filterReviewsByLocation(selectedPosition.lat, selectedPosition.lng);
    } else {
      setFilteredReviews(allReviews);
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
      setFilteredReviews(reviewsData);
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
      // First, try to get reviews for the exact location
      const response = await fetch(
        `http://localhost:8000/api/reviews?latitude=${lat}&longitude=${lng}`
      );
      
      if (response.ok) {
        const locationReviews = await response.json();
        setFilteredReviews(locationReviews);
      } else {
        // If no exact location match, show nearby reviews (within 0.01 degree radius)
        const nearbyReviews = allReviews.filter(review => {
          const distance = calculateDistance(
            lat, lng, 
            review.latitude, review.longitude
          );
          return distance < 1; // Within 1km radius
        });
        setFilteredReviews(nearbyReviews);
      }
    } catch (error) {
      console.error("Error filtering reviews by location:", error);
      // Fallback to client-side filtering
      const nearbyReviews = allReviews.filter(review => {
        const distance = calculateDistance(
          lat, lng, 
          review.latitude, review.longitude
        );
        return distance < 1; // Within 1km radius
      });
      setFilteredReviews(nearbyReviews);
    }
  };

  // Calculate distance between two coordinates in kilometers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Add validation for coordinates
    if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
      return 0;
    }
    
    // Convert to numbers and validate
    const numLat1 = parseFloat(lat1);
    const numLon1 = parseFloat(lon1);
    const numLat2 = parseFloat(lat2);
    const numLon2 = parseFloat(lon2);
    
    if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) {
      return 0;
    }

    const R = 6371; // Earth's radius in km
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
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, WEBP, GIF)');
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
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

    if (!selectedPosition) {
      alert("Please select a location on the map first.");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("title", newReview.title);
      submitData.append("comment", newReview.comment);
      submitData.append("rating", String(newReview.rating));
      submitData.append("latitude", String(selectedPosition.lat));
      submitData.append("longitude", String(selectedPosition.lng));
      submitData.append("address", newReview.address || selectedPosition.label || "Selected Location");
      submitData.append("user_id", "1");

      // Append image if selected
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

      const savedReview = await response.json();

      // Refresh reviews after adding new one
      await fetchAllReviews();
      
      // Reset form
      setNewReview({
        title: "",
        comment: "",
        rating: 1,
        address: "",
      });
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

  // Handle modal close
  const handleCloseModal = () => {
    if (!isSubmitting) {
      setOpenModal(false);
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Update address when position changes
  const handleSelectPosition = (position) => {
    setSelectedPosition(position);
    setNewReview(prev => ({
      ...prev,
      address: position.label || "Selected Location"
    }));
  };

  // Format date from database
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get user avatar initial
  const getAvatarInitial = (userName) => {
    return userName ? userName.charAt(0).toUpperCase() : "U";
  };

  // Get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:8000/${imagePath}`;
  };

  // Pagination logic
  const reviewsPerPage = 5;
  const startIndex = (page - 1) * reviewsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, startIndex + reviewsPerPage);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        Place Reviews & Location
      </Typography>

      <Grid container spacing={3}>
        {/* Reviews Section - Left Side */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h2">
                  Customer Reviews
                  {selectedPosition && (
                    <Typography variant="body2" color="text.secondary">
                      {filteredReviews.length} review(s) for this location
                    </Typography>
                  )}
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => setOpenModal(true)}
                >
                  Add Review
                </Button>
              </Box>

              {/* Location Selection Alert */}
              {!selectedPosition && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  👉 Click or search a location on the map to see reviews for that area!
                </Alert>
              )}

              {/* Loading State */}
              {isLoading && (
                <Box display="flex" justifyContent="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </Box>
              )}

              {/* Reviews List */}
              {!isLoading && paginatedReviews.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                  {selectedPosition 
                    ? "No reviews yet for this location. Be the first to add one!" 
                    : "No reviews yet. Select a location on the map or add a review!"}
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
                    
                    <Rating 
                      value={review.rating} 
                      precision={0.5} 
                      readOnly 
                      sx={{ mb: 1 }} 
                    />
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {review.comment}
                    </Typography>

                    {/* Display review image if exists */}
                    {review.image_path && (
                      <Box sx={{ mb: 2 }}>
                        <img 
                          src={getImageUrl(review.image_path)} 
                          alt="Review" 
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: 200, 
                            borderRadius: 8,
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </Box>
                    )}

                    {review.address && (
                      <Chip 
                        icon={<LocationOn />}
                        label={review.address}
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    )}

                    {/* Show distance if location is selected */}
                    {selectedPosition && review.latitude !== undefined && review.longitude !== undefined && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Distance: {calculateDistance(
                          selectedPosition.lat, 
                          selectedPosition.lng, 
                          review.latitude, 
                          review.longitude
                        ).toFixed(2)} km away
                      </Typography>
                    )}
                  </Card>
                ))
              )}

              {/* Pagination */}
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

        {/* Map Section - Right Side */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 0, height: '100%' }}>
              {/* Map Header */}
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  <LocationOn sx={{ mr: 1, verticalAlign: 'bottom' }} />
                  Interactive Map
                </Typography>
                <Chip 
                  icon={<Map />} 
                  label={selectedPosition ? "Location Selected" : "Click to Select Location"} 
                  variant={selectedPosition ? "filled" : "outlined"}
                  color={selectedPosition ? "success" : "primary"}
                />
                {selectedPosition && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Showing {filteredReviews.length} review(s) for this area
                  </Typography>
                )}
              </Box>

              {/* Map Component */}
              <Box sx={{ height: 400 }}>
                <MapComponent
                  reviews={allReviews} // Pass all reviews to show all markers
                  onSelectPosition={handleSelectPosition}
                  selectedPosition={selectedPosition}
                />
              </Box>

              {/* Selected Location Info */}
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {selectedPosition ? "Selected Location" : "Business Information"}
                </Typography>
                {selectedPosition ? (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {selectedPosition.label || "Custom Location"}<br />
                    Latitude: {selectedPosition.lat?.toFixed(6)}<br />
                    Longitude: {selectedPosition.lng?.toFixed(6)}<br />
                    Reviews: {filteredReviews.length}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    123 Main Street, Downtown<br />
                    City, State 12345<br />
                    Phone: (555) 123-4567
                  </Typography>
                )}
                {/* <Button variant="outlined" fullWidth>
                  Get Directions
                </Button> */}
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
          {!selectedPosition && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Please select a location on the map before submitting your review.
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="Review Title"
            fullWidth
            variant="outlined"
            value={newReview.title}
            onChange={(e) => setNewReview({...newReview, title: e.target.value})}
            sx={{ mb: 2 }}
            required
          />

          <Box sx={{ mb: 2 }}>
            <Typography component="legend">Your Rating</Typography>
            <Rating
              value={newReview.rating}
              precision={1}
              onChange={(event, newValue) => {
                setNewReview({...newReview, rating: newValue});
              }}
            />
          </Box>

          <TextField
            margin="dense"
            label="Location Address"
            fullWidth
            variant="outlined"
            value={newReview.address}
            onChange={(e) => setNewReview({...newReview, address: e.target.value})}
            sx={{ mb: 2 }}
            helperText="Address will be auto-filled when you click on the map"
          />

          {/* Image Upload Section */}
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
              <Button 
                variant="outlined" 
                component="span" 
                startIcon={<CloudUpload />}
                fullWidth
              >
                Upload Photo
              </Button>
            </label>
            {selectedImage && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                Selected: {selectedImage.name}
              </Typography>
            )}
          </Box>

          {/* Image Preview */}
          {imagePreview && (
            <Box sx={{ mb: 2, position: 'relative', display: 'inline-block' }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: 200, 
                  borderRadius: 8,
                  objectFit: 'cover'
                }}
              />
              <IconButton
                size="small"
                onClick={handleRemoveImage}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>
          )}

          <TextField
            margin="dense"
            label="Your Review"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newReview.comment}
            onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
            required
          />

          {selectedPosition && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Reviewing: {selectedPosition.label || `Location (${selectedPosition.lat.toFixed(4)}, ${selectedPosition.lng.toFixed(4)})`}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseModal} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddReview} 
            variant="contained"
            disabled={!newReview.title || !newReview.comment || newReview.rating === 0 || !selectedPosition || isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}