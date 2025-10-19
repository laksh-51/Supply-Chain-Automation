# backend/analytics/kpi_calculator.py
from sqlmodel import Session, select, func
from models.sales_data_model import SalesData
from typing import Dict, Any


def calculate_delivery_kpis(session: Session) -> Dict[str, Any]:
    """Calculates On-Time, In-Full, and OTIF rates."""
    
    total_orders = session.exec(select(func.count(SalesData.id))).one_or_none()
    
    if not total_orders or total_orders == 0:
        return {
            "on_time_rate": 0.0,
            "in_full_rate": 0.0,
            "otif_rate": 0.0,
            "total_orders": 0
        }

    # Use aggregation to calculate success counts
    on_time_count = session.exec(select(func.count(SalesData.id)).where(SalesData.on_time == 1)).one()
    in_full_count = session.exec(select(func.count(SalesData.id)).where(SalesData.in_full == 1)).one()
    otif_count = session.exec(select(func.count(SalesData.id)).where(
        (SalesData.on_time == 1) & (SalesData.in_full == 1)
    )).one()

    # Calculate Rates
    on_time_rate = round(on_time_count / total_orders, 3) if total_orders else 0
    in_full_rate = round(in_full_count / total_orders, 3) if total_orders else 0
    otif_rate = round(otif_count / total_orders, 3) if total_orders else 0

    return {
        "on_time_rate": on_time_rate,
        "in_full_rate": in_full_rate,
        "otif_rate": otif_rate,
        "total_orders": total_orders
    }

def calculate_product_kpis(session: Session) -> Dict[str, Any]:
    """Calculates top products and order quantities."""
    
    # Example: Top 3 Most Ordered Products
    stmt = select(
        SalesData.product_id,
        func.sum(SalesData.order_qty).label('total_qty')
    ).group_by(SalesData.product_id).order_by(func.sum(SalesData.order_qty).desc()).limit(3)
    
    top_products_result = session.exec(stmt).all()
    
    # Format results for JSON response
    top_products = [
        {"product_id": prod_id, "total_qty": qty}
        for prod_id, qty in top_products_result
    ]

    return {
        "top_ordered_products": top_products
    }

def calculate_customer_kpis(session: Session) -> Dict[str, Any]:
    """Calculates basic customer ordering patterns."""

    # Example: Customers with the most orders
    stmt = select(
        SalesData.customer_id,
        func.count(SalesData.order_id).label('order_count')
    ).group_by(SalesData.customer_id).order_by(func.count(SalesData.order_id).desc()).limit(3)
    
    top_customers_result = session.exec(stmt).all()
    
    top_customers = [
        {"customer_id": cust_id, "order_count": count}
        for cust_id, count in top_customers_result
    ]
    
    return {
        "top_ordering_customers": top_customers
    }

def get_all_kpis(session: Session) -> Dict[str, Any]:
    """Aggregates all KPI calculations into a single dictionary."""
    
    kpis = {}
    kpis["delivery_performance"] = calculate_delivery_kpis(session)
    kpis["product_performance"] = calculate_product_kpis(session)
    kpis["customer_insights"] = calculate_customer_kpis(session)
    
    return kpis