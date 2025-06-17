import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../contexts/AuthContext";
import { registerUser } from "@/services/registerLoginService";

const Register = () => {
  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
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
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  function validateLocalEmailFormat(email) {
    return email.includes("@") && email.includes(".");
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
    setGeneralError("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError("");
    setFormErrors({});

    if (!validateLocalEmailFormat(formData.email)) {
      setFormErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email format.",
      }));
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setFormErrors((prev) => ({
        ...prev,
        passwordMatch: "Passwords do not match",
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
      setGeneralError("Please fill in all required fields.");
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

      const data = await registerUser(userData);

      localStorage.setItem("user", JSON.stringify(data.user));
      let registrationAttemptError = "";

      try {
        registrationAttemptError = "";
        const { data: authData, error: supabaseError } =
          await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

        if (supabaseError) {
          console.error(
            "Supabase sign-in error after registration:",
            supabaseError
          );
          registrationAttemptError =
            "Registration successful, but Supabase session could not be started. Please try logging in.";
          setGeneralError(registrationAttemptError);
        } else if (authData.session?.access_token) {
          localStorage.setItem("jwt", authData.session.access_token);
        } else {
          console.warn(
            "Supabase session or access token missing after sign-in."
          );
          registrationAttemptError =
            "Registration successful, but session token is missing. Please try logging in.";
          setGeneralError(registrationAttemptError);
        }
      } catch (supabaseCatchError) {
        console.error("Supabase auth error (caught):", supabaseCatchError);
        registrationAttemptError =
          "Registration successful, but an error occurred starting your session. Please try logging in.";
        setGeneralError(registrationAttemptError);
      }

      if (registrationAttemptError === "") {
        const user = localStorage.getItem("user");

        nav("/dashboard");
      }
    } catch (apiError) {
      console.error("Registration API error:", apiError);
      if (apiError.response && apiError.response.data) {
        const responseData = apiError.response.data;
        if (responseData.errors) {
          setFormErrors(responseData.errors);
          setGeneralError(
            responseData.message || "Please correct the highlighted errors."
          );
        } else {
          setGeneralError(
            responseData.message || "Registration failed. Please try again."
          );
        }
      } else {
        setGeneralError(
          "Registration failed due to a network or server error. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-base-100">
      <div
        data-theme="luxury"
        className="flex flex-col items-center justify-center h-screen overflow-y-auto"
      >
        <h1 className="text-4xl font-bold mb-6">Create an account</h1>
        <form
          onSubmit={handleSubmit}
          className="fieldset bg-base-200 border-base-300 rounded-box w-96 border p-8 space-y-6"
        >
          <div>
            <label className="label text-lg" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              className="input input-lg w-full"
              placeholder="John Doe"
              disabled={loading}
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

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
              disabled={loading}
            />
            {formErrors.username && (
              <p className="text-red-500 text-xs mt-1">{formErrors.username}</p>
            )}
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
              disabled={loading}
            />
            {formErrors.email && (
              <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="label text-lg" htmlFor="password">
              Password
            </label>
            <div className="relative w-full">
              <input
                id="password"
                name="password"
                type={showPassword.password ? "text" : "password"}
                className="input input-lg w-full pr-14"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
              />
              <button
                type="button"
                className="absolute top-0 right-0 h-full px-3 flex items-center z-10"
                onClick={() => togglePasswordVisibility("password")}
                tabIndex="-1"
                disabled={loading}
              >
                {!showPassword.password ? (
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
            {formErrors.password && (
              <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
            )}
            {formErrors.passwordLength && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.passwordLength}
              </p>
            )}
            {formErrors.passwordUppercase && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.passwordUppercase}
              </p>
            )}
            {formErrors.passwordNumber && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.passwordNumber}
              </p>
            )}
          </div>

          <div>
            <label className="label text-lg" htmlFor="confirmPassword">
              {" "}
              Confirm Password
            </label>
            <div className="relative w-full">
              <input
                id="confirmPassword"
                type={showPassword.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="input input-lg w-full"
                placeholder="Confirm Password"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute top-0 right-0 h-full px-3 flex items-center z-10"
                onClick={() => togglePasswordVisibility("confirmPassword")}
                tabIndex="-1"
                disabled={loading}
              >
                {!showPassword.confirmPassword ? (
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
            {formErrors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.confirmPassword}
              </p>
            )}
            {formErrors.passwordMatch && (
              <p className="text-red-500 text-xs mt-1">
                {formErrors.passwordMatch}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn bg-black btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl w-full flex items-center justify-center" // Added w-full for consistency
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-md mr-2"></span>
            ) : null}
            Register
          </button>

          {!generalError && Object.keys(formErrors).length === 0 && (
            <p className="text-sm mt-1 text-center">
              {" "}
              *Must register with your FINKI student email address.
            </p>
          )}
        </form>

        <Link to="/login" className="underline mt-1.5">
          Already have an account?
        </Link>
      </div>
    </div>
  );
};
export default Register;
