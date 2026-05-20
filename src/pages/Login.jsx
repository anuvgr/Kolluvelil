import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="login-card glass-card"
      >
        <div className="login-header">
          <div className="logo-icon-large">
            <Home size={40} />
          </div>
          <h2>Kolluvelil Rentals</h2>
          <p className="text-muted">Sign in to manage your properties</p>
        </div>

        {error && <div className="error-badge">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Username</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                required 
                placeholder="Enter username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                required 
                placeholder="Enter password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          </div>

          <button type="submit" className="btn-primary login-btn">
            Sign In
          </button>
        </form>
        
      </motion.div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: var(--bg-dark);
          background-image: var(--bg-gradient);
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .login-header {
          text-align: center;
          margin-bottom: 10px;
        }
        .logo-icon-large {
          width: 70px;
          height: 70px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2));
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: var(--primary);
        }
        .login-header h2 {
          font-size: 1.8rem;
          margin-bottom: 8px;
        }
        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 16px;
          color: var(--text-muted);
        }
        .input-with-icon input {
          padding-left: 44px;
        }
        .login-btn {
          width: 100%;
          padding: 14px;
          font-size: 1.05rem;
          margin-top: 10px;
        }
        .error-badge {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          padding: 12px;
          border-radius: 10px;
          text-align: center;
          font-size: 0.9rem;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .login-footer {
          text-align: center;
          margin-top: 10px;
        }
      `}</style>
    </div>
  );
};

export default Login;
