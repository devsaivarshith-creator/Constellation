import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, register, error } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(username, password, fullName);
      } else {
        await login(username, password);
      }
    } catch (err) {
      setLocalError(err.detail || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="login-page">
      <div className="login-bg-grid" />
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="url(#lg)" strokeWidth="2" fill="none" />
              <circle cx="20" cy="8" r="3" fill="#60a5fa" />
              <circle cx="8" cy="28" r="3" fill="#a78bfa" />
              <circle cx="32" cy="28" r="3" fill="#34d399" />
              <line x1="20" y1="11" x2="10" y2="26" stroke="#60a5fa" strokeWidth="1" opacity="0.6" />
              <line x1="20" y1="11" x2="30" y2="26" stroke="#34d399" strokeWidth="1" opacity="0.6" />
              <line x1="11" y1="28" x2="29" y2="28" stroke="#a78bfa" strokeWidth="1" opacity="0.6" />
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            <h1>Constellation</h1>
          </div>
          <p className="login-subtitle">Intelligence Investigation Platform</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>{isRegister ? 'Create Account' : 'Sign In'}</h2>

          {displayError && (
            <div className="login-error">{displayError}</div>
          )}

          {isRegister && (
            <div className="login-field">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Lead Intelligence Officer"
                autoComplete="name"
              />
            </div>
          )}

          <div className="login-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              minLength={3}
              autoComplete="username"
            />
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              minLength={6}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          <button className="login-submit" type="submit" disabled={loading}>
            {loading ? (
              <span className="login-spinner" />
            ) : (
              isRegister ? 'Create Account' : 'Sign In'
            )}
          </button>

          <div className="login-toggle">
            {isRegister ? (
              <span>Already have an account? <button type="button" onClick={() => { setIsRegister(false); setLocalError(''); }}>Sign In</button></span>
            ) : (
              <span>New investigator? <button type="button" onClick={() => { setIsRegister(true); setLocalError(''); }}>Create Account</button></span>
            )}
          </div>

          {!isRegister && (
            <div className="login-defaults">
              <p>Default credentials:</p>
              <code>investigator / investigator123</code>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
