// frontend/src/pages/Dashboard/Home.jsx (MODIFIED)
import React from 'react';

function Home() {
  return (
    <div>
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Welcome to the Main Dashboard!</h1> 
      <p className="text-lg text-gray-600">This is the landing area after successful authentication.</p>
      <p className="mt-4 text-sm text-indigo-500">Use the **<span className="font-bold">sidebar</span>** on the left to navigate to Workflows, Insights, or History.</p>
    </div>
  );
}
export default Home;