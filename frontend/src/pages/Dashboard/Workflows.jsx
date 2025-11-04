// frontend/src/pages/Dashboard/Workflows.jsx (REVERTED TO EXTERNAL CSS CLASSES)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Zap, Database, Clock } from 'lucide-react';
// Import local component CSS
import '../../pages/workflows.css'; // <-- CHECK: Must exist at src/pages/workflows.css

const API_BASE_URL = "http://localhost:8000/api/v1";
// --- WorkflowItem Component ---
const WorkflowItem = ({ workflow, onEdit, onDelete, onTrigger }) => {
    const formatTimestamp = (ts) => ts ? new Date(ts).toLocaleString() : 'Never Run';
    const lastRunText = `${formatTimestamp(workflow.last_run_timestamp)} (${workflow.last_run_status || 'NEW'})`;
    
    // The hover state logic is now handled solely by CSS using :hover pseudo-class 
    
    return (
        <div className="workflow-item">
            <div className="workflow-info">
                <h3 className="workflow-name">{workflow.name}</h3>
                <p className="workflow-interval">
                    <Clock style={{ width: '16px', height: '16px', marginRight: '8px' }} /> 
                    Interval: {workflow.recheck_interval_minutes} Minutes
                </p>
                <p className="workflow-last-run">
                    Last Run: {lastRunText}
                </p>
            </div>
            
            <div className="workflow-actions">
                <button 
                    onClick={() => onEdit(workflow)} 
                    className="action-button" 
                    title="View Insights/Data"
                >
                    <Database size={20} />
                </button>
                <button 
                    onClick={() => onTrigger(workflow.id)} 
                    className="action-button trigger" 
                    title="Run Now"
                >
                    <Zap size={20} />
                </button>
                <button 
                    onClick={() => onDelete(workflow.id)} 
                    className="action-button delete" 
                    title="Delete"
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </div>
    );
};

// --- Main Workflows Component ---
function Workflows() {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [rawDump, setRawDump] = useState(null); 
    
    const [formState, setFormState] = useState({ 
        name: '', 
        trigger_subject: 'Daily Sales Report', 
        trigger_sender: '',
        recheck_interval_value: 5,
        recheck_interval_unit: 'min' 
    });
    
    const navigate = useNavigate();
    
    useEffect(() => {
        fetchWorkflows();
    }, []);

    const fetchWorkflows = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) { setError('Not logged in.'); setLoading(false); return; }
        try {
            const response = await axios.get(`${API_BASE_URL}/workflows`, { headers: { Authorization: `Bearer ${token}` } });
            setWorkflows(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load workflows. Please ensure the backend is running.');
            setLoading(false);
        }
    };
    
    const handleFormChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        if (!token) { alert('Save failed: Token missing.'); return; }
        
        const minutes = formState.recheck_interval_unit === 'hr' ? formState.recheck_interval_value * 60 : formState.recheck_interval_value;
            
        const payload = {
            name: formState.name,
            trigger_subject: formState.trigger_subject,
            trigger_sender: formState.trigger_sender,
            recheck_interval_minutes: minutes,
        };

        try {
            await axios.post(`${API_BASE_URL}/workflows`, payload, { headers: { Authorization: `Bearer ${token}` } });
            fetchWorkflows(); 
            setIsFormOpen(false); 
            setFormState({ name: '', trigger_subject: 'Daily Sales Report', trigger_sender: '', recheck_interval_value: 5, recheck_interval_unit: 'min' });
        } catch (err) {
            let errorMessage = err.response?.data?.detail || 'Server error occurred.';
            if (Array.isArray(errorMessage)) { errorMessage = JSON.stringify(errorMessage); }
            alert('Failed to save workflow: ' + errorMessage);
        }
    };

    const handleTrigger = async (workflowId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) { alert('Trigger failed: Token missing.'); return; }
        try {
            const response = await axios.post(`${API_BASE_URL}/trigger-workflow/${workflowId}`, null, { headers: { Authorization: `Bearer ${token}` } });
            alert(`Trigger successful: ${response.data.message}`);
            fetchWorkflows(); 
        } catch (err) {
            let errorMessage = err.response?.data?.detail || 'Server error occurred.';
            if (Array.isArray(errorMessage)) { errorMessage = JSON.stringify(errorMessage); }
            alert(`Trigger failed: ${errorMessage}`);
        }
    };
    
    const handleViewData = async (workflowId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return; 
        try {
            const response = await axios.get(`${API_BASE_URL}/data/raw/${workflowId}`, { headers: { Authorization: `Bearer ${token}` } });
            setRawDump(response.data);
        } catch (err) {
            alert('Failed to fetch raw data: ' + (err.response?.data?.detail || 'Server error'));
        }
    };
    
    const handleEdit = (workflow) => {
        navigate(`/insights?workflowId=${workflow.id}`);
    };
    
    const handleDelete = async (workflowId) => {
        if (!window.confirm('Are you sure you want to delete this workflow?')) return;
        const token = localStorage.getItem('accessToken');
        if (!token) { alert('Delete failed: Token missing.'); return; }
        try {
            await axios.delete(`${API_BASE_URL}/workflows/${workflowId}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchWorkflows(); 
        } catch (err) {
            alert('Failed to delete workflow.');
        }
    };

    if (loading) return <div style={{ textAlign: 'center', color: 'var(--color-accent-light)', marginTop: '40px' }}>Loading workflows...</div>;

    return (
        <div className="workflows-page"> 
            <div className="workflows-header">
                <h1 className="workflows-title">My Workflows ({workflows.length})</h1>
                <button 
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="create-workflow-button"
                >
                    <Plus size={20} style={{ marginRight: '8px' }} />
                    Create New Workflow
                </button>
            </div>

            {isFormOpen && (
                <div className="workflow-form-container">
                    <h2>Workflow Configuration</h2>
                    <form onSubmit={handleFormSubmit} className="workflow-form">
                        
                        <input type="text" name="name" placeholder="Workflow Name" value={formState.name} onChange={handleFormChange} required className="form-input" />
                        <input type="text" name="trigger_subject" placeholder="Email Subject Filter" value={formState.trigger_subject} onChange={handleFormChange} required className="form-input" />
                        <input type="email" name="trigger_sender" placeholder="Email Sender Filter (Optional)" value={formState.trigger_sender} onChange={handleFormChange} className="form-input" />
                        
                        {/* Interval Input Box */}
                        <div className="interval-group">
                            <label className="interval-label">Monitor Check Interval:</label>
                            <input
                                type="number"
                                name="recheck_interval_value"
                                min={1}
                                max={formState.recheck_interval_unit === 'hr' ? 24 : 59}
                                value={formState.recheck_interval_value}
                                onChange={e => {
                                    const value = Math.max(1, Math.min(e.target.max, Number(e.target.value)));
                                    setFormState({ ...formState, recheck_interval_value: value });
                                }}
                                required
                                className="form-input interval-value-input"
                            />
                            <select
                                name="recheck_interval_unit"
                                value={formState.recheck_interval_unit}
                                onChange={handleFormChange}
                                className="form-input interval-unit-select"
                            >
                                <option value="min">Minutes</option>
                                <option value="hr">Hours</option>
                            </select>
                        </div>

                        <button type="submit" className="save-workflow-button">
                            Save Workflow
                        </button>
                    </form>
                </div>
            )}

            <div className="workflows-list">
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {workflows.map(wf => (
                    <WorkflowItem 
                        key={wf.id} 
                        workflow={wf} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete}
                        onTrigger={handleTrigger}
                    />
                ))}
                {workflows.length === 0 && !error && (
                    <p className="no-workflows-message">
                        No workflows created yet. Start automating your supply chain!
                    </p>
                )}
            </div>
            
            {/* View Data Button */}
            <div className="raw-data-area">
                <button
                    onClick={() => handleViewData(workflows[0]?.id)} 
                    disabled={workflows.length === 0}
                    className="raw-data-button"
                >
                    <Database size={20} style={{ marginRight: '8px' }} />
                    View Raw Data Dump (Latest Workflow)
                </button>
            </div>

            {/* Raw Data Table Display */}
            {rawDump && (
                <div className="raw-data-dump">
                    <h2 className="raw-data-dump-title">Complete Data Dump</h2>
                    <button onClick={() => setRawDump(null)} className="raw-data-close-button">
                        Close
                    </button>
                    
                    {/* Table styling */}
                    <table className="raw-data-table">
                        <thead>
                            <tr>
                                {Object.keys(rawDump[0] || {}).map(key => <th key={key}>{key}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {rawDump.map((row, index) => (
                                <tr key={index}>
                                    {Object.values(row).map((value, idx) => <td key={idx}>{String(value)}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Workflows;