'use client';

import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { AuthGuard } from '@/components/auth-guard';
import { Card } from '@/components/ui/card';
import { Loader2, TrendingUp, AlertTriangle, IndianRupee } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { DashboardStats, Product, Order, Customer } from '@/lib/types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, productsData, ordersData] = await Promise.all([
          apiClient.getDashboardStats(),
          apiClient.getProducts(),
          apiClient.getOrders(),
        ]);
        setStats(statsData);
        setProducts(productsData);
        setOrders(ordersData);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const topProductsData = products
    .slice(0, 5)
    .map(p => ({
      name: p.sku,
      stock: p.quantity,
      price: p.price / 100,
    }));

  const orderStatusData = orders.reduce((acc: any, order) => {
    const existing = acc.find((item: any) => item.name === order.status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: order.status, value: 1 });
    }
    return acc;
  }, []);

  const orderTrendData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      orders: Math.floor(Math.random() * 20),
    };
  });

  const COLORS = ['#3b82f6', '#fbbf24', '#a855f7', '#10b981', '#ef4444'];

  return (
    <AuthGuard allowedRole="merchant">
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="space-y-8 p-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="mt-2 text-muted-foreground">Welcome back. Here&apos;s your inventory overview.</p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {stats && (
            <>
              {}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Total Products"
                  value={stats.total_products}
                  icon={<TrendingUp className="h-5 w-5" />}
                  description="Products in inventory"
                />
                <StatCard
                  title="Total Customers"
                  value={stats.total_customers}
                  icon={<TrendingUp className="h-5 w-5" />}
                  description="Active customers"
                />
                <StatCard
                  title="Total Orders"
                  value={stats.total_orders}
                  icon={<TrendingUp className="h-5 w-5" />}
                  description="Orders placed"
                />
                <StatCard
                  title="Total Revenue"
                  value={`₹${(stats.total_revenue / 100).toFixed(2)}`}
                  icon={<IndianRupee className="h-5 w-5" />}
                  description="Revenue generated"
                />
              </div>

              {}
              {stats.low_stock_products > 0 || stats.pending_orders > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {stats.low_stock_products > 0 && (
                    <Card className="border-yellow-200 bg-yellow-50 p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-900">{stats.low_stock_products} products low on stock</p>
                          <p className="text-sm text-yellow-700">Consider reordering soon</p>
                        </div>
                      </div>
                    </Card>
                  )}
                  {stats.pending_orders > 0 && (
                    <Card className="border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">{stats.pending_orders} pending orders</p>
                          <p className="text-sm text-blue-700">Need to be confirmed</p>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              ) : null}

              {}
              <div className="grid gap-8 lg:grid-cols-2">
                {}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Top Products by Stock</h2>
                  {topProductsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topProductsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                        <Bar dataKey="stock" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No products to display</p>
                  )}
                </Card>

                {}
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Order Status Distribution</h2>
                  {orderStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={orderStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {orderStatusData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No orders to display</p>
                  )}
                </Card>
              </div>

              {}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Order Trend (Last 7 Days)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={orderTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }} />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
    </AuthGuard>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="text-primary">{icon}</div>
      </div>
    </Card>
  );
}
