// frontend/src/pages/Dashboard/InsightsDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlotlyChart from '../../../components/PlotlyChart.jsx';
const API_BASE_URL = "http://localhost:8000/api/v1";

function InsightsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(''); // New state for input box
  const [queryResults, setQueryResults] = useState(null); // New state for results
  const [queryLoading, setQueryLoading] = useState(false); // New state for loading
  const [queryError, setQueryError] = useState(null); // New state for error

  useEffect(() => {
    const fetchInsights = async () => {
      // Get the authentication token from local storage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/insights`, {
          headers: {
            // Include the JWT token in the Authorization header
            Authorization: `Bearer ${token}`
          }
        });
        
        setData(response.data);
        setError(null);

      } catch (err) {
        const msg = err.response?.data?.detail || "Failed to fetch insights data.";
        setError(`Error: ${msg}`);
        console.error("Insights Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);
  
  // --- Rendering Functions for the Dashboard ---
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    setQueryLoading(true);
    setQueryResults(null);
    setQueryError(null);
    const token = localStorage.getItem('accessToken');

    try {
        const response = await axios.post(`${API_BASE_URL}/query-data`, 
            { query: query }, // Send the natural language text
            { headers: { Authorization: `Bearer ${token}` } }
        );

        setQueryResults(response.data);

    } catch (err) {
        const msg = err.response?.data?.detail || "Could not process natural language query.";
        setQueryError(msg);
    } finally {
        setQueryLoading(false);
    }
};
  const renderDeliveryChart = () => {
      const deliveryData = data.kpis.delivery_performance;
      const data_array = [
          {
              x: ['On-Time', 'In-Full', 'OTIF'],
              y: [
                  deliveryData.on_time_rate * 100,
                  deliveryData.in_full_rate * 100,
                  deliveryData.otif_rate * 100,
              ],
              type: 'bar',
              marker: {
                  color: ['#4CAF50', '#2196F3', '#FF9800']
              }
          }
      ];
      const layout = { 
          yaxis: { range: [0, 100], title: 'Percentage (%)' },
      };
      return <PlotlyChart data={data_array} layout={layout} title="Delivery Performance (%)" />;
  };
  
  if (loading) return <div className="loading-state">Loading supply chain insights...</div>;
  if (error) return <div className="error-state" style={{color: 'red'}}>Error: {error}</div>;
  if (!data) return <div className="info-state">No data available to display insights.</div>;

  return (
    <div className="insights-container" style={{ padding: '20px' }}>
      <h1>Supply Chain Insights Dashboard</h1>
      
      {/* Anomaly Text Summary (Will be powered by Gemini in Chunk 5) */}
      <div className="anomaly-alert" style={{ 
          padding: '15px', 
          backgroundColor: data.anomaly.flagged ? '#FFCDD2' : '#C8E6C9', 
          border: `1px solid ${data.anomaly.flagged ? 'red' : 'green'}`,
          marginBottom: '20px',
          borderRadius: '4px'
      }}>
        <h2>Latest Anomaly Report</h2>
        <p>
            {/* Display the anomaly message directly from the backend */}
            {data.anomaly.message}
        </p>
      </div>

      {/* KPI Charts Section */}
      <div className="charts-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ height: '400px', backgroundColor: '#fff', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {renderDeliveryChart()}
        </div>
        
        {/* Placeholder for Product Chart */}
        <div style={{ height: '400px', backgroundColor: '#fff', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <PlotlyChart
                data={[{
                    x: data.kpis.product_performance.top_ordered_products.map(p => p.product_id),
                    y: data.kpis.product_performance.top_ordered_products.map(p => p.total_qty),
                    type: 'scatter',
                    mode: 'markers',
                    name: 'Quantity'
                }]}
                title="Top Products (By Quantity)"
            />
        </div>
        
        {/* Placeholder for Customer Chart */}
         <div style={{ height: '400px', backgroundColor: '#fff', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <PlotlyChart
                data={[{
                    x: data.kpis.customer_insights.top_ordering_customers.map(c => c.customer_id),
                    y: data.kpis.customer_insights.top_ordering_customers.map(c => c.order_count),
                    type: 'bar',
                    marker: { color: '#00BCD4' }
                }]}
                title="Top Ordering Customers"
            />
        </div>
      </div>
      
      {/* NOTE: The Natural Language Query Input will go here in Chunk 5 */}
      // frontend/src/pages/Dashboard/InsightsDashboard.jsx (Inside the return statement, below charts-grid)

{/* Natural Language Query Input Box */}
<div style={{ marginTop: '40px', padding: '20px', borderTop: '1px solid #ccc' }}>
    <h2>Data Science Query Box (Powered by Gemini)</h2>
    <p>Ask a question about your data in simple terms (e.g., "Show me top 5 products by quantity").</p>

    <form onSubmit={handleQuerySubmit} style={{ display: 'flex', gap: '10px' }}>
        <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Ask your supply chain question..."
            style={{ flexGrow: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            required
        />
        <button 
            type="submit" 
            disabled={queryLoading}
            style={{ padding: '10px 15px', backgroundColor: '#FF9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
            {queryLoading ? 'Thinking...' : 'Analyze'}
        </button>
    </form>

    {/* Query Results Display */}
    {queryError && <p style={{ color: 'red', marginTop: '10px' }}>Error: {queryError}</p>}

    {queryResults && queryResults.results.length > 0 && (
        <div style={{ marginTop: '20px', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
            <h3>Results:</h3>
            <p style={{fontFamily: 'monospace', fontSize: '0.8em', color: '#555'}}>Query: {queryResults.query}</p>
            {/* Simple display for results - you can enhance this with a table later */}
            <pre style={{ overflowX: 'auto' }}>{JSON.stringify(queryResults.results, null, 2)}</pre>
        </div>
    )}
    {queryResults && queryResults.results.length === 0 && (
        <p style={{ marginTop: '10px' }}>No results found for your query.</p>
    )}
</div>
    </div>
  );
}

export default InsightsDashboard;