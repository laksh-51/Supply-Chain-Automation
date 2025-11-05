// frontend/src/pages/Dashboard/WorkflowDataView.jsx (NEW FILE - Per-Workflow Database View)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { Database, ArrowLeft } from 'lucide-react'; 

// Assuming you have workflows.css imported correctly elsewhere, or you can create a dedicated data-view.css

const API_BASE_URL = "http://localhost:8000/api/v1";

function WorkflowDataView() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const workflowId = queryParams.get('workflowId');
    
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const token = localStorage.getItem('accessToken');
    
    useEffect(() => {
        if (!workflowId || !token) {
            setError('Missing Workflow ID or authentication token.');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                // Fetch data for a single workflow using the endpoint we previously debugged
                const response = await axios.get(`${API_BASE_URL}/data/raw/${workflowId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(response.data);
            } catch (err) {
                setError('Failed to fetch data. Ensure workflow exists and data has been ingested.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [workflowId, token]);
    
    const headers = data && data.length > 0 ? Object.keys(data[0]) : [];
    const formatHeader = (key) => key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');


    if (loading) return <div className="loading-state">Loading Workflow Data...</div>;
    if (error) return <div className="error-state" style={{color: 'red', marginTop: '20px'}}>Error: {error}</div>;

    return (
        <div className="data-view-container" style={{ padding: '32px', color: 'var(--color-text-primary)' }}>
            <button 
                onClick={() => navigate('/workflows')} 
                style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: 'var(--color-accent-light)', cursor: 'pointer' }}
                className="back-button"
            >
                <ArrowLeft size={20} style={{ marginRight: '8px' }} /> Back to Workflows
            </button>
            
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <Database size={30} style={{ marginRight: '10px', color: 'var(--color-accent-strong)' }} />
                Raw Data for Workflow ID: {workflowId}
            </h1>
            
            {data && data.length > 0 ? (
                 <div style={{ maxHeight: '70vh', overflowY: 'auto', backgroundColor: 'var(--color-bg-mid)', borderRadius: '8px', padding: '10px' }}>
                    <table className="raw-data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ backgroundColor: 'var(--color-card-bg)', position: 'sticky', top: 0 }}>
                            <tr>
                                {headers.map(key => <th key={key} style={{ padding: '12px', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', borderBottom: '1px solid var(--color-bg-deep)' }}>{formatHeader(key)}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid var(--color-card-bg)' }}>
                                    {headers.map((key, idx) => <td key={idx} style={{ padding: '12px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>{String(row[key])}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p style={{ color: 'var(--color-text-muted)', marginTop: '20px' }}>No records found for this workflow.</p>
            )}
        </div>
    );
}

export default WorkflowDataView;