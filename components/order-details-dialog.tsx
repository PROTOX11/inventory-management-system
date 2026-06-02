'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Order } from '@/lib/types';
import { apiClient } from '@/lib/api-client';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface OrderDetailsDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate?: () => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
  onStatusUpdate,
}: OrderDetailsDialogProps) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState(order.status);

  async function handleStatusUpdate() {
    try {
      setUpdating(true);
      setError(null);
      await apiClient.updateOrder(order.id, { status: newStatus as any });
      onStatusUpdate?.();
      onOpenChange(false);
    } catch (err) {
      const apiError = err as any;
      setError(apiError?.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>Order ID: {order.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-foreground">
                ₹{(order.total_amount / 100).toFixed(2)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
              <Badge className={statusColors[order.status] || 'bg-gray-100 text-gray-800'}>
                {order.status}
              </Badge>
            </Card>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Update Status
            </label>
            <div className="flex gap-2">
              <Select value={newStatus} onValueChange={(val) => setNewStatus(val as any)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleStatusUpdate}
                disabled={updating || newStatus === order.status}
              >
                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-3">Order Items</h3>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit Price</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">#{item.product_id}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{(item.unit_price / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{(item.total_price / 100).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">{new Date(order.created_at).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium">{new Date(order.updated_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
