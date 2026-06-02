'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiClient } from '@/lib/api-client';
import { Customer, Product } from '@/lib/types';
import { orderCreateSchema, OrderCreate } from '@/lib/validation';
import { useState as useErrorState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';

interface OrderFormProps {
  onSuccess?: () => void;
}

export function OrderForm({ onSuccess }: OrderFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockErrors, setStockErrors] = useState<Record<number, string>>({});

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    control,
    setValue,
  } = useForm<OrderCreate>({
    resolver: zodResolver(orderCreateSchema),
    defaultValues: {
      customer_id: '',
      items: [{ product_id: '', quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchItems = watch('items');

  useEffect(() => {
    async function fetchData() {
      try {
        const [customersData, productsData] = await Promise.all([
          apiClient.getCustomers(),
          apiClient.getProducts(),
        ]);
        setCustomers(customersData);
        setProducts(productsData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load customers or products');
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const newErrors: Record<number, string> = {};
    watchItems.forEach((item, index) => {
      if (item.product_id) {
        const product = products.find(p => p.id === item.product_id);
        if (product && item.quantity > product.quantity) {
          newErrors[index] = `Only ${product.quantity} available`;
        }
      }
    });
    setStockErrors(newErrors);
  }, [watchItems, products]);

  useEffect(() => {
    watchItems.forEach((item, index) => {
      if (item.product_id) {
        const product = products.find(p => p.id === item.product_id);
        if (product && item.price !== product.price) {
          setValue(`items.${index}.price`, product.price);
        }
      }
    });
  }, [watchItems, products, setValue]);

  async function onSubmit(data: OrderCreate) {
    try {
      setError(null);

      if (Object.keys(stockErrors).length > 0) {
        setError('Cannot create order: insufficient stock for some items');
        return;
      }

      const formattedData = {
        customer_id: data.customer_id ? parseInt(data.customer_id) : undefined,
        items: data.items.map(item => ({
          product_id: parseInt(item.product_id),
          quantity: item.quantity,
        })),
      };

      await apiClient.createOrder(formattedData);
      onSuccess?.();
    } catch (err) {
      const apiError = err as any;
      setError(apiError?.message || 'Failed to create order');
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Customer
        </label>
        <Controller
          control={control}
          name="customer_id"
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.customer_id && <p className="text-xs text-destructive mt-1">{errors.customer_id.message}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-foreground">
            Order Items
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ product_id: '', quantity: 1, price: 0 })}
          >
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Product
                  </label>
                  <Controller
                    control={control}
                    name={`items.${index}.product_id`}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} (SKU: {product.sku}) - {product.quantity} in stock
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Quantity
                    </label>
                    <Input
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      type="number"
                      min="1"
                      placeholder="1"
                    />
                    {stockErrors[index] && (
                      <p className="text-xs text-destructive mt-1">{stockErrors[index]}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Price
                    </label>
                    <div className="flex items-center">
                      <span className="text-xs text-muted-foreground mr-1">₹</span>
                      <Input
                        {...register(`items.${index}.price`, { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full text-destructive hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Item
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting || Object.keys(stockErrors).length > 0}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Order
      </Button>
    </form>
  );
}
