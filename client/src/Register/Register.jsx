import React from 'react';
import { Link } from 'react-router-dom';

const Register = () => {
  return (
    <div
      data-theme="luxury"
      className="flex flex-col items-center justify-center"
    >
      <h1 className="text-4xl font-bold mb-6">Create an account</h1>
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-96 border p-8 spac`e-y-6">
        <div>
          <label className="label text-lg" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            type="text"
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

        <div>
          <label className="label text-lg" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            className="input input-lg w-full"
            placeholder="Confirm Password"
          />
        </div>
        <button className="btn bg-black btn-xs sm:btn-sm md:btn-md lg:btn-lg xl:btn-xl">
          Register
        </button>
      </fieldset>

      <Link to="/login" className="underline mt-1.5">
        Already have an account?
      </Link>
    </div>
  );
};
export default Register;
