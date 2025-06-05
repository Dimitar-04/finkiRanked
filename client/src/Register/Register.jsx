import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  const [error, setError] = React.useState('');
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  function validateEmail(email) {
    return email.endsWith('@students.finki.ukim.mk');
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(formData.email)) {
      setError('Email must end with @students.finki.ukim.mk');
    }
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (data.success) {
        nav('/dashboard');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  return (
    <div
      data-theme="luxury"
      className="flex flex-col items-center justify-center"
    >
      <h1 className="text-4xl font-bold mb-6">Create an account</h1>
      <form
        onSubmit={handleSubmit}
        className="fieldset bg-base-200 border-base-300 rounded-box w-96 border p-8 space-y-6"
      >
        <div>
          <label className="label text-lg" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange}
            className="input input-lg w-full"
            placeholder="User123"
          />
        </div>

        <div>
          <label className="label text-lg" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="input input-lg w-full"
            placeholder="user123@students.finki.ukim.mk"
          />
          {error ? (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          ) : (
            <p className="text-sm mt-1">
              *Must register with your students address
            </p>
          )}
        </div>

        <div>
          <label className="label text-lg" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            className="input input-lg w-full"
            placeholder="Password"
          />
        </div>

        <div>
          <label className="label text-lg" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="input input-lg w-full"
            placeholder="Confirm Password"
          />
        </div>
        <button
          type="submit"
          className="btn bg-black btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl"
        >
          Register
        </button>
      </form>

      <Link to="/login" className="underline mt-1.5">
        Already have an account?
      </Link>
    </div>
  );
};
export default Register;
