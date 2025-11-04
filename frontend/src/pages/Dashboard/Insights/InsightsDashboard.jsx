// frontend/src/pages/Dashboard/Insights/InsightsDashboard.jsx (WITH EXPLICIT LABELS)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlotlyChart from '../../../components/PlotlyChart.jsx';

// Import local component CSS
import '../../insights.css'; 

const API_BASE_URL = "http://localhost:8000/api/v1";

function InsightsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(''); 
  const [queryResults, setQueryResults] = useState(null); 
  const [queryLoading, setQueryLoading] = useState(false); 
  const [queryError, setQueryError] = useState(null); 

  useEffect(() => {
    const fetchInsights = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError("User not authenticated. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/insights`, {
          headers: {
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
  
  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    setQueryLoading(true);
    setQueryResults(null);
    setQueryError(null);
    const token = localStorage.getItem('accessToken');

    try {
        const response = await axios.post(`${API_BASE_URL}/query-data`, 
            { query: query }, 
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
          xaxis: { title: 'Metric' }, // ADDED X-AXIS TITLE
          yaxis: { range: [0, 100], title: 'Percentage (%)' },
      };
      return <PlotlyChart data={data_array} layout={layout} title="Delivery Performance (OTIF/OT/IF Rates)" />; // UPDATED TITLE
  };
  
  if (loading) return <div className="loading-state">Loading supply chain insights...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;
  if (!data) return <div className="info-state">No data available to display insights.</div>;

  const anomalyClass = data.anomaly.flagged ? 'anomaly-alert flagged' : 'anomaly-alert normal';

  return (
    <div className="insights-container">
      <h1>Supply Chain Insights Dashboard</h1>
      
      {/* Anomaly Text Summary */}
      <div className={anomalyClass}> 
        <h2>Latest Anomaly Report</h2>
        <p>
            {data.anomaly.message}
        </p>
      </div>

      {/* KPI Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          {renderDeliveryChart()}
        </div>
        
        {/* Placeholder for Product Chart */}
        <div className="chart-card">
            <PlotlyChart
                data={[{
                    x: data.kpis.product_performance.top_ordered_products.map(p => p.product_id),
                    y: data.kpis.product_performance.top_ordered_products.map(p => p.total_qty),
                    type: 'scatter',
                    mode: 'markers',
                    name: 'Quantity'
                }]}
                layout={{
                    xaxis: { title: 'Product ID' }, // ADDED X-AXIS TITLE
                    yaxis: { title: 'Total Quantity Ordered' }, // ADDED Y-AXIS TITLE
                }}
                title="Top Products (By Quantity Sold)" // UPDATED TITLE
            />
        </div>
        
        {/* Placeholder for Customer Chart */}
         <div className="chart-card">
            <PlotlyChart
                data={[{
                    x: data.kpis.customer_insights.top_ordering_customers.map(c => c.customer_id),
                    y: data.kpis.customer_insights.top_ordering_customers.map(c => c.order_count),
                    type: 'bar',
                    marker: { color: '#00BCD4' }
                }]}
                layout={{
                    xaxis: { title: 'Customer ID' }, // ADDED X-AXIS TITLE
                    yaxis: { title: 'Total Orders Placed' }, // ADDED Y-AXIS TITLE
                }}
                title="Top Ordering Customers (By Order Count)" // UPDATED TITLE
            />
        </div>
      </div>
      
{/* Natural Language Query Input Box */}
<div className="query-box-section">
    <h2>Data Science Query Box</h2>
    <p>Ask a question about your data in simple terms (e.g., "Show me top 5 products by quantity").</p>

    <form onSubmit={handleQuerySubmit} className="query-form">
        <input 
            type="text" 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            placeholder="Ask your supply chain question..."
            className="query-input"
            required
        />
        <button 
            type="submit" 
            disabled={queryLoading}
            className="query-button"
        >
            {queryLoading ? 'Thinking...' : 'Analyze'}
        </button>
    </form>

    {/* Query Results Display */}
    {queryError && <p className="query-error-message" style={{color: 'red', marginTop: '10px'}}>Error: {queryError}</p>}

    {queryResults && queryResults.results.length > 0 && (
        <div className="query-results-display">
            <h3>Results:</h3>
            <p className="query-text">Query: {queryResults.query}</p>
            
            {/* START: TABULAR RESULTS RENDER */}
            <table className="query-results-table">
                <thead>
                    <tr>
                        {/* Get headers from the keys of the first result object */}
                        {Object.keys(queryResults.results[0]).map((key) => (
                            <th key={key}>{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {queryResults.results.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {/* Get cell values for each row */}
                            {Object.values(row).map((value, colIndex) => (
                                <td key={colIndex}>{String(value)}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {/* END: TABULAR RESULTS RENDER */}
            
        </div>
    )}
    {queryResults && queryResults.results.length === 0 && (
        <p className="no-query-results" style={{marginTop: '10px'}}>No results found for your query.</p>
    )}
</div>
    </div>
  );
}

export default InsightsDashboard;