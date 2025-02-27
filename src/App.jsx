import React, { useState, useEffect } from "react";
import axios from "axios";

const uri = "https://reimagined-space-fishstick-4jwx6qv5jw44cj9pw-5001.app.github.dev/";

const checkPassword = async () => {
  const password = prompt("Please enter your password:");
  if (password) {
    try {
      const response = await axios.post(`${uri}/check-password`, { password });
      return response.data.isValid;
    } catch (error) {
      console.error("Error checking password:", error);
      alert("Error checking password.");
      return false;
    }
  }
  return false;
};

const validateInputs = (book) => {
  if (!book.title || !book.author || !book.image_url) {
    alert("Please fill in all fields.");
    return false;
  }
  return true;
};

const App = () => {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: "", author: "", image_url: "" });
  const [editBook, setEditBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${uri}/books`);
      setBooks(response.data.books);
    } catch (error) {
      console.error("Error fetching books:", error);
      setErrorMessage("Unable to fetch books.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (editBook) {
      setEditBook((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewBook((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateBook = async () => {
    if (!(await validateInputs(newBook))) return;
    if (!(await checkPassword())) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${uri}/books`, newBook);
      setBooks((prev) => [...prev, response.data]);
      setNewBook({ title: "", author: "", image_url: "" });
    } catch (error) {
      console.error("Error creating book:", error);
      setErrorMessage("Unable to create book.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditBook = (book) => {
    setEditBook({ ...book });
  };

  const handleUpdateBook = async () => {
    if (!(await validateInputs(editBook))) return;
    if (!(await checkPassword())) return;
    setLoading(true);
    try {
      await axios.put(`${uri}/books/${editBook._id}`, {
        title: editBook.title,
        author: editBook.author,
      });
      setBooks((prev) =>
        prev.map((book) => (book._id === editBook._id ? editBook : book))
      );
      setEditBook(null);
    } catch (error) {
      console.error("Error updating book:", error);
      setErrorMessage("Unable to update book.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!(await checkPassword())) return;
    setLoading(true);
    try {
      await axios.delete(`${uri}/books/${bookId}`);
      setBooks((prev) => prev.filter((book) => book._id !== bookId));
    } catch (error) {
      console.error("Error deleting book:", error);
      setErrorMessage("Unable to delete book.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Book List</h1>
      {loading && <p>Loading...</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Title</th>
            <th>Author</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book, i) => (
            <tr key={i + 1}>
              <td>{i + 1}</td>
              <td>
                <img src={book.image_url} alt={book.title} width="50" style={{ borderRadius: "5px" }} />
              </td>
              <td>
                {editBook && editBook._id === book._id ? (
                  <input type="text" name="title" value={editBook.title} onChange={handleInputChange} />
                ) : (
                  book.title
                )}
              </td>
              <td>
                {editBook && editBook._id === book._id ? (
                  <input type="text" name="author" value={editBook.author} onChange={handleInputChange} />
                ) : (
                  book.author
                )}
              </td>
              <td>
                {editBook && editBook._id === book._id ? (
                  <button onClick={handleUpdateBook} disabled={loading}>Update</button>
                ) : (
                  <button onClick={() => handleEditBook(book)} disabled={loading}>Edit</button>
                )}
                <button onClick={() => handleDeleteBook(book._id)} disabled={loading}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Add New Book</h2>
      <input type="text" name="title" placeholder="Title" value={newBook.title} onChange={handleInputChange} />
      <input type="text" name="author" placeholder="Author" value={newBook.author} onChange={handleInputChange} />
      <input type="text" name="image_url" placeholder="Image URL" value={newBook.image_url} onChange={handleInputChange} />
      <button onClick={handleCreateBook} disabled={loading}>Create</button>
    </div>
  );
};

export default App;