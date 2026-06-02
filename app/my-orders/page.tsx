'use client';

import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { AuthGuard } from '@/components/auth-guard';
import { apiClient } from '@/lib/api-client';
import { Order } from '@/lib/types';
import {
  Loader2,
  ClipboardList,
  Package,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const data = await apiClient.getMyOrders() as Order[];
      setOrders(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(orderId: string) {
    setExpanded(prev => (prev === orderId ? null : orderId));
  }

  return (
    <AuthGuard allowedRole="customer">
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">My Orders</h1>
              <p className="mt-1 text-muted-foreground">Track your purchase history and order status</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center py-24 text-muted-foreground gap-3">
                <ClipboardList className="h-12 w-12 opacity-30" />
                <p className="text-lg font-medium">No orders yet</p>
                <p className="text-sm">Head to the shop to place your first order!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => {
                  const isOpen = expanded === order.id;
                  const statusStyle = STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-800';
                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
                    >
                      {}
                      <button
                        id={`order-row-${order.id}`}
                        className="flex w-full items-center justify-between p-5 text-left hover:bg-muted/50 transition-colors"
                        onClick={() => toggleExpand(order.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">Order #{order.id}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyle}`}>
                            {order.status}
                          </span>
                          <span className="font-bold text-foreground">
                            ₹{(order.total_amount / 100).toFixed(2)}
                          </span>
                          {isOpen ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {}
                      {isOpen && (
                        <div className="border-t border-border bg-muted/20 p-5">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                            Items
                          </p>
                          <div className="space-y-2">
                            {order.items && order.items.length > 0 ? (
                              order.items.map(item => (
                                <div
                                  key={item.id}
                                  className="flex items-center justify-between rounded-lg bg-card border border-border px-4 py-2.5"
                                >
                                  <div>
                                    <p className="text-sm font-medium text-foreground">
                                      Product #{item.product_id}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Qty: {item.quantity} × ₹{(item.unit_price / 100).toFixed(2)}
                                    </p>
                                  </div>
                                  <p className="text-sm font-semibold text-foreground">
                                    ₹{(item.total_price / 100).toFixed(2)}
                                  </p>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No item details available.</p>
                            )}
                          </div>
                          {order.notes && (
                            <div className="mt-3 rounded-lg bg-muted p-3">
                              <p className="text-xs text-muted-foreground">
                                <span className="font-semibold">Note: </span>{order.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
