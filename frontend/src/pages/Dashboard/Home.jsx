// frontend/src/pages/Dashboard/Home.jsx (REVERTED TO EXTERNAL CSS CLASSES)
import React from 'react';

// Import local component CSS
import '../home.css'; // <-- NEW IMPORT

function Home() {
  return (
    <div>
      <h1 className="home-title">Welcome to the Main Dashboard!</h1> 
      <p className="home-subtitle">This is the landing area after successful authentication.</p>
      <p className="home-instruction">Use the <span className="home-instruction-highlight">sidebar</span> on the left to navigate to Workflows, Insights, or History.</p>
    </div>
  );
}
export default Home;