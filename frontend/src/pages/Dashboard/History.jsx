// frontend/src/pages/Dashboard/History.jsx (REVERTED TO EXTERNAL CSS CLASSES)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, XCircle, Info, Calendar } from 'lucide-react';

// Import local component CSS
import '../history.css'; // <-- NEW IMPORT

const API_BASE_URL = "http://localhost:8000/api/v1";

// Helper to map status to icon/color (Simplified status colors to static hex values)
const getStatusIcon = (status) => {
    switch (status) {
        case 'SUCCESS':
            return { icon: CheckCircle, colorClass: 'text-green-500', bgColorClass: 'bg-green-100' };
        case 'FAILURE':
            return { icon: XCircle, colorClass: 'text-red-500', bgColorClass: 'bg-red-100' };
        case 'INFO':
        default:
            // Assuming 'INFO' uses blue/default styling
            return { icon: Info, colorClass: 'text-blue-500', bgColorClass: 'bg-blue-100' };
    }
};

function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Fetch the last 5 logs from the new endpoint
                const response = await axios.get(`${API_BASE_URL}/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch history logs. Ensure the /api/v1/history endpoint is active.');
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) return <div className="loading-state">Loading activity history...</div>;

    return (
        <div className="history-container">
            <h1 className="history-header">
                <Calendar className="history-header-icon" />
                Workflow History (Last 5 Activities)
            </h1>
            
            <div className="history-list">
                {error && <p className="history-error">{error}</p>}
                {history.length > 0 ? (
                    history.map((log) => {
                        const { icon: Icon, colorClass, bgColorClass } = getStatusIcon(log.status);
                        
                        return (
                            <div key={log.id} className="history-log-item">
                                <div className={`history-icon-wrapper ${bgColorClass}`}>
                                    <Icon className={colorClass} />
                                </div>
                                <div>
                                    <p className="log-status-text">
                                        Activity: <span className={`log-activity-span ${colorClass}`}>{log.status}</span> on Workflow ID: {log.workflow_id}
                                    </p>
                                    <p className="log-message">{log.message}</p>
                                    <p className="log-timestamp">
                                        Timestamp: {new Date(log.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="no-activity-message">No recent workflow activity recorded for your user.</p>
                )}
            </div>
        </div>
    );
}

export default History;