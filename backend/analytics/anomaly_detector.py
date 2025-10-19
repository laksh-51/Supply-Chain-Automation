# backend/analytics/anomaly_detector.py
from typing import Dict, Any


def detect_anomalies(kpis: Dict[str, Any]) -> Dict[str, Any]:
    """
    Placeholder for simple anomaly detection logic.
    In the final project, this would compare current KPIs against historical data.
    """
    
    otif = kpis['delivery_performance']['otif_rate']
    
    # Simple Mock Anomaly Rule: If OTIF is under 0.90, flag it.
    if otif < 0.90:
        return {
            "flagged": True,
            "type": "OTIF_DROP",
            "message": f"The overall OTIF Rate is currently {otif*100:.1f}%, which is below the target threshold of 90%.",
            "data_point": otif
        }
    
    return {
        "flagged": False,
        "type": "NORMAL",
        "message": "All key performance indicators are currently within historical norms."
    }