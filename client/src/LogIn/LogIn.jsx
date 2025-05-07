import React from "react";
import { Link } from "react-router-dom";

const Login = () => {
  return (
    <div
      data-theme="luxury"
      className="flex flex-col items-center justify-center h-screen"
    >
      <h1 className="text-4xl font-bold mb-6">Create an account</h1>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-96 border p-8 space-y-6">
        <div>
          <label className="label text-lg" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input input-lg w-full"
            placeholder="user123@students.finki.ukim.mk"
          />
          <p className="text-sm mt-1">
            *Must register with your students address
          </p>
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
          />
        </div>
        <button className="btn bg-black btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">
          Log in
        </button>
      </fieldset>
      <Link to="/register" className="underline mt-1.5">
        Create new account
      </Link>
    </div>
  );
};
export default Login;
