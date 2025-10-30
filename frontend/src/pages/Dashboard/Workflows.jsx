// frontend/src/pages/Dashboard/Workflows.jsx (COMPLETE, FINAL VERSION)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Zap, Database, Clock } from 'lucide-react';

const API_BASE_URL = "http://localhost:8000/api/v1";

// --- WorkflowItem Component ---
const WorkflowItem = ({ workflow, onEdit, onDelete, onTrigger }) => {
    const formatTimestamp = (ts) => ts ? new Date(ts).toLocaleString() : 'Never Run';
    const lastRunText = `${formatTimestamp(workflow.last_run_timestamp)} (${workflow.last_run_status || 'NEW'})`;
    
   return (
        <div 
            // Corrected hover: shadow change and subtle background shift
            className="flex justify-between items-center p-5 mb-4 rounded-xl shadow-lg border-l-4 
                    bg-v-bg-card border-v-accent 
                    transition-all duration-300 hover:shadow-2xl hover:bg-v-bg-mid" /* <<< KEY FIX */
        >
            <div className="flex-1">
                <h3 className="text-xl font-bold text-v-text">{workflow.name}</h3>
                <p className="text-sm text-v-accent mt-1">
                    <Clock className="w-4 h-4 inline mr-1" /> 
                    Interval: {workflow.recheck_interval_minutes} Minutes
                </p>
                <p className="text-xs text-v-text-muted mt-2">
                    Last Run: {lastRunText}
                </p>
            </div>
            
            <div className="flex space-x-3 items-center">
                <button 
                    onClick={() => onEdit(workflow)} 
                    className="p-3 text-v-text hover:text-v-accent transition duration-200 rounded-lg bg-v-bg-mid shadow-md" 
                    title="View Insights/Data"
                >
                    <Database size={20} />
                </button>
                <button 
                    onClick={() => onTrigger(workflow.id)} 
                    className="p-3 text-white bg-v-action rounded-full hover:bg-v-accent transition duration-200 shadow-md" 
                    title="Run Now"
                >
                    <Zap size={20} />
                </button>
                <button 
                    onClick={() => onDelete(workflow.id)} 
                    className="p-3 text-v-text-muted hover:text-red-400 transition duration-200 bg-transparent" 
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
    
    // State for Custom Interval Input (Point 1.1)
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
        if (!token) {
             setError('Not logged in. Please log out and log in again.');
             setLoading(false);
             return;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/workflows`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkflows(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load workflows. Check console for details.');
            setLoading(false);
        }
    };
    
    const handleFormChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        if (!token) {
             alert('Save failed: Authentication token missing. Please log in.');
             return;
        }
        
        // 1. Calculate total minutes for backend
        const minutes = formState.recheck_interval_unit === 'hr' 
            ? formState.recheck_interval_value * 60 
            : formState.recheck_interval_value;
            
        const payload = {
            name: formState.name,
            trigger_subject: formState.trigger_subject,
            trigger_sender: formState.trigger_sender,
            recheck_interval_minutes: minutes, // Send calculated minutes
        };

        try {
            await axios.post(`${API_BASE_URL}/workflows`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchWorkflows(); 
            setIsFormOpen(false); 
            // Reset form state to defaults after success
            setFormState({ 
                name: '', 
                trigger_subject: 'Daily Sales Report', 
                trigger_sender: '',
                recheck_interval_value: 5,
                recheck_interval_unit: 'min'
            });
        } catch (err) {
            let errorMessage = err.response?.data?.detail || 'Server error occurred. Check console.';
            if (Array.isArray(errorMessage)) {
                errorMessage = JSON.stringify(errorMessage);
            }
            console.error("Workflow Save Error:", err);
            alert('Failed to save workflow: ' + errorMessage);
        }
    };

    const handleTrigger = async (workflowId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
             alert('Trigger failed: Authentication token missing. Please log in.');
             return;
        }
        try {
            const response = await axios.post(`${API_BASE_URL}/trigger-workflow/${workflowId}`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Trigger successful: ${response.data.message}`);
            fetchWorkflows(); 
        } catch (err) {
            let errorMessage = err.response?.data?.detail || 'Server error occurred. Check console.';
            if (Array.isArray(errorMessage)) {
                errorMessage = JSON.stringify(errorMessage);
            }
            alert(`Trigger failed: ${errorMessage}`);
        }
    };
    
    // Handles View Data for a specific workflow (Point 2)
    const handleViewData = async (workflowId) => {
        const token = localStorage.getItem('accessToken');
        if (!token) return; 

        try {
            // CRITICAL: Call the multi-tenancy endpoint with the specific workflow ID
            const response = await axios.get(`${API_BASE_URL}/data/raw/${workflowId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRawDump(response.data);
        } catch (err) {
            alert('Failed to fetch raw data: ' + (err.response?.data?.detail || 'Server error'));
        }
    };
    
    // Handles navigation to Insights (which will fetch data based on workflow ID)
    const handleEdit = (workflow) => {
        navigate(`/insights?workflowId=${workflow.id}`);
    };
    
    const handleDelete = async (workflowId) => {
        if (!window.confirm('Are you sure you want to delete this workflow?')) return;
        const token = localStorage.getItem('accessToken');
        if (!token) {
             alert('Delete failed: Authentication token missing. Please log in.');
             return;
        }
        try {
            await axios.delete(`${API_BASE_URL}/workflows/${workflowId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchWorkflows(); 
        } catch (err) {
            alert('Failed to delete workflow.');
        }
    };

    // --- Conditional Return (must be inside function) ---
    if (loading) return <div className="text-center text-v-accent-high mt-10">Loading workflows...</div>;

    return (
        <div className="p-8 min-h-screen"> 
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-v-text-light">My Workflows ({workflows.length})</h1>
                <button 
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="flex items-center px-4 py-2 rounded-lg bg-v-accent-mid hover:bg-v-accent-high text-v-bg-primary font-bold transition duration-200"
                >
                    <Plus size={20} className="mr-2" />
                    Create New Workflow
                </button>
            </div>

            {isFormOpen && (
                <div className="p-6 mb-8 rounded-xl shadow-inner bg-v-bg-card border border-v-accent-low">
                    <h2 className="text-2xl font-bold mb-4 text-v-accent-high">Workflow Configuration</h2>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        
                        {/* Name and Filters */}
                        <input
                            type="text"
                            name="name"
                            placeholder="Workflow Name (e.g., Client A Sales)"
                            value={formState.name}
                            onChange={handleFormChange}
                            required
                            className="w-full p-3 rounded-lg border border-v-accent-low bg-v-bg-secondary text-v-text-light focus:ring-v-accent-high focus:border-v-accent-high"
                        />
                         <input
                            type="text"
                            name="trigger_subject"
                            placeholder="Email Subject Filter (e.g., Daily Sales)"
                            value={formState.trigger_subject}
                            onChange={handleFormChange}
                            required
                            className="w-full p-3 rounded-lg border border-v-accent-low bg-v-bg-secondary text-v-text-light focus:ring-v-accent-high focus:border-v-accent-high"
                        />
                        <input
                            type="email"
                            name="trigger_sender"
                            placeholder="Email Sender Filter (Optional)"
                            value={formState.trigger_sender}
                            onChange={handleFormChange}
                            className="w-full p-3 rounded-lg border border-v-accent-low bg-v-bg-secondary text-v-text-light focus:ring-v-accent-high focus:border-v-accent-high"
                        />
                        
                        {/* Interval Input Box (Point 1.1) */}
                        <div className="flex space-x-3 items-center pt-2">
                            <label className="text-v-text-muted">Monitor Check Interval:</label>
                            <input
                                type="number"
                                name="recheck_interval_value"
                                min={1}
                                max={formState.recheck_interval_unit === 'hr' ? 24 : 59}
                                value={formState.recheck_interval_value}
                                onChange={handleFormChange}
                                required
                                className="w-24 p-3 rounded-lg border border-v-accent-low bg-v-bg-secondary text-v-text-light text-center"
                            />
                            <select
                                name="recheck_interval_unit"
                                value={formState.recheck_interval_unit}
                                onChange={handleFormChange}
                                className="p-3 rounded-lg border border-v-accent-low bg-v-bg-secondary text-v-text-light"
                            >
                                <option value="min">Minutes</option>
                                <option value="hr">Hours</option>
                            </select>
                        </div>

                        <button 
                            type="submit" 
                            className="w-full py-3 rounded-lg bg-v-accent-mid hover:bg-v-accent-high text-v-bg-primary font-bold transition duration-200"
                        >
                            Save Workflow
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {error && <p className="text-red-400">{error}</p>}
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
                    <p className="text-v-text-muted italic mt-10">
                        No workflows created yet. Start automating your supply chain!
                    </p>
                )}
            </div>
            
            {/* NEW: View Data Button (Modified to call handleViewData with the first workflow ID for quick dump) */}
            <div className="mt-10 pt-6 border-t border-v-accent-low/30">
                <button
                    onClick={() => handleViewData(workflows[0]?.id)} /* Use the ID of the first workflow */
                    disabled={workflows.length === 0}
                    className="flex items-center px-6 py-3 rounded-lg bg-v-accent-low hover:bg-v-accent-high text-v-text-light font-bold transition duration-200 disabled:opacity-50"
                >
                    <Database size={20} className="mr-2" />
                    View Raw Data Dump (Latest Workflow)
                </button>
            </div>

            {/* NEW: Raw Data Table Display */}
            {rawDump && (
                <div className="mt-8 p-6 rounded-xl shadow-2xl max-h-96 overflow-auto bg-v-bg-secondary">
                    <h2 className="text-2xl font-semibold mb-4 text-v-accent-high">Complete Data Dump</h2>
                    <button onClick={() => setRawDump(null)} className="float-right text-sm text-red-400 hover:text-v-text-light">
                        Close
                    </button>
                    {/* Simplified table display: Map the array of objects */}
                    <table className="min-w-full divide-y divide-v-accent-low/50 text-sm">
                        <thead className="bg-v-bg-card">
                            <tr>
                                {Object.keys(rawDump[0] || {}).map(key => <th key={key} className="px-3 py-2 text-left font-medium text-v-text-light uppercase tracking-wider">{key}</th>)}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-v-accent-low/20">
                            {rawDump.map((row, index) => (
                                <tr key={index}>
                                    {Object.values(row).map((value, idx) => <td key={idx} className="px-3 py-2 whitespace-nowrap text-v-text-light">{String(value)}</td>)}
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