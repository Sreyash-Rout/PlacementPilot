import { useState } from 'react';
import axios from 'axios';

export default function PostExp() {
  const [form, setForm] = useState({
    username: '',
    company: '',
    role: '',
    experience: '',
    difficulty: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/experiences', form);
      alert('Experience Posted!');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="username" placeholder="Your Name" onChange={handleChange} required />
      <input name="company" placeholder="Company" onChange={handleChange} required />
      <input name="role" placeholder="Role" onChange={handleChange} required />
      <textarea name="experience" placeholder="Describe your experience" onChange={handleChange} required />
      <select name="difficulty" onChange={handleChange} required>
        <option value="">Select Difficulty</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>
      <button type="submit">Post Experience</button>
    </form>
  );
}
