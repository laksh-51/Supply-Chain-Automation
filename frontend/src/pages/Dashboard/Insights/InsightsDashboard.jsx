// frontend/src/pages/Dashboard/Insights/InsightsDashboard.jsx (OVERHAUL)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlotlyChart from '../../../components/PlotlyChart.jsx';
import { useLocation } from 'react-router-dom'; 

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
  
  // NEW STATE: List of all user workflows
  const [workflows, setWorkflows] = useState([]);
  
  // Get initial ID from URL (from Workflows page button), default to 'all'
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialWorkflowId = searchParams.get('workflowId') || 'all'; 
  
  // NEW STATE: Stores the active filter (either 'all' or a specific ID)
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(initialWorkflowId);
  
  // Use selected state for dynamic title
  const selectedWorkflow = workflows.find(w => w.id === Number(selectedWorkflowId));
  const insightsTitle = selectedWorkflowId !== 'all' 
    ? `Insights for Workflow: ${selectedWorkflow?.name || 'Loading...'} (ID: ${selectedWorkflowId})` 
    : 'Aggregated Supply Chain Insights (All Workflows)';

  // --- 1. Fetch Workflows List and Insights Data ---
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        setError("User not authenticated. Please log in.");
        setLoading(false);
        return;
    }

    // Function to fetch the list of workflows
    const fetchWorkflowsList = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/workflows`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkflows(response.data);
        } catch (err) {
            console.error("Failed to fetch workflow list:", err);
            // Non-critical error, continue loading insights
        }
    };
    
    // Function to fetch KPI data based on the current selection
    const fetchInsights = async () => {
        setLoading(true);
        setData(null);

        try {
            const params = {};
            // Only add workflow_id if it's not 'all'
            if (selectedWorkflowId !== 'all') {
                params.workflow_id = selectedWorkflowId;
            }

            const response = await axios.get(`${API_BASE_URL}/insights`, {
                headers: { Authorization: `Bearer ${token}` },
                params: params 
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

    fetchWorkflowsList();
    fetchInsights();
    
    // Rerun fetchInsights when the selected filter changes
  }, [selectedWorkflowId]); 
  
  // --- 2. Query Handling (Remains the same for now) ---
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
          xaxis: { title: 'Metric' }, 
          yaxis: { range: [0, 100], title: 'Percentage (%)' },
      };
      return <PlotlyChart data={data_array} layout={layout} title="Delivery Performance (OTIF/OT/IF Rates)" />; 
  };
  
  // --- 3. Render Logic ---
  // Updated loading checks to handle two async operations
  if (loading && workflows.length === 0) return <div className="loading-state">Loading supply chain insights and workflows...</div>;
  if (error) return <div className="error-state">Error: {error}</div>;
  if (!data && !loading) return <div className="info-state">No data available to display insights for this selection.</div>;
  if (data === null) return <div className="loading-state">Loading insights data...</div>;

  const anomalyClass = data.anomaly.flagged ? 'anomaly-alert flagged' : 'anomaly-alert normal';

  return (
    <div className="insights-container">
      
      {/* --- NEW FILTER BAR --- */}
      <div className="insights-filter-bar">
        <h1>{insightsTitle}</h1>
        
        <div className="filter-control-group">
            <label htmlFor="workflow-select">Filter by Workflow:</label>
            <select
                id="workflow-select"
                value={selectedWorkflowId}
                onChange={(e) => setSelectedWorkflowId(e.target.value)}
                className="workflow-select"
                disabled={workflows.length === 0}
            >
                <option value="all">All Workflows (Aggregated)</option>
                {workflows.map(wf => (
                    <option key={wf.id} value={wf.id}>
                        {wf.name} (ID: {wf.id})
                    </option>
                ))}
            </select>
        </div>
      </div>
      {/* --- END NEW FILTER BAR --- */}
      
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
                    xaxis: { title: 'Product ID' }, 
                    yaxis: { title: 'Total Quantity Ordered' }, 
                }}
                title="Top Products (By Quantity Sold)" 
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
                    xaxis: { title: 'Customer ID' }, 
                    yaxis: { title: 'Total Orders Placed' }, 
                }}
                title="Top Ordering Customers (By Order Count)" 
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