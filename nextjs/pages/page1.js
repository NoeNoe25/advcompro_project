import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Stack,
  Grid
} from "@mui/material";
import Swal from 'sweetalert2';

export default function Page1() {
  // State for all form fields
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    publishedYear: ""
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  // Replace your existing handleSubmit with this new version
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/books/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          isbn: formData.isbn,
          published_year: parseInt(formData.publishedYear)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Use SweetAlert2 for success messages (much cleaner than Alert components)
      Swal.fire({
        title: 'Book Added Successfully!',
        icon: 'success'
      });
      
      // Clear form after successful submission
      setFormData({
        title: "",
        author: "",
        isbn: "",
        publishedYear: ""
      });

    } catch (err) {
      console.error('Error submitting form:', err);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add book.',
        icon: 'error'
      });
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Library — Add New Book
      </Typography>

      {/* Form for adding new book */}
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            {/* Book Title */}
            <Grid item xs={12} md={8}>
              <TextField
                label="Book Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g., Clean Code"
              />
            </Grid>

            {/* Author */}
            <Grid item xs={12} md={4}>
              <TextField
                label="Author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g., Robert C. Martin"
              />
            </Grid>

            {/* ISBN */}
            <Grid item xs={12} md={6}>
              <TextField
                label="ISBN"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g., 9780132350884"
              />
            </Grid>

            {/* Published Year */}
            <Grid item xs={12} md={6}>
              <TextField
                label="Published Year"
                name="publishedYear"
                type="number"
                value={formData.publishedYear}
                onChange={handleChange}
                required
                fullWidth
                placeholder="e.g., 2008"
                inputProps={{ min: 1800, max: new Date().getFullYear() }}
              />
            </Grid>
          </Grid>

          {/* Submit Button */}
          <Button type="submit" variant="contained" color="primary">
            Add Book
          </Button>
        </Stack>
      </form>
    </Container>
  );
}