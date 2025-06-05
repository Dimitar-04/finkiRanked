import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        console.log(data);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login.');
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
          />
          <p className="text-sm mt-1">*Must use your students address</p>
        </div>

        <div>
          <label className="label text-lg" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input input-lg w-full"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <button
          type="submit"
          className="btn bg-black btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
        >
          Log in
        </button>
      </form>
      <Link to="/register" className="underline mt-1.5">
        Create new account
      </Link>
    </div>
  );
};
export default Login;
