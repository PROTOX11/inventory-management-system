'use client';

import { useEffect, useRef, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/lib/types';

const REFRESH_INTERVAL_MS = 1000;

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchInventory(isInitial = false) {
    try {
      const data = await apiClient.getProducts();
      setProducts(data);
      setLastRefreshed(new Date());
      setError(null);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
      setError('Failed to load inventory data');
    } finally {
      if (isInitial) setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory(true);

    intervalRef.current = setInterval(() => fetchInventory(false), REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const filteredProducts = products.filter(
    product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = products.filter(p => p.quantity < 10);
  const outOfStockProducts = products.filter(p => p.quantity === 0);

  function getStockStatus(quantity: number) {
    if (quantity === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity < 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    if (quantity < 50) return { label: 'Moderate', color: 'bg-blue-100 text-blue-800' };
    return { label: 'Healthy', color: 'bg-green-100 text-green-800' };
  }

  function getStockPercentage(quantity: number) {
    return Math.min(100, (quantity / 100) * 100);
  }

  function formatLastRefreshed(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <div className="space-y-8 p-8">
          {}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Inventory</h1>
              <p className="mt-2 text-muted-foreground">Monitor stock levels and product availability</p>
            </div>
            {lastRefreshed && (
              <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1.5 text-xs text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
                Live · updated {formatLastRefreshed(lastRefreshed)}
              </div>
            )}
          </div>

          {}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <p className="text-sm font-medium text-muted-foreground">Total Products</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{products.length}</p>
            </Card>
            <Card className="p-6 border-yellow-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-yellow-600">{lowStockProducts.length}</p>
            </Card>
            <Card className="p-6 border-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <p className="text-sm font-medium text-muted-foreground">Out of Stock</p>
              </div>
              <p className="mt-2 text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
            </Card>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              {error}
            </div>
          )}

          {}
          <div>
            <Input
              placeholder="Search by product name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Stock Level</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        {searchTerm ? 'No products found matching your search.' : 'No products in inventory.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      const status = getStockStatus(product.quantity);
                      const percentage = getStockPercentage(product.quantity);

                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.sku}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>₹{(product.price / 100).toFixed(2)}</TableCell>
                          <TableCell className="font-bold">{product.quantity} units</TableCell>
                          <TableCell>
                            <div className="w-full max-w-xs">
                              <Progress value={percentage} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">{Math.round(percentage)}%</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={status.color}>{status.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
