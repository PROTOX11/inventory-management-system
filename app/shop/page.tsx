'use client';

import { useEffect, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { AuthGuard } from '@/components/auth-guard';
import { apiClient } from '@/lib/api-client';
import { Product } from '@/lib/types';
import {
  Loader2,
  ShoppingCart,
  AlertTriangle,
  CheckCircle2,
  Package,
  Search,
  Trash2,
} from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ordering, setOrdering] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState('');
  const [orderError, setOrderError] = useState('');
  const [search, setSearch] = useState('');
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const data = await apiClient.getProducts() as Product[];
      setProducts(data.filter((p: any) => p.status === 'active'));
      setError(null);
    } catch (err) {
      setError('Failed to load products. Please check the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  function addToCart(product: Product) {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev; // can't exceed stock
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }

  function updateQuantity(productId: string, qty: number) {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && qty > product.quantity) return;
    setCart(prev =>
      prev.map(item => item.product.id === productId ? { ...item, quantity: qty } : item)
    );
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  async function placeOrder() {
    if (cart.length === 0) return;
    setOrdering(true);
    setOrderError('');
    setOrderSuccess('');
    try {
      await apiClient.createOrder({
        items: cart.map(item => ({
          product_id: parseInt(item.product.id),
          quantity: item.quantity,
        })),
      });
      setCart([]);
      setShowCart(false);
      setOrderSuccess(`Order placed successfully! Your ${cartCount} item(s) are being processed.`);
      fetchProducts();
      setTimeout(() => setOrderSuccess(''), 5000);
    } catch (err: any) {
      setOrderError(err?.message || 'Failed to place order. Please try again.');
    } finally {
      setOrdering(false);
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AuthGuard allowedRole="customer">
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-8 space-y-6">
            {}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Browse Shop</h1>
                <p className="mt-1 text-muted-foreground">Browse available products and add them to your cart</p>
              </div>
              <button
                id="cart-btn"
                onClick={() => setShowCart(true)}
                className="relative flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {}
            {orderSuccess && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                {orderSuccess}
              </div>
            )}
            {orderError && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {orderError}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {}
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="shop-search"
                className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none ring-offset-background focus:ring-2 focus:ring-ring"
                placeholder="Search products…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center py-20 text-muted-foreground gap-3">
                    <Package className="h-12 w-12 opacity-30" />
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm">Try a different search term</p>
                  </div>
                ) : (
                  filtered.map(product => {
                    const inCart = cart.find(c => c.product.id === product.id);
                    const outOfStock = product.quantity === 0;
                    return (
                      <div
                        key={product.id}
                        className="group relative flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                      >
                        {}
                        {outOfStock && (
                          <span className="absolute right-3 top-3 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                            Out of Stock
                          </span>
                        )}
                        {}
                        {!outOfStock && product.quantity < 10 && (
                          <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            Low Stock
                          </span>
                        )}

                        {}
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <Package className="h-6 w-6 text-primary" />
                        </div>

                        <p className="font-mono text-xs text-muted-foreground">{product.sku}</p>
                        <h3 className="mt-1 font-semibold text-foreground line-clamp-1">{product.name}</h3>
                        {product.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                        )}

                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <div>
                            <p className="text-lg font-bold text-foreground">₹{(product.price / 100).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{product.quantity} in stock</p>
                          </div>
                          <button
                            id={`add-to-cart-${product.id}`}
                            onClick={() => addToCart(product)}
                            disabled={outOfStock}
                            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            {inCart ? `In Cart (${inCart.quantity})` : 'Add to Cart'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          {}
          <div
            className="flex-1 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCart(false)}
          />
          {}
          <div className="flex w-full max-w-sm flex-col bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-5">
              <h2 className="text-lg font-bold text-foreground">Your Cart</h2>
              <button
                id="close-cart-btn"
                onClick={() => setShowCart(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-auto p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-muted-foreground gap-3">
                  <ShoppingCart className="h-10 w-10 opacity-30" />
                  <p className="font-medium">Your cart is empty</p>
                  <p className="text-sm">Browse products and add some to your cart</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">₹{(item.product.price / 100).toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        className="h-6 w-6 rounded border border-border text-xs hover:bg-muted"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >−</button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        className="h-6 w-6 rounded border border-border text-xs hover:bg-muted"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >+</button>
                    </div>
                    <p className="text-sm font-semibold text-foreground w-16 text-right">
                      ₹{(item.product.price * item.quantity / 100).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-border p-5 space-y-4">
                {orderError && (
                  <div className="text-xs text-destructive bg-destructive/10 rounded-lg p-2">
                    {orderError}
                  </div>
                )}
                <div className="flex items-center justify-between text-foreground">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold">₹{(cartTotal / 100).toFixed(2)}</span>
                </div>
                <button
                  id="place-order-btn"
                  onClick={placeOrder}
                  disabled={ordering}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {ordering ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order…</>
                  ) : (
                    <><ShoppingCart className="h-4 w-4" /> Place Order</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AuthGuard>
  );
}


