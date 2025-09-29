import { useState } from "react";
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
} from "@mui/material";
import { LocationOn, Add, Map } from "@mui/icons-material";

export default function ReviewsAndMapPage() {
  // State for reviews and modal
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "John Doe",
      date: "March 15, 2023",
      rating: 5,
      text: "Excellent service and high-quality products. The staff was very helpful and knowledgeable. I will definitely be coming back for future purchases.",
      avatar: "JD"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      date: "February 28, 2023",
      rating: 4,
      text: "Good overall experience. The location is convenient and the prices are reasonable. The only downside was the wait time during peak hours.",
      avatar: "SJ"
    },
    {
      id: 3,
      name: "Michael Roberts", 
      date: "January 10, 2023",
      rating: 4.5,
      text: "I've been a customer for years and they never disappoint. Consistent quality and friendly service. Highly recommended for anyone looking for reliable products.",
      avatar: "MR"
    }
  ]);

  const [openModal, setOpenModal] = useState(false);
  const [newReview, setNewReview] = useState({
    name: "",
    rating: 0,
    text: ""
  });
  const [page, setPage] = useState(1);

  // Handle adding new review
  const handleAddReview = () => {
    const review = {
      id: reviews.length + 1,
      name: newReview.name || "Anonymous",
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      rating: newReview.rating,
      text: newReview.text,
      avatar: newReview.name ? newReview.name.charAt(0) : "A"
    };
    
    setReviews([review, ...reviews]);
    setNewReview({ name: "", rating: 0, text: "" });
    setOpenModal(false);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
        Customer Reviews & Location
      </Typography>

      <Grid container spacing={3}>
        {/* Reviews Section - Left Side */}
        <Grid item xs={12} md={6}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" component="h2">
                  Customer Reviews
                </Typography>
                <Button 
                  variant="contained" 
                  startIcon={<Add />}
                  onClick={() => setOpenModal(true)}
                >
                  Add Review
                </Button>
              </Box>

              {/* Reviews List */}
              {reviews.map((review) => (
                <Card key={review.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                      {review.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {review.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {review.date}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Rating value={review.rating} precision={0.5} readOnly sx={{ mb: 1 }} />
                  
                  <Typography variant="body2" color="text.secondary">
                    {review.text}
                  </Typography>
                </Card>
              ))}

              {/* Pagination */}
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination 
                  count={3} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
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
                  Our Location
                </Typography>
                <Chip 
                  icon={<Map />} 
                  label="Interactive Map" 
                  variant="outlined" 
                  color="primary" 
                />
              </Box>

              {/* Map Placeholder */}
              <Box 
                sx={{ 
                  height: 400,
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main'
                }}
              >
                <Map sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Interactive Map
                </Typography>
                <Typography variant="body2" align="center" sx={{ maxWidth: 300 }}>
                  In a real implementation, this would display a Google Map or similar service
                </Typography>
              </Box>

              {/* Location Info */}
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Business Information
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  123 Main Street, Downtown<br />
                  City, State 12345<br />
                  Phone: (555) 123-4567
                </Typography>
                <Button variant="outlined" fullWidth>
                  Get Directions
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Review Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Your Review</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your Name (Optional)"
            fullWidth
            variant="outlined"
            value={newReview.name}
            onChange={(e) => setNewReview({...newReview, name: e.target.value})}
            sx={{ mb: 2 }}
          />
          <Box sx={{ mb: 2 }}>
            <Typography component="legend">Your Rating</Typography>
            <Rating
              value={newReview.rating}
              precision={0.5}
              onChange={(event, newValue) => {
                setNewReview({...newReview, rating: newValue});
              }}
            />
          </Box>
          <TextField
            margin="dense"
            label="Your Review"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={newReview.text}
            onChange={(e) => setNewReview({...newReview, text: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button 
            onClick={handleAddReview} 
            variant="contained"
            disabled={!newReview.text || newReview.rating === 0}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}