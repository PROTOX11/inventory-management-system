'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import { isLoggedIn, getRole } from '@/lib/auth';
import { Package2, Eye, EyeOff, Loader2, ShieldCheck, ShoppingBag } from 'lucide-react';

type Mode = 'login' | 'register';
type Role = 'merchant' | 'customer';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('merchant');
  const [mode, setMode] = useState<Mode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    if (isLoggedIn()) {
      const userRole = getRole();
      if (userRole === 'merchant') router.replace('/dashboard');
      else router.replace('/shop');
    }
  }, [router]);

  function reset() {
    setError('');
    setSuccess('');
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setAddress('');
    setCity('');
  }

  function handleRoleChange(r: Role) {
    setRole(r);
    reset();
  }

  function handleModeChange(m: Mode) {
    setMode(m);
    reset();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        if (role === 'merchant') {
          await apiClient.loginMerchant(email, password);
          router.push('/dashboard');
        } else {
          await apiClient.loginCustomer(email, password);
          router.push('/shop');
        }
      } else {
        if (role === 'merchant') {
          await apiClient.registerMerchant(name, email, password);
          setSuccess('Merchant account created! Please log in.');
          setMode('login');
          reset();
          setEmail(email);
        } else {
          await apiClient.registerCustomer({ name, email, password, phone, address, city });
          setSuccess('Account created! Please log in.');
          setMode('login');
          reset();
          setEmail(email);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      <div className="login-bg-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="login-card">
        {}
        <div className="login-logo">
          <Package2 className="logo-icon" />
          <span className="logo-text">Inventory IMS</span>
        </div>

        <h1 className="login-title">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="login-subtitle">
          {mode === 'login'
            ? 'Sign in to continue to your dashboard'
            : 'Join as a merchant or customer'}
        </p>

        {}
        <div className="role-switcher">
          <button
            type="button"
            id="role-merchant"
            className={`role-btn ${role === 'merchant' ? 'active' : ''}`}
            onClick={() => handleRoleChange('merchant')}
          >
            <ShieldCheck className="role-icon" />
            Merchant
          </button>
          <button
            type="button"
            id="role-customer"
            className={`role-btn ${role === 'customer' ? 'active' : ''}`}
            onClick={() => handleRoleChange('customer')}
          >
            <ShoppingBag className="role-icon" />
            Customer
          </button>
        </div>

        {}
        {success && (
          <div className="alert-success">{success}</div>
        )}

        {}
        {error && (
          <div className="alert-error">{error}</div>
        )}

        {}
        <form onSubmit={handleSubmit} className="login-form">
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {}
          {mode === 'register' && role === 'customer' && (
            <>
              <div className="form-group">
                <label htmlFor="phone">Phone <span className="optional">(optional)</span></label>
                <input
                  id="phone"
                  type="text"
                  placeholder="+1 555 0123"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="address">Address <span className="optional">(optional)</span></label>
                  <input
                    id="address"
                    type="text"
                    placeholder="123 Main St"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="city">City <span className="optional">(optional)</span></label>
                  <input
                    id="city"
                    type="text"
                    placeholder="New York"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <button id="submit-btn" type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <><Loader2 className="btn-spinner" /> Processing…</>
            ) : mode === 'login' ? (
              `Sign in as ${role === 'merchant' ? 'Merchant' : 'Customer'}`
            ) : (
              `Create ${role === 'merchant' ? 'Merchant' : 'Customer'} Account`
            )}
          </button>
        </form>

        {}
        <p className="mode-toggle">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            type="button"
            id="mode-toggle-btn"
            className="mode-toggle-btn"
            onClick={() => handleModeChange(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </button>
        </p>
      </div>

      <style jsx>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          position: relative;
          overflow: hidden;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 1rem;
        }

        .login-bg-blobs {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.3;
          animation: blobFloat 8s ease-in-out infinite alternate;
        }

        .blob-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #7c3aed, #4f46e5);
          top: -100px;
          left: -100px;
          animation-delay: 0s;
        }

        .blob-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #06b6d4, #3b82f6);
          bottom: -80px;
          right: -80px;
          animation-delay: 2s;
        }

        .blob-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, #f59e0b, #ec4899);
          top: 50%;
          left: 60%;
          animation-delay: 4s;
        }

        @keyframes blobFloat {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(30px, 20px) scale(1.05); }
        }

        .login-card {
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 2.5rem;
          width: 100%;
          max-width: 440px;
          position: relative;
          z-index: 10;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1.5rem;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          color: #818cf8;
          filter: drop-shadow(0 0 8px #818cf880);
        }

        .logo-text {
          font-size: 1.1rem;
          font-weight: 700;
          color: #e2e8f0;
          letter-spacing: -0.02em;
        }

        .login-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #f1f5f9;
          margin: 0 0 0.25rem;
          letter-spacing: -0.03em;
        }

        .login-subtitle {
          font-size: 0.875rem;
          color: #94a3b8;
          margin: 0 0 1.5rem;
        }

        .role-switcher {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 4px;
          gap: 4px;
          margin-bottom: 1.25rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .role-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border-radius: 9px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .role-btn.active {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
        }

        .role-btn:hover:not(.active) {
          color: #cbd5e1;
          background: rgba(255, 255, 255, 0.07);
        }

        .role-icon {
          width: 15px;
          height: 15px;
        }

        .alert-success {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .alert-error {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .form-group label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #cbd5e1;
          letter-spacing: 0.02em;
        }

        .optional {
          font-weight: 400;
          color: #64748b;
        }

        .form-group input {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          padding: 0.65rem 0.875rem;
          color: #f1f5f9;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.2s ease;
        }

        .form-group input::placeholder {
          color: #475569;
        }

        .form-group input:focus {
          border-color: rgba(99, 102, 241, 0.6);
          background: rgba(255, 255, 255, 0.09);
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
        }

        .password-wrap {
          position: relative;
        }

        .password-wrap input {
          width: 100%;
          padding-right: 2.5rem;
          box-sizing: border-box;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }

        .password-toggle:hover {
          color: #94a3b8;
        }

        .submit-btn {
          margin-top: 0.25rem;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 0.8rem 1.5rem;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
          letter-spacing: 0.01em;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(99, 102, 241, 0.5);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .btn-spinner {
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .mode-toggle {
          text-align: center;
          margin-top: 1.25rem;
          font-size: 0.85rem;
          color: #64748b;
        }

        .mode-toggle-btn {
          background: none;
          border: none;
          color: #818cf8;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
          font-size: inherit;
          transition: color 0.2s;
        }

        .mode-toggle-btn:hover {
          color: #a5b4fc;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
