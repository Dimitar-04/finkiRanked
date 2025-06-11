import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
      if (authError) {
        setError(authError.message);
        return;
      }
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('user', JSON.stringify(data.user));

        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-theme="luxury"
      className="flex flex-col items-center justify-center h-screen"
    >
      <h1 className="text-4xl font-bold mb-6">Log in</h1>
      <form
        onSubmit={handleSubmit}
        className="fieldset bg-base-200 border-base-300 rounded-box w-96 border p-8 space-y-6"
      >
        <div>
          <label className="label text-lg" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input input-lg w-full"
            placeholder="user123@students.finki.ukim.mk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <p className="text-sm mt-1">*Must use your students address</p>
        </div>

        <div>
          <label className="label text-lg" htmlFor="password">
            Password
          </label>
          <div className="relative w-full">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="input input-lg w-full pr-14"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="absolute top-0 right-0 h-full px-3 flex items-center z-10"
              onClick={togglePasswordVisibility}
              tabIndex="-1"
              disabled={loading}
            >
              {!showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <button
          type="submit"
          className="btn bg-black btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="loading loading-spinner loading-xs"></span>
              Logging in...
            </span>
          ) : (
            'Log in'
          )}
        </button>
      </form>
      <Link to="/register" className="underline mt-1.5">
        Create new account
      </Link>
    </div>
  );
};

export default Login;
