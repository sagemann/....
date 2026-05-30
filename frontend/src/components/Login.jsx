import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    setError('');
    setResetSuccess('');
    setLoading(true);

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/reset-password', {
        username: forgotUsername,
        newPassword: newPassword
      });
      setResetSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotUsername('');
        setNewPassword('');
        setConfirmPassword('');
        setResetSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="page-center">
        <div className="card">
          <h1 className="heading">Reset Password</h1>
          <p className="text-small">Enter your username and create a new password</p>
          {error && <div className="error">{error}</div>}
          {resetSuccess && <div className="success">{resetSuccess}</div>}
          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label>Username</label>
              <input
                className="text-input"
                value={forgotUsername}
                onChange={(e) => setForgotUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                className="text-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input
                className="text-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={loading}
              />
            </div>
            <button type="submit" className="button" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
          <p className="link-row">
            <button 
              className="simple-link" 
              onClick={() => {
                setShowForgotPassword(false);
                setError('');
                setResetSuccess('');
              }}
              disabled={loading}
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-center">
      <div className="card">
        <h1 className="heading">app</h1>
        <p className="text-small">System Login</p>
        {error && <div className="error"> {error}</div>}
        {resetSuccess && <div className="success">{resetSuccess}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              className="text-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label> Password</label>
            <input
              className="text-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current password"
              disabled={loading}
            />
          </div>
          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="link-row">
          Don't have an account?{' '}
          <Link className="simple-link" to="/register">
            Register here
          </Link>
        </p>
        <p className="link-row">
          <button 
            className="simple-link" 
            onClick={() => setShowForgotPassword(true)}
            disabled={loading}
          >
             Forgot password?
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
