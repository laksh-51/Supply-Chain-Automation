// // frontend/src/pages/Dashboard/Workflows.jsx (COMPLETE, FINAL VERSION)
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { Plus, Trash2, Zap, Database, Clock } from 'lucide-react';

// const API_BASE_URL = "http://localhost:8000/api/v1";

// // --- WorkflowItem Component ---
// const WorkflowItem = ({ workflow, onEdit, onDelete, onTrigger }) => {
//     const formatTimestamp = (ts) => ts ? new Date(ts).toLocaleString() : 'Never Run';
//     const lastRunText = `${formatTimestamp(workflow.last_run_timestamp)} (${workflow.last_run_status || 'NEW'})`;
    
//    return (
//         <div 
//             // Corrected hover: shadow change and subtle background shift
//             className="flex justify-between items-center p-5 mb-4 rounded-xl shadow-lg border-l-4 
//                     bg-v-bg-card border-v-accent 
//                     transition-all duration-300 hover:shadow-2xl hover:bg-v-bg-mid" /* <<< KEY FIX */
//         >
//             <div className="flex-1">
//                 <h3 className="text-xl font-bold text-v-text">{workflow.name}</h3>
//                 <p className="text-sm text-v-accent mt-1">
//                     <Clock className="w-4 h-4 inline mr-1" /> 
//                     Interval: {workflow.recheck_interval_minutes} Minutes
//                 </p>
//                 <p className="text-xs text-v-text-muted mt-2">
//                     Last Run: {lastRunText}
//                 </p>
//             </div>
            
//             <div className="flex space-x-3 items-center">
//                 <button 
//                     onClick={() => onEdit(workflow)} 
//                     className="p-3 text-v-text hover:text-v-accent transition duration-200 rounded-lg bg-v-bg-mid shadow-md" 
//                     title="View Insights/Data"
//                 >
//                     <Database size={20} />
//                 </button>
//                 <button 
//                     onClick={() => onTrigger(workflow.id)} 
//                     className="p-3 text-white bg-v-action rounded-full hover:bg-v-accent transition duration-200 shadow-md" 
//                     title="Run Now"
//                 >
//                     <Zap size={20} />
//                 </button>
//                 <button 
//                     onClick={() => onDelete(workflow.id)} 
//                     className="p-3 text-v-text-muted hover:text-red-400 transition duration-200 bg-transparent" 
//                     title="Delete"
//                 >
//                     <Trash2 size={20} />
//                 </button>
//             </div>
//         </div>
//     );
// };

// // --- Main Workflows Component ---
// function Workflows() {
//     const [workflows, setWorkflows] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [isFormOpen, setIsFormOpen] = useState(false);
//     const [rawDump, setRawDump] = useState(null); 
    
//     // State for Custom Interval Input (Point 1.1)
//     const [formState, setFormState] = useState({ 
//         name: '', 
//         trigger_subject: 'Daily Sales Report', 
//         trigger_sender: '',
//         recheck_interval_value: 5,
//         recheck_interval_unit: 'min' 
//     });
    
//     const navigate = useNavigate();
    
//     useEffect(() => {
//         fetchWorkflows();
//     }, []);

//     const fetchWorkflows = async () => {
//         const token = localStorage.getItem('accessToken');
//         if (!token) {
//              setError('Not logged in. Please log out and log in again.');
//              setLoading(false);
//              return;
//         }
//         try {
//             const response = await axios.get(`${API_BASE_URL}/workflows`, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setWorkflows(response.data);
//             setLoading(false);
//         } catch (err) {
//             setError('Failed to load workflows. Check console for details.');
//             setLoading(false);
//         }
//     };
    
//     const handleFormChange = (e) => {
//         setFormState({ ...formState, [e.target.name]: e.target.value });
//     };

//     const handleFormSubmit = async (e) => {
//         e.preventDefault();
//         const token = localStorage.getItem('accessToken');
//         if (!token) {
//              alert('Save failed: Authentication token missing. Please log in.');
//              return;
//         }
        
//         // 1. Calculate total minutes for backend
//         const minutes = formState.recheck_interval_unit === 'hr' 
//             ? formState.recheck_interval_value * 60 
//             : formState.recheck_interval_value;
            
//         const payload = {
//             name: formState.name,
//             trigger_subject: formState.trigger_subject,
//             trigger_sender: formState.trigger_sender,
//             recheck_interval_minutes: minutes, // Send calculated minutes
//         };

//         try {
//             await axios.post(`${API_BASE_URL}/workflows`, payload, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             fetchWorkflows(); 
//             setIsFormOpen(false); 
//             // Reset form state to defaults after success
//             setFormState({ 
//                 name: '', 
//                 trigger_subject: 'Daily Sales Report', 
//                 trigger_sender: '',
//                 recheck_interval_value: 5,
//                 recheck_interval_unit: 'min'
//             });
//         } catch (err) {
//             let errorMessage = err.response?.data?.detail || 'Server error occurred. Check console.';
//             if (Array.isArray(errorMessage)) {
//                 errorMessage = JSON.stringify(errorMessage);
//             }
//             console.error("Workflow Save Error:", err);
//             alert('Failed to save workflow: ' + errorMessage);
//         }
//     };

//     const handleTrigger = async (workflowId) => {
//         const token = localStorage.getItem('accessToken');
//         if (!token) {
//              alert('Trigger failed: Authentication token missing. Please log in.');
//              return;
//         }
//         try {
//             const response = await axios.post(`${API_BASE_URL}/trigger-workflow/${workflowId}`, null, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             alert(`Trigger successful: ${response.data.message}`);
//             fetchWorkflows(); 
//         } catch (err) {
//             let errorMessage = err.response?.data?.detail || 'Server error occurred. Check console.';
//             if (Array.isArray(errorMessage)) {
//                 errorMessage = JSON.stringify(errorMessage);
//             }
//             alert(`Trigger failed: ${errorMessage}`);
//         }
//     };
    
//     // Handles View Data for a specific workflow (Point 2)
//     const handleViewData = async (workflowId) => {
//         const token = localStorage.getItem('accessToken');
//         if (!token) return; 

//         try {
//             // CRITICAL: Call the multi-tenancy endpoint with the specific workflow ID
//             const response = await axios.get(`${API_BASE_URL}/data/raw/${workflowId}`, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             setRawDump(response.data);
//         } catch (err) {
//             alert('Failed to fetch raw data: ' + (err.response?.data?.detail || 'Server error'));
//         }
//     };
    
//     // Handles navigation to Insights (which will fetch data based on workflow ID)
//     const handleEdit = (workflow) => {
//         navigate(`/insights?workflowId=${workflow.id}`);
//     };
    
//     const handleDelete = async (workflowId) => {
//         if (!window.confirm('Are you sure you want to delete this workflow?')) return;
//         const token = localStorage.getItem('accessToken');
//         if (!token) {
//              alert('Delete failed: Authentication token missing. Please log in.');
//              return;
//         }
//         try {
//             await axios.delete(`${API_BASE_URL}/workflows/${workflowId}`, {
//                 headers: { Authorization: `Bearer ${token}` }
//             });
//             fetchWorkflows(); 
//         } catch (err) {
//             alert('Failed to delete workflow.');
//         }
//     };

//     // --- Conditional Return (must be inside function) ---
//     if (loading) return <div className="text-center text-v-accent-high mt-10">Loading workflows...</div>;

//     return (
//         <div className="p-8 min-h-screen"> 
//             <div className="flex justify-between items-center mb-8">
//                 <h1 className="text-4xl font-bold text-v-text-light">My Workflows ({workflows.length})</h1>
//                 <button 
//                     onClick={() => setIsFormOpen(!isFormOpen)}
//                     className="flex items-center px-4 py-2 rounded-lg bg-v-accent-mid hover:bg-v-accent-high text-v-bg-primary font-bold transition duration-200"
//                 >
//                     <Plus size={20} className="mr-2" />
//                     Create New Workflow
//                 </button>
//             </div>

//             {isFormOpen && (
//                 <div className="p-6 mb-8 rounded-xl shadow-inner bg-v-bg-card border border-v-accent-low">
//                     <h2 className="text-2xl font-bold mb-4 text-v-accent-high">Workflow Configuration</h2>
//                     <form onSubmit={handleFormSubmit} className="space-y-4">
                        
//                         {/* Name and Filters */}
//                         <input
//                             type="text"
//                             name="name"
//                             placeholder="Workflow Name (e.g., Client A Sales)"
//                             value={formState.name}
//                             onChange={handleFormChange}
//                             required
//                             className="w-full p-3 rounded-lg border border-v-accent-low bg-v-bg-secondary text-v-text-light focus:ring-v-accent-high focus:border-v-accent-high"
//                         />
//                          <input
//                             type="text"
//                             name="trigger_subject"
//                             placeholder="Email Subject Filter (e.g., Daily Sales)"
//                             value={formState.trigger_subject}
//                             onChange={handleFormChange}
//                             required
//                             className="w-full p-3 rounded-lg border border-v-accent-low bg-v-bg-secondary text-v-text-light focus:ring-v-accent-high focus:border-v-accent-high"
//                         />
//                         <input
//                             type="email"
//                             name="trigger_sender"
//                             placeholder="Email Sender Filter (Optional)"
//                             value={formState.trigger_sender}
//                             onChange={handleFormChange}
//                             className="w-full p-3 rounded-lg border border-v-accent-low bg-v-bg-secondary text-v-text-light focus:ring-v-accent-high focus:border-v-accent-high"
//                         />
                        
//                         {/* Interval Input Box (Point 1.1) */}
//                         <div className="flex space-x-3 items-center pt-2">
//                             <label className="text-v-text-muted">Monitor Check Interval:</label>
//                             <input
//                                 type="number"
//                                 name="recheck_interval_value"
//                                 min={1}
//                                 max={formState.recheck_interval_unit === 'hr' ? 24 : 59}
//                                 value={formState.recheck_interval_value}
//                                 onChange={handleFormChange}
//                                 required
//                                 className="w-24 p-3 rounded-lg border border-v-accent-low bg-v-bg-secondary text-v-text-light text-center"
//                             />
//                             <select
//                                 name="recheck_interval_unit"
//                                 value={formState.recheck_interval_unit}
//                                 onChange={handleFormChange}
//                                 className="p-3 rounded-lg border border-v-accent-low bg-v-bg-secondary text-v-text-light"
//                             >
//                                 <option value="min">Minutes</option>
//                                 <option value="hr">Hours</option>
//                             </select>
//                         </div>

//                         <button 
//                             type="submit" 
//                             className="w-full py-3 rounded-lg bg-v-accent-mid hover:bg-v-accent-high text-v-bg-primary font-bold transition duration-200"
//                         >
//                             Save Workflow
//                         </button>
//                     </form>
//                 </div>
//             )}

//             <div className="space-y-4">
//                 {error && <p className="text-red-400">{error}</p>}
//                 {workflows.map(wf => (
//                     <WorkflowItem 
//                         key={wf.id} 
//                         workflow={wf} 
//                         onEdit={handleEdit} 
//                         onDelete={handleDelete}
//                         onTrigger={handleTrigger}
//                     />
//                 ))}
//                 {workflows.length === 0 && !error && (
//                     <p className="text-v-text-muted italic mt-10">
//                         No workflows created yet. Start automating your supply chain!
//                     </p>
//                 )}
//             </div>
            
//             {/* NEW: View Data Button (Modified to call handleViewData with the first workflow ID for quick dump) */}
//             <div className="mt-10 pt-6 border-t border-v-accent-low/30">
//                 <button
//                     onClick={() => handleViewData(workflows[0]?.id)} /* Use the ID of the first workflow */
//                     disabled={workflows.length === 0}
//                     className="flex items-center px-6 py-3 rounded-lg bg-v-accent-low hover:bg-v-accent-high text-v-text-light font-bold transition duration-200 disabled:opacity-50"
//                 >
//                     <Database size={20} className="mr-2" />
//                     View Raw Data Dump (Latest Workflow)
//                 </button>
//             </div>

//             {/* NEW: Raw Data Table Display */}
//             {rawDump && (
//                 <div className="mt-8 p-6 rounded-xl shadow-2xl max-h-96 overflow-auto bg-v-bg-secondary">
//                     <h2 className="text-2xl font-semibold mb-4 text-v-accent-high">Complete Data Dump</h2>
//                     <button onClick={() => setRawDump(null)} className="float-right text-sm text-red-400 hover:text-v-text-light">
//                         Close
//                     </button>
//                     {/* Simplified table display: Map the array of objects */}
//                     <table className="min-w-full divide-y divide-v-accent-low/50 text-sm">
//                         <thead className="bg-v-bg-card">
//                             <tr>
//                                 {Object.keys(rawDump[0] || {}).map(key => <th key={key} className="px-3 py-2 text-left font-medium text-v-text-light uppercase tracking-wider">{key}</th>)}
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-v-accent-low/20">
//                             {rawDump.map((row, index) => (
//                                 <tr key={index}>
//                                     {Object.values(row).map((value, idx) => <td key={idx} className="px-3 py-2 whitespace-nowrap text-v-text-light">{String(value)}</td>)}
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// }

// export default Workflows;

// frontend/src/pages/Dashboard/Workflows.jsx (FINAL STABLE UI)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, Zap, Database, Clock } from 'lucide-react';

const API_BASE_URL = "http://localhost:8000/api/v1";

// --- WorkflowItem Component ---
const WorkflowItem = ({ workflow, onEdit, onDelete, onTrigger }) => {
    const formatTimestamp = (ts) => ts ? new Date(ts).toLocaleString() : 'Never Run';
    const lastRunText = `${formatTimestamp(workflow.last_run_timestamp)} (${workflow.last_run_status || 'NEW'})`;
    
    // Dynamic styling for hover effect
    const [isHovered, setIsHovered] = useState(false);

    const cardStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px',
        marginBottom: '16px',
        borderRadius: '12px',
        boxShadow: isHovered ? '0 10px 20px rgba(0, 0, 0, 0.4)' : '0 4px 10px rgba(0, 0, 0, 0.2)',
        borderLeft: '4px solid var(--color-accent-light)',
        backgroundColor: isHovered ? 'var(--color-bg-mid)' : 'var(--color-card-bg)',
        transition: 'all 0.3s',
        cursor: 'default',
    };

    return (
        <div 
            style={cardStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{workflow.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-accent-light)', marginTop: '8px', display: 'flex', alignItems: 'center' }}>
                    <Clock style={{ width: '16px', height: '16px', marginRight: '8px' }} /> 
                    Interval: {workflow.recheck_interval_minutes} Minutes
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                    Last Run: {lastRunText}
                </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button 
                    onClick={() => onEdit(workflow)} 
                    style={{ padding: '10px', backgroundColor: 'var(--color-bg-mid)', color: 'var(--color-accent-light)', borderRadius: '50%' }} 
                    title="View Insights/Data"
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-accent-strong)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-bg-mid)'}
                >
                    <Database size={20} />
                </button>
                <button 
                    onClick={() => onTrigger(workflow.id)} 
                    style={{ padding: '12px', backgroundColor: 'var(--color-accent-strong)', color: 'white', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }} 
                    title="Run Now"
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-accent-light)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-accent-strong)'}
                >
                    <Zap size={20} />
                </button>
                <button 
                    onClick={() => onDelete(workflow.id)} 
                    style={{ padding: '10px', backgroundColor: 'transparent', color: 'var(--color-text-muted)', borderRadius: '50%' }} 
                    title="Delete"
                    onMouseEnter={e => e.currentTarget.style.color = 'red'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}
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
        // Since we are not using Tailwind, we must adjust the primary container style manually
        document.body.style.backgroundColor = 'var(--color-bg-deep)';
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

    const inputStyle = {
        width: '100%',
        padding: '12px',
        boxSizing: 'border-box',
        borderRadius: '8px',
        border: '1px solid var(--color-accent-strong)',
        backgroundColor: 'var(--color-bg-mid)',
        color: 'var(--color-text-primary)',
    };

    return (
        <div style={{ padding: '32px', minHeight: '100vh', color: 'var(--color-text-primary)' }}> 
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '800' }}>My Workflows ({workflows.length})</h1>
                <button 
                    onClick={() => setIsFormOpen(!isFormOpen)}
                    style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', backgroundColor: 'var(--color-accent-strong)', color: 'white', fontWeight: 'bold' }}
                >
                    <Plus size={20} style={{ marginRight: '8px' }} />
                    Create New Workflow
                </button>
            </div>

            {isFormOpen && (
                <div style={{ padding: '24px', marginBottom: '32px', borderRadius: '12px', backgroundColor: 'var(--color-card-bg)', border: '1px solid var(--color-accent-strong)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px', color: 'var(--color-accent-light)' }}>Workflow Configuration</h2>
                    <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        <input type="text" name="name" placeholder="Workflow Name" value={formState.name} onChange={handleFormChange} required style={inputStyle} />
                        <input type="text" name="trigger_subject" placeholder="Email Subject Filter" value={formState.trigger_subject} onChange={handleFormChange} required style={inputStyle} />
                        <input type="email" name="trigger_sender" placeholder="Email Sender Filter (Optional)" value={formState.trigger_sender} onChange={handleFormChange} style={inputStyle} />
                        
                        {/* Interval Input Box */}
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '8px' }}>
                            <label style={{ color: 'var(--color-text-muted)' }}>Monitor Check Interval:</label>
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
                                style={{ ...inputStyle, width: '100px', textAlign: 'center' }}
                            />
                            <select
                                name="recheck_interval_unit"
                                value={formState.recheck_interval_unit}
                                onChange={handleFormChange}
                                style={{ ...inputStyle, width: '120px', margin: 0 }}
                            >
                                <option value="min">Minutes</option>
                                <option value="hr">Hours</option>
                            </select>
                        </div>

                        <button type="submit" style={{ padding: '12px', marginTop: '20px', backgroundColor: 'var(--color-accent-strong)' }}>
                            Save Workflow
                        </button>
                    </form>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    <p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', marginTop: '40px' }}>
                        No workflows created yet. Start automating your supply chain!
                    </p>
                )}
            </div>
            
            {/* View Data Button */}
            <div style={{ marginTop: '40px', paddingTop: '24px', borderTop: '1px solid var(--color-card-bg)' }}>
                <button
                    onClick={() => handleViewData(workflows[0]?.id)} 
                    disabled={workflows.length === 0}
                    style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', backgroundColor: 'var(--color-accent-strong)', color: 'white', fontWeight: 'bold' }}
                >
                    <Database size={20} style={{ marginRight: '8px' }} />
                    View Raw Data Dump (Latest Workflow)
                </button>
            </div>

            {/* Raw Data Table Display */}
            {rawDump && (
                <div style={{ marginTop: '30px', padding: '24px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', maxHeight: '600px', overflowY: 'auto', backgroundColor: 'var(--color-bg-mid)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: 'var(--color-accent-light)' }}>Complete Data Dump</h2>
                    <button onClick={() => setRawDump(null)} style={{ float: 'right', fontSize: '0.875rem', color: 'red', background: 'none', border: 'none', padding: '0' }}>
                        Close
                    </button>
                    
                    {/* Table styling */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                        <thead style={{ backgroundColor: 'var(--color-card-bg)' }}>
                            <tr>
                                {Object.keys(rawDump[0] || {}).map(key => <th key={key} style={{ padding: '12px', textAlign: 'left', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.75rem', borderBottom: '1px solid var(--color-bg-mid)' }}>{key}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {rawDump.map((row, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid var(--color-bg-mid)' }}>
                                    {Object.values(row).map((value, idx) => <td key={idx} style={{ padding: '12px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>{String(value)}</td>)}
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