// frontend/src/pages/Dashboard/Workflows.jsx (CLEAN VERSION)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Zap, Database } from 'lucide-react';

const API_BASE_URL = "http://localhost:8000/api/v1";

const WorkflowItem = ({ workflow, onEdit, onDelete, onTrigger }) => {
    // Helper to format date nicely
    const formatTimestamp = (ts) => ts ? new Date(ts).toLocaleString() : 'Never Run';
    const lastRunText = `${formatTimestamp(workflow.last_run_timestamp)} (${workflow.last_run_status || 'NEW'})`;
    
    return (
        <div className="flex justify-between items-center p-4 mb-2 bg-white rounded-lg shadow-md border-l-4 border-indigo-500">
            <div>
                <h3 className="text-lg font-semibold">{workflow.name}</h3>
                <p className="text-sm text-gray-600">Trigger: Subject starts with "{workflow.trigger_subject}"</p>
                <p className="text-xs text-gray-500 mt-1">Last Run: {lastRunText}</p>
            </div>
            <div className="flex space-x-2">
                <button 
                    onClick={() => onEdit(workflow)} 
                    className="p-2 text-indigo-500 hover:text-indigo-700" 
                    title="View Insights/Data"
                >
                    <Database size={18} />
                </button>
                <button 
                    onClick={() => onTrigger(workflow.id)} 
                    className="p-2 text-white bg-green-500 rounded-full hover:bg-green-600" 
                    title="Run Now"
                >
                    <Zap size={18} />
                </button>
                <button 
                    onClick={() => onDelete(workflow.id)} 
                    className="p-2 text-red-500 hover:text-red-700" 
                    title="Delete"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

function Workflows(){
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formState, setFormState] = useState({ name: '', trigger_subject: 'Daily Sales Report', trigger_sender: '' });
    const [rawDump, setRawDump] = useState(null); // NEW: State for raw data table
    const navigate = useNavigate();
    // Token is now retrieved inside functions (Step 2 of previous fix)

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
    
    const handleViewData = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return; 

        try {
            const response = await axios.get(`${API_BASE_URL}/data/raw`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRawDump(response.data);
        } catch (err) {
            alert('Failed to fetch raw data: ' + (err.response?.data?.detail || 'Server error'));
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
        try {
            await axios.post(`${API_BASE_URL}/workflows`, formState, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchWorkflows(); 
            setIsFormOpen(false); 
            setFormState({ name: '', trigger_subject: 'Daily Sales Report', trigger_sender: '' });
        } catch (err) {
            // Updated error handling to show detailed message
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
    
    const handleEdit = (workflow) => {
        // This fulfills the "see the database in table format, and get insights" requirement.
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

    // If loading is true, this should show up. If it is NOT showing up, 
    // the code broke before reaching this return statement.
    if (loading) return <div className="text-center text-indigo-500">Loading workflows...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">My Workflows ({workflows.length})</h1>
                <button 
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    className="flex items-center px-4 py-2 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600"
                >
                    <Plus size={20} className="mr-2" />
                    Create New Workflow
                </button>
            </div>

            {isFormOpen && (
                <div className="p-4 mb-6 bg-gray-100 rounded-lg shadow-inner">
                    <h2 className="text-xl font-semibold mb-3">Workflow Configuration</h2>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="name"
                            placeholder="Workflow Name (e.g., Client A Sales)"
                            value={formState.name}
                            onChange={handleFormChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded"
                        />
                        <input
                            type="text"
                            name="trigger_subject"
                            placeholder="Email Subject Filter (e.g., Daily Sales)"
                            value={formState.trigger_subject}
                            onChange={handleFormChange}
                            required
                            className="w-full p-3 border border-gray-300 rounded"
                        />
                        <input
                            type="email"
                            name="trigger_sender"
                            placeholder="Email Sender Filter (Optional)"
                            value={formState.trigger_sender}
                            onChange={handleFormChange}
                            className="w-full p-3 border border-gray-300 rounded"
                        />
                        <button type="submit" className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600">
                            Save Workflow
                        </button>
                    </form>
                </div>
            )}

            <div className="space-y-4">
                {error && <p className="text-red-500">{error}</p>}
                {workflows.map(wf => (
                    <WorkflowItem 
                        key={wf.id} 
                        workflow={wf} 
                        onEdit={handleEdit} 
                        onDelete={handleDelete}
                        onTrigger={handleTrigger}
                    />
                ))}
                {workflows.length === 0 && !error && <p className="text-gray-500 italic">No workflows created yet. Click 'Create New Workflow' to begin.</p>}
            {/* NEW: View Data Button */}
            <div className="mt-8 pt-4 border-t">
                <button
                    onClick={handleViewData} 
                    className="flex items-center px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                    <Database size={20} className="mr-2" />
                    View All Raw Data Dump
                </button>
            </div>

            {/* NEW: Raw Data Table Display */}
            {rawDump && (
                <div className="mt-4 p-4 bg-white shadow-lg rounded-lg max-h-96 overflow-auto">
                    <h2 className="text-xl font-semibold mb-3">Complete Data Dump</h2>
                    <button onClick={() => setRawDump(null)} className="float-right text-sm text-red-500">
                        Close
                    </button>
                    {/* Simplified table display: Map the array of objects */}
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                        <thead className="bg-gray-50">
                            <tr>
                                {Object.keys(rawDump[0] || {}).map(key => <th key={key} className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">{key}</th>)}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rawDump.map((row, index) => (
                                <tr key={index}>
                                    {Object.values(row).map((value, idx) => <td key={idx} className="px-2 py-1 whitespace-nowrap">{String(value)}</td>)}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Workflows;