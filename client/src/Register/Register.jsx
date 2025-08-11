import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { supabase } from '../contexts/AuthContext';
import { signInWithGoogle } from '@/services/registerLoginService';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const nav = useNavigate();
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  function validateLocalEmailFormat(email) {
    return email.includes('@') && email.includes('.');
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setGeneralError('');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError('');
    setFormErrors({});

    if (!validateLocalEmailFormat(formData.email)) {
      setFormErrors((prev) => ({
        ...prev,
        email: 'Please enter a valid email format.',
      }));
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormErrors((prev) => ({
        ...prev,
        passwordMatch: 'Passwords do not match',
      }));
      setLoading(false);
      return;
    }
    if (
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.name ||
      !formData.confirmPassword
    ) {
      setGeneralError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        name: formData.name,
      };

      const result = await register(userData);

      if (result.success) {
        nav('/dashboard');
      } else {
        if (result.errors) {
          setFormErrors(result.errors);
        }
        setGeneralError(
          result.error || 'Registration failed. Please try again.'
        );
      }
    } catch (error) {
      console.error('Unexpected error in Register handleSubmit:', error);
      setGeneralError('A client-side error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    signInWithGoogle();
  };

  return (
    <div className="min-h-screen bg-base-100 ">
      <div
        data-theme="luxury"
        className="flex flex-col items-center justify-center h-screen  overflow-y-hidden  p-2 md:p-4 "
      >
        <div className="w-full max-w-xs md:max-w-sm my-auto">
          <h1 className="text-xl 2xl:text-3xl font-bold mb-2 mt-2 text-center">
            Create an account
          </h1>
          <div className="fieldset bg-base-200 border-base-300 rounded-box w-full border p-3 md:p-4 space-y-1.5 md:space-y-2">
            <div>
              <label className="label text-sm py-0.5" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="input input-sm w-full 2xl:input-lg"
                placeholder="John Doe"
                disabled={loading || googleLoading}
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-0.5">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="label text-sm py-0.5" htmlFor="username">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleInputChange}
                className="input input-sm w-full 2xl:input-lg"
                placeholder="User123"
                disabled={loading || googleLoading}
              />
              {formErrors.username && (
                <p className="text-red-500 text-xs mt-0.5">
                  {formErrors.username}
                </p>
              )}
            </div>

            <div>
              <label className="label text-sm py-0.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input input-sm w-full 2xl:input-lg"
                placeholder="user123@students.finki.ukim.mk"
                disabled={loading || googleLoading}
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-0.5">
                  {formErrors.email}
                </p>
              )}
              {!formErrors.email && (
                <p className="text-sm mt-1">*Must use your students address</p>
              )}
            </div>

            <div>
              <label className="label text-sm py-0.5" htmlFor="password">
                Password
              </label>
              <div className="relative w-full">
                <input
                  id="password"
                  name="password"
                  type={showPassword.password ? 'text' : 'password'}
                  className="input input-sm w-full pr-8 2xl:input-lg"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 h-full px-2 flex items-center z-10"
                  onClick={() => togglePasswordVisibility('password')}
                  tabIndex="-1"
                  disabled={loading || googleLoading}
                >
                  {!showPassword.password ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
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
                      className="w-4 h-4"
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
              {/* Group password errors in a single container for better spacing */}
              {(formErrors.password ||
                formErrors.passwordLength ||
                formErrors.passwordUppercase ||
                formErrors.passwordNumber) && (
                <div className="space-y-0.5 mt-0.5">
                  {formErrors.password && (
                    <p className="text-red-500 text-xs">
                      {formErrors.password}
                    </p>
                  )}
                  {formErrors.passwordLength && (
                    <p className="text-red-500 text-xs">
                      {formErrors.passwordLength}
                    </p>
                  )}
                  {formErrors.passwordUppercase && (
                    <p className="text-red-500 text-xs">
                      {formErrors.passwordUppercase}
                    </p>
                  )}
                  {formErrors.passwordNumber && (
                    <p className="text-red-500 text-xs">
                      {formErrors.passwordNumber}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="label text-sm py-0.5" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative w-full">
                <input
                  id="confirmPassword"
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="input input-sm w-full 2xl:input-lg pr-8"
                  placeholder="Confirm Password"
                  disabled={loading || googleLoading}
                />
                <button
                  type="button"
                  className="absolute top-0 right-0 h-full px-2 flex items-center z-10"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  tabIndex="-1"
                  disabled={loading || googleLoading}
                >
                  {!showPassword.confirmPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
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
                      className="w-4 h-4"
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
              {(formErrors.confirmPassword || formErrors.passwordMatch) && (
                <div className="space-y-0.5 mt-0.5">
                  {formErrors.confirmPassword && (
                    <p className="text-red-500 text-xs">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                  {formErrors.passwordMatch && (
                    <p className="text-red-500 text-xs">
                      {formErrors.passwordMatch}
                    </p>
                  )}
                </div>
              )}
            </div>
            <div
              className="w-full"
              title={
                !formData.name ||
                !formData.username ||
                !formData.email ||
                !formData.password ||
                !formData.confirmPassword
                  ? 'Please fill in all fields'
                  : ''
              }
            >
              <button
                type="button"
                onClick={handleSubmit}
                className="btn bg-black btn-md w-full flex 2xl:btn-lg items-center justify-center mt-2"
                disabled={
                  loading ||
                  googleLoading ||
                  !formData.name ||
                  !formData.username ||
                  !formData.email ||
                  !formData.password ||
                  !formData.confirmPassword
                }
              >
                {loading ? (
                  <span className="loading loading-spinner loading-xs mr-2"></span>
                ) : null}
                Register
              </button>
            </div>

            <div className="text-center flex flex-col items-center mt-1">
              <p className="text-xs mb-2">or continue with Google</p>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="btn btn-outline btn-sm 2xl:btn-md w-full text-center"
                disabled={loading || googleLoading}
              >
                {googleLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-xs"></span>
                    Redirecting...
                  </span>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3 mr-2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </>
                )}
              </button>
            </div>
          </div>

          <a
            href="/login"
            className="underline mt-1 mb-3 text-sm text-center block"
          >
            Already have an account?
          </a>
        </div>
      </div>
    </div>
  );
};
export default Register;
