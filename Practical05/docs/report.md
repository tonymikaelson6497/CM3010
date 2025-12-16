# Practical 5 Report — GlobalCart Query Optimisation (MySQL)

## Goal
Diagnose slow analytics queries and improve performance using:
- EXPLAIN / EXPLAIN ANALYZE
- Indexing
- Denormalization via simulated materialized views

## Baseline Query (Top 10 customers for Jan 2024)
- Query: customers JOIN orders JOIN order_items with SUM + GROUP BY + ORDER BY
- Evidence: EXPLAIN showed full scan on `orders` (type=ALL) before index

### Baseline timings
- Live JOIN query time: ___ ms

## Indexing Intervention
Created: `CREATE INDEX idx_orders_order_date ON orders(order_date);`

### After indexing
- EXPLAIN: `orders` became `type=range` (using idx_orders_order_date)
- Live JOIN query time: ___ ms
- Speedup: baseline/after = ___ x

## Materialized View (Simulated)
Created table: `customer_monthly_spending_mv` and refreshed via TRUNCATE + INSERT...SELECT

### MV query timings
- MV query time: ___ ms

## Trade-offs
- Indexes speed reads but add write/storage overhead.
- MV table is extremely fast for reporting but becomes stale until refreshed.

## RBAC + UI
- Admin: create/drop index, create/refresh MV
- Manager: create/refresh MV
- User: view reports only
