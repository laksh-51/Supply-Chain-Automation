# backend/analytics/kpi_calculator.py
from sqlmodel import Session, select, func
from typing import Dict, Any, Type


# NOTE: All functions now accept model_class: Type
def calculate_delivery_kpis(session: Session, model_class: Type) -> Dict[str, Any]:
    """Calculates On-Time, In-Full, and OTIF rates using a provided model class."""
    
    # Use model_class instead of hardcoded SalesData
    total_orders = session.exec(select(func.count(model_class.id))).one_or_none()
    
    if not total_orders or total_orders == 0:
        return {
            "on_time_rate": 0.0,
            "in_full_rate": 0.0,
            "otif_rate": 0.0,
            "total_orders": 0
        }

    # Use aggregation to calculate success counts, referencing model_class
    on_time_count = session.exec(select(func.count(model_class.id)).where(model_class.on_time == 1)).one()
    in_full_count = session.exec(select(func.count(model_class.id)).where(model_class.in_full == 1)).one()
    otif_count = session.exec(select(func.count(model_class.id)).where(
        (model_class.on_time == 1) & (model_class.in_full == 1)
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

# NOTE: All functions now accept model_class: Type
def calculate_product_kpis(session: Session, model_class: Type) -> Dict[str, Any]:
    """Calculates top products and order quantities."""
    
    # Example: Top 3 Most Ordered Products
    stmt = select(
        model_class.product_id,
        func.sum(model_class.order_qty).label('total_qty')
    ).group_by(model_class.product_id).order_by(func.sum(model_class.order_qty).desc()).limit(3)
    
    top_products_result = session.exec(stmt).all()
    
    # Format results for JSON response
    top_products = [
        {"product_id": prod_id, "total_qty": qty}
        for prod_id, qty in top_products_result
    ]

    return {
        "top_ordered_products": top_products
    }

# NOTE: All functions now accept model_class: Type
def calculate_customer_kpis(session: Session, model_class: Type) -> Dict[str, Any]:
    """Calculates basic customer ordering patterns."""

    # Example: Customers with the most orders
    stmt = select(
        model_class.customer_id,
        func.count(model_class.order_id).label('order_count')
    ).group_by(model_class.customer_id).order_by(func.count(model_class.order_id).desc()).limit(3)
    
    top_customers_result = session.exec(stmt).all()
    
    top_customers = [
        {"customer_id": cust_id, "order_count": count}
        for cust_id, count in top_customers_result
    ]
    
    return {
        "top_ordering_customers": top_customers
    }

# NOTE: The aggregator function now accepts model_class: Type
def get_all_kpis(session: Session, model_class: Type) -> Dict[str, Any]:
    """Aggregates all KPI calculations into a single dictionary."""
    
    kpis = {}
    kpis["delivery_performance"] = calculate_delivery_kpis(session, model_class)
    kpis["product_performance"] = calculate_product_kpis(session, model_class)
    kpis["customer_insights"] = calculate_customer_kpis(session, model_class)
    
    return kpis