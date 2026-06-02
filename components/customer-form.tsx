'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { Customer } from '@/lib/types';
import { customerCreateSchema, CustomerCreate } from '@/lib/validation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface CustomerFormProps {
  customer?: Customer | null;
  onSuccess?: () => void;
}

export function CustomerForm({ customer, onSuccess }: CustomerFormProps) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerCreate>({
    resolver: zodResolver(customerCreateSchema),
    defaultValues: customer ? {
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
    } : undefined,
  });

  async function onSubmit(data: CustomerCreate) {
    try {
      setError(null);

      if (customer) {
        await apiClient.updateCustomer(customer.id, data);
      } else {
        await apiClient.createCustomer(data);
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
          Email
        </label>
        <Input
          {...register('email')}
          type="email"
          placeholder="customer@example.com"
          disabled={isSubmitting}
        />
        {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Full Name
        </label>
        <Input
          {...register('name')}
          placeholder="John Doe"
          disabled={isSubmitting}
        />
        {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Phone Number
        </label>
        <Input
          {...register('phone')}
          placeholder="+1 (555) 000-0000"
          disabled={isSubmitting}
        />
        {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Address
        </label>
        <Input
          {...register('address')}
          placeholder="123 Main St, City, State 12345"
          disabled={isSubmitting}
        />
        {errors.address && <p className="text-xs text-destructive mt-1">{errors.address.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {customer ? 'Update Customer' : 'Create Customer'}
      </Button>
    </form>
  );
}
