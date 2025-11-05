// frontend/src/pages/Dashboard/Workflows.jsx (FINAL STABLE VERSION - All Features)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Zap, Settings, Clock, Database, BarChart3, List } from 'lucide-react'; 
import '../../pages/workflows.css'; 

const API_BASE_URL = "http://localhost:8000/api/v1";

// --- WorkflowItem Component ---
const WorkflowItem = ({ workflow, onEdit, onDelete, onTrigger, onViewData, onInsights }) => {
    const formatTimestamp = (ts) => ts ? new Date(ts).toLocaleString() : 'Never Run';
    const lastRunText = `${formatTimestamp(workflow.last_run_timestamp)} (${workflow.last_run_status || 'NEW'})`;
    
    return (
        <div className="workflow-item">
            <div className="workflow-info">
                <h3 className="workflow-name">{workflow.name}</h3>
                
                <p className="workflow-filter-detail">
                    Filter: Subject='{workflow.trigger_subject}' | Sender='{workflow.trigger_sender || 'Any'}'
                </p>
                
                <p className="workflow-interval">
                    <Clock size={16} style={{ marginRight: '8px' }} /> 
                    Monitor Interval: {workflow.recheck_interval_minutes} Minutes
                </p>
                <p className="workflow-last-run">
                    Last Run: {lastRunText}
                </p>
            </div>
            
            <div className="workflow-actions">
                <button 
                    onClick={() => onEdit(workflow)} 
                    className="action-button" 
                    title="Edit Workflow Settings"
                >
                    <Settings size={20} />
                </button>
                
                <button 
                    onClick={() => onInsights(workflow.id)} 
                    className="action-button" 
                    title="Workflow Insights"
                >
                    <BarChart3 size={20} />
                </button>
                
                <button 
                    onClick={() => onViewData(workflow.id, workflow.name)} 
                    className="action-button" 
                    title="View Raw Data (Database)"
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
    const [rawDumpTitle, setRawDumpTitle] = useState(null); 
    
    const [editingWorkflow, setEditingWorkflow] = useState(null);
    
    const defaultFormState = { 
        name: '', 
        trigger_subject: 'Daily Sales Report', 
        trigger_sender: '',
        recheck_interval_value: 5,
        recheck_interval_unit: 'min' 
    };
    const [formState, setFormState] = useState(defaultFormState);
    
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
        
        const minutes = formState.recheck_interval_unit === 'hr' 
            ? Number(formState.recheck_interval_value) * 60 
            : Number(formState.recheck_interval_value);
            
        const payload = {
            name: formState.name,
            trigger_subject: formState.trigger_subject,
            trigger_sender: formState.trigger_sender,
            recheck_interval_minutes: minutes,
        };
        
        if (payload.trigger_sender === "") {
            payload.trigger_sender = null;
        }

        try {
            if (editingWorkflow) {
                await axios.patch(`${API_BASE_URL}/workflows/${editingWorkflow.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                alert(`Workflow '${formState.name}' updated successfully!`);
            } else {
                await axios.post(`${API_BASE_URL}/workflows`, payload, { headers: { Authorization: `Bearer ${token}` } });
                alert(`Workflow '${formState.name}' created successfully!`);
            }
            
            fetchWorkflows(); 
            setIsFormOpen(false); 
            setEditingWorkflow(null); 
            setFormState(defaultFormState);
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
    
    const handleEditClick = (workflow) => {
        setEditingWorkflow(workflow);
        setFormState({
            name: workflow.name,
            trigger_subject: workflow.trigger_subject,
            trigger_sender: workflow.trigger_sender || '', 
            recheck_interval_value: workflow.recheck_interval_minutes,
            recheck_interval_unit: 'min' 
        });
        setIsFormOpen(true); 
        setRawDump(null); 
    };
    
    const handleCancelEdit = () => {
        setIsFormOpen(false);
        setEditingWorkflow(null);
        setFormState(defaultFormState);
    };
    
    const handleViewWorkflowData = async (workflowId, workflowName) => {
        setRawDump(null); 
        setRawDumpTitle(null);
        const token = localStorage.getItem('accessToken');
        if (!token) return; 
        
        try {
            const response = await axios.get(`${API_BASE_URL}/data/raw/${workflowId}`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setRawDumpTitle(`Raw Data: ${workflowName} (ID: ${workflowId})`);
            setRawDump(response.data);
            setIsFormOpen(false); 
        } catch (err) {
            let errorDetail = 'Unknown Server Error.';
            if (err.response && err.response.data) {
                errorDetail = err.response.data.detail 
                    ? JSON.stringify(err.response.data.detail) 
                    : err.response.statusText;
            } else {
                errorDetail = err.message || 'Server returned an unknown error.';
            }
            alert('Failed to fetch raw data: ' + errorDetail);
        }
    };
    
    const handleViewAllRawDataDump = async () => {
        setRawDump(null); 
        setRawDumpTitle(null);
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        
        try {
            const response = await axios.get(`${API_BASE_URL}/data/raw/all`, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setRawDumpTitle("Complete Raw Data Dump (All Workflows)");
            setRawDump(response.data);
            setIsFormOpen(false); 
        } catch (err) {
            let errorDetail = 'Unknown Server Error.';
            if (err.response && err.response.data) {
                errorDetail = err.response.data.detail 
                    ? JSON.stringify(err.response.data.detail) 
                    : err.response.statusText;
            } else {
                errorDetail = err.message || 'Server returned an unknown error.';
            }
            alert('Failed to fetch complete raw data dump: ' + errorDetail);
        }
    };
    
    const handleViewInsights = (workflowId) => {
        navigate(`/insights?workflowId=${workflowId}`);
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

    const toggleForm = () => {
        if (isFormOpen && !editingWorkflow) {
             setIsFormOpen(false);
        } else {
            setIsFormOpen(true);
            setEditingWorkflow(null);
            setFormState(defaultFormState);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', color: 'var(--color-accent-light)', marginTop: '40px' }}>Loading workflows...</div>;

    // --- Dynamic Raw Data Table Rendering (Single Table View) ---
    const renderRawDataTable = () => {
        if (!rawDump || rawDump.length === 0) {
            return <p>No data records found.</p>;
        }
        
        const headers = Object.keys(rawDump[0]);
        
        return (
            <table className="raw-data-table">
                <thead>
                    <tr>
                        {/* Headers display uppercase with spaces (e.g., WORKFLOW ID) */}
                        {headers.map(key => <th key={key}>{key.toUpperCase().replace(/_/g, ' ')}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rawDump.map((row, index) => (
                        <tr key={index}>
                            {headers.map((key, idx) => (
                                <td key={idx}>{String(row[key])}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };
    
    // --- Main Component JSX ---
    return (
        <div className="workflows-page"> 
            <div className="workflows-header">
                <h1 className="workflows-title">My Workflows ({workflows.length})</h1>
                <button 
                    onClick={toggleForm}
                    className="create-workflow-button"
                    style={{ display: editingWorkflow ? 'none' : 'flex' }}
                >
                    <Plus size={20} style={{ marginRight: '8px' }} />
                    {isFormOpen ? 'Close Form' : 'Create New Workflow'}
                </button>
            </div>

            {isFormOpen && (
                <div className="workflow-form-container">
                    <h2>{editingWorkflow ? `Editing Workflow: ${editingWorkflow.name} (ID: ${editingWorkflow.id})` : 'New Workflow Configuration'}</h2>
                    <form onSubmit={handleFormSubmit} className="workflow-form">
                        
                        <input type="text" name="name" placeholder="Workflow Name" value={formState.name} onChange={handleFormChange} required className="form-input" />
                        <input type="text" name="trigger_subject" placeholder="Email Subject Filter (e.g., 'Daily Sales Report')" value={formState.trigger_subject} onChange={handleFormChange} required className="form-input" />
                        <input type="email" name="trigger_sender" placeholder="Email Sender Filter (Optional)" value={formState.trigger_sender} onChange={handleFormChange} className="form-input" />
                        
                        <div className="interval-group">
                            <label className="interval-label">Monitor Check Interval:</label>
                            <input
                                type="number"
                                name="recheck_interval_value"
                                min={1}
                                max={formState.recheck_interval_unit === 'hr' ? 24 : 59}
                                value={formState.recheck_interval_value}
                                onChange={e => {
                                    const value = Math.max(1, Number(e.target.min), Math.min(Number(e.target.max), Number(e.target.value)));
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
                            {editingWorkflow ? 'SAVE CHANGES' : 'CREATE WORKFLOW'}
                        </button>
                        
                        {editingWorkflow && (
                            <button 
                                type="button" 
                                onClick={handleCancelEdit} 
                                className="cancel-edit-button" 
                            >
                                CANCEL EDIT
                            </button>
                        )}
                    </form>
                </div>
            )}

            <div className="workflows-list">
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {workflows.map(wf => (
                    <WorkflowItem 
                        key={wf.id} 
                        workflow={wf} 
                        onEdit={handleEditClick} 
                        onDelete={handleDelete}
                        onTrigger={handleTrigger}
                        onViewData={handleViewWorkflowData} 
                        onInsights={handleViewInsights} 
                    />
                ))}
                {workflows.length === 0 && !error && (
                    <p className="no-workflows-message">
                        No workflows created yet. Start automating your supply chain!
                    </p>
                )}
            </div>
            
            <div className="raw-data-area">
                <button
                    onClick={handleViewAllRawDataDump} 
                    disabled={workflows.length === 0}
                    className="raw-data-button"
                >
                    <List size={20} style={{ marginRight: '8px' }} />
                    View All Workflows Raw Data Dump
                </button>
            </div>

            {rawDump && (
                <div className="raw-data-dump">
                    <h2 className="raw-data-dump-title">{rawDumpTitle}</h2>
                    <button onClick={() => setRawDump(null)} className="raw-data-close-button">
                        Close
                    </button>
                    
                    {renderRawDataTable()}
                </div>
            )}
        </div>
    );
}

export default Workflows;