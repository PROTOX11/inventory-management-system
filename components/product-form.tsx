'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/lib/types';
import { productCreateSchema, ProductCreate } from '@/lib/validation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductCreate>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: product ? {
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price / 100,
      quantity: product.quantity,
      initial_quantity: product.initial_quantity,
    } : undefined,
  });

  async function onSubmit(data: ProductCreate) {
    try {
      setError(null);
      const formattedData = {
        ...data,
        price: Math.round(data.price * 100),
        quantity: product ? data.quantity ?? product.quantity : data.initial_quantity,
      };

      if (product) {
        await apiClient.updateProduct(product.id, formattedData);
      } else {
        await apiClient.createProduct(formattedData);
      }
      onSuccess?.();
    } catch (err) {
      const error = err as any;
      setError(error?.message || 'An error occurred');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          SKU
        </label>
        <Input
          {...register('sku')}
          placeholder="PROD-001"
          disabled={isSubmitting}
        />
        {errors.sku && <p className="text-xs text-destructive mt-1">{errors.sku.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Product Name
        </label>
        <Input
          {...register('name')}
          placeholder="Product Name"
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Description
        </label>
        <Textarea
          {...register('description')}
          placeholder="Product description"
          disabled={isSubmitting}
          className="resize-none"
          rows={3}
        />
        {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
      </div>

      <div className={product ? "grid grid-cols-3 gap-4" : "grid grid-cols-2 gap-4"}>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Price
          </label>
          <div className="flex items-center">
            <span className="text-muted-foreground mr-2">₹</span>
            <Input
              {...register('price', { valueAsNumber: true })}
              type="number"
              step="0.01"
              placeholder="0.00"
              disabled={isSubmitting}
            />
          </div>
          {errors.price && <p className="text-xs text-destructive mt-1">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Initialize Stock Quantity
          </label>
          <Input
            {...register('initial_quantity', { valueAsNumber: true })}
            type="number"
            placeholder="0"
            disabled={isSubmitting}
          />
          {errors.initial_quantity && <p className="text-xs text-destructive mt-1">{errors.initial_quantity.message}</p>}
        </div>

        {product && (
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Remaining Quantity
            </label>
            <Input
              {...register('quantity', { valueAsNumber: true })}
              type="number"
              placeholder="0"
              disabled={isSubmitting}
            />
            {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity.message}</p>}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {product ? 'Update Product' : 'Create Product'}
      </Button>
    </form>
  );
}
