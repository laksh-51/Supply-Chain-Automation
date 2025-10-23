// frontend/src/pages/Dashboard/History.jsx (NEW FILE)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, CheckCircle, XCircle, Info, Calendar } from 'lucide-react';

const API_BASE_URL = "http://localhost:8000/api/v1";

// Helper to map status to icon/color
const getStatusIcon = (status) => {
    switch (status) {
        case 'SUCCESS':
            return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-100' };
        case 'FAILURE':
            return { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-100' };
        case 'INFO':
        default:
            return { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-100' };
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

    if (loading) return <div className="text-center text-indigo-500">Loading activity history...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center mb-6">
                <Calendar className="mr-3" />
                Workflow History (Last 5 Activities)
            </h1>
            
            <div className="space-y-4">
                {error && <p className="text-red-500 italic">{error}</p>}
                {history.length > 0 ? (
                    history.map((log) => {
                        const { icon: Icon, color, bgColor } = getStatusIcon(log.status);
                        
                        return (
                            <div key={log.id} className="p-4 bg-white rounded-lg shadow-lg flex items-start space-x-4 border-l-4 border-gray-200">
                                <div className={`p-2 rounded-full ${bgColor}`}>
                                    <Icon className={`w-6 h-6 ${color}`} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Activity: <span className={color}>{log.status}</span> on Workflow ID: {log.workflow_id}
                                    </p>
                                    <p className="text-sm text-gray-700 mt-1">{log.message}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Timestamp: {new Date(log.timestamp).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-500 italic">No recent workflow activity recorded for your user.</p>
                )}
            </div>
        </div>
    );
}

export default History;