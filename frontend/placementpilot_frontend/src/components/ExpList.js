import { useEffect, useState } from 'react';
import axios from 'axios';
import './ExpList.css';
import Navbar from './Navbar';
import Footer from './Footer';

export default function ExpList() {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({
    username: '',
    company: '',
    role: '',
    experience: '',
    difficulty: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [replyForms, setReplyForms] = useState({});
  const [replyUsernameForms, setReplyUsernameForms] = useState({});

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const res = await axios.get('/api/experiences');
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch experiences:', err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/experiences', form);
      setReviews((prev) => [...prev, res.data]);
      setForm({ username: '', company: '', role: '', experience: '', difficulty: '' });
    } catch (err) {
      console.error('Failed to post experience:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await axios.delete(`/api/experiences/${id}`);
        setReviews(reviews.filter((review) => review._id !== id));
      } catch (err) {
        console.error('Failed to delete review:', err);
      }
    }
  };

  const handleReplyChange = (reviewId, e) => {
    setReplyForms({ ...replyForms, [reviewId]: e.target.value });
  };

  const handleReplyUsernameChange = (reviewId, e) => {
    setReplyUsernameForms({ ...replyUsernameForms, [reviewId]: e.target.value });
  };

  const handleAddReply = async (reviewId) => {
    try {
      const replyMessage = replyForms[reviewId];
      const replyUsername = replyUsernameForms[reviewId] || 'Anonymous';
      if (!replyMessage) return;

      const res = await axios.post(`/api/experiences/${reviewId}/replies`, {
        username: replyUsername,
        message: replyMessage,
      });

      setReviews(reviews.map((review) =>
        review._id === reviewId ? res.data : review
      ));
      setReplyForms({ ...replyForms, [reviewId]: '' });
      setReplyUsernameForms({ ...replyUsernameForms, [reviewId]: '' });
    } catch (err) {
      console.error('Failed to add reply:', err);
    }
  };

  const handleDeleteReply = async (reviewId, replyId) => {
    if (window.confirm('Are you sure you want to delete this reply?')) {
      try {
        await axios.delete(`/api/experiences/${reviewId}/replies/${replyId}`);
        setReviews(reviews.map((review) => {
          if (review._id === reviewId) {
            return {
              ...review,
              replies: review.replies.filter((reply) => reply._id !== replyId),
            };
          }
          return review;
        }));
      } catch (err) {
        console.error('Failed to delete reply:', err);
      }
    }
  };

  const highlightTags = (message) => {
    const escapedMessage = message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return escapedMessage.replace(/(@\w+)/g, '<span class="highlight-tag">$1</span>');
  };

  const filteredReviews = reviews.filter((review) =>
    review.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.username.toLowerCase().includes(searchTerm.toLowerCase())||
    review.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="backgroundcolor">
      <Navbar />
      <div className="exp-container">
        <h2>Post Your Interview Experience</h2>
        <form className="exp-form" onSubmit={handleSubmit}>
          <input name="username" placeholder="Your Name" value={form.username} onChange={handleChange} required />
          <input name="company" placeholder="Company" value={form.company} onChange={handleChange} required />
          <input name="role" placeholder="Role" value={form.role} onChange={handleChange} required />
          <textarea name="experience" placeholder="Describe your interview experience" value={form.experience} onChange={handleChange} required />
          <select name="difficulty" value={form.difficulty} onChange={handleChange} required>
            <option value="">Select Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <button type="submit" className="submit-btn">Post Experience</button>
        </form>

        <h2>All Experiences</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by company, role, username, or difficulty"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-btn">Search</button>
        </div>
        <br/>
        {filteredReviews.length === 0 ? (
          <p className="empty-msg">No experiences found.</p>
        ) : (
          <div className="review-list">
            {filteredReviews.map((review) => (
              <div key={review._id} className="review-card">
                <h3>{review.company} - {review.role}</h3>
                <p>{review.experience}</p>
                <small>Difficulty: {review.difficulty}</small><br />
                <small>By: {review.username}</small><br/>
                <br/>
                <button onClick={() => handleDelete(review._id)} className="delete-btn">Delete Review</button>

                <div className="reply-section">
                  <h4>Replies:</h4>
                  {review.replies && review.replies.map((reply) => (
                    <div key={reply._id} className="reply-card">
                      <p dangerouslySetInnerHTML={{ __html: highlightTags(reply.message) }}></p>
                      <small>By: {reply.username}</small><br/>
                      <br/>
                      <button onClick={() => handleDeleteReply(review._id, reply._id)} className="delete-btn">Delete Reply</button>
                    </div>
                  ))}
                  <br/>
                  <input type="text" placeholder="Your Name" value={replyUsernameForms[review._id] || ''} onChange={(e) => handleReplyUsernameChange(review._id, e)} className="reply-input" />
                  <input type="text" placeholder="Write a reply..." value={replyForms[review._id] || ''} onChange={(e) => handleReplyChange(review._id, e)} className="reply-input" /><br/>
                  <br/>
                  <button onClick={() => handleAddReply(review._id)} className="submit-btn">Add Reply</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
