import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/user/userSlice";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { email, password } = formData;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, status, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [userInfo, navigate]);

  const onChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(loginUser({ email, password })).unwrap();

      toast.success("Login successful");

      navigate("/");
    } catch (err) {
      toast.error(err || "Invalid email or password");
    }
  };

  return (
    <main
      className="max-w-lg h-[35rem] flex flex-col justify-center mx-auto mt-10 p-6 border border-terracotta rounded"
      role="main"
    >
      <header>
        <h1 className="text-2xl text-center font-bold mb-6">Sign in</h1>
      </header>
      <section className="mb-4">
        <a href="http://localhost:5500/auth/google">
          <button
            type="button"
            className="w-full bg-brown text-white px-4 py-2 rounded-lg"
          >
            Sign in with Google
          </button>
        </a>
      </section>

      <div className="flex items-center text-gray-500 my-4" aria-hidden="true">
        <div className="flex-grow h-px bg-gray-300" />
        <span className="px-4 text-sm">or</span>
        <div className="flex-grow h-px bg-gray-300" />
      </div>

      <form onSubmit={onSubmit} aria-label="Login Form">
        <div className="mb-4">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={onChange}
            required
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={onChange}
            required
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <button
          type="submit"
          disabled={!email || !password || status === "loading"}
          className={`w-full p-2 rounded text-white transition 
  ${
    !email || !password || status === "loading"
      ? "bg-primary/50 cursor-not-allowed"
      : "bg-primary hover:opacity-100"
  }`}
        >
          {status === "loading" ? "Loading..." : "Continue"}
        </button>
      </form>

      <footer className="mt-4 text-sm text-center">
        Don’t have an account?
        <Link to="/register" className="text-green-800 hover:underline">
          Register
        </Link>
      </footer>
    </main>
  );
};

export default Login;
