import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Chip
} from "@mui/material";
import Swal from 'sweetalert2';
import { useState, useEffect } from "react";

export default function Page2() {
  const [books, setBooks] = useState([]);  // ✅ moved inside component

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:8000/books/');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        console.error('Error fetching books:', err);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch books from API',
          icon: 'error'
        });
      }
    };

    fetchBooks();
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>
        Library — Books Catalog
      </Typography>

      <Paper elevation={1}>
        <Table aria-label="books-table">
          <TableHead>
            <TableRow>
              <TableCell>Book ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>ISBN</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Available</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {books.map((book) => (
              <TableRow key={book.book_id} hover>
                <TableCell>{book.book_id}</TableCell>
                <TableCell>
                  <Typography variant="body1">
                    {book.title}
                  </Typography>
                </TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>
                  <Typography variant="caption">
                    {book.isbn}
                  </Typography>
                </TableCell>
                <TableCell>{book.published_year}</TableCell>
                <TableCell>
                  <Chip
                    label={book.available ? "Available" : "Checked Out"}
                    color={book.available ? "success" : "default"}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {books.length === 0 && (
        <Typography sx={{ mt: 2, textAlign: 'center' }}>
          No books found in the database.
        </Typography>
      )}
    </Container>
  );
}
