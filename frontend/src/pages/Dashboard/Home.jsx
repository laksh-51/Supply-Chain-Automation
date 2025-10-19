// frontend/src/pages/Dashboard/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <h1>Welcome to the Supply Chain Dashboard!</h1>
      <p>This is your protected home page. Authentication successful.</p>
      <Link to="/">Logout</Link>
    </div>
  );
}
export default Home;