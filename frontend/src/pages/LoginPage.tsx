import {
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import Container from "../components/Container";
import Button from "../components/Button";

import { useAuth } from "../context/AuthContext";


function LoginPage() {

  const navigate =
    useNavigate();

  const { login } =
    useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    setError("");
    setLoading(true);

    try {

      await login({
        email,
        password,
      });

      navigate("/");

    } catch (error: any) {

      setError(
        error?.response?.data?.message ||
        "Invalid email or password."
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <section className="py-16">

      <Container>

        <div className="mx-auto max-w-md">

          <h1 className="text-3xl font-bold">
            Welcome back
          </h1>

          <p className="mt-2 text-neutral-600">
            Sign in to your account.
          </p>


          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}


          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            <div>

              <label className="mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                placeholder="you@example.com"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-medium">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                placeholder="••••••••"
              />

            </div>


            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </Button>

          </form>


          <p className="mt-6 text-center text-sm text-neutral-600">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-semibold text-black hover:underline"
            >
              Create one
            </Link>

          </p>

        </div>

      </Container>

    </section>
  );
}

export default LoginPage;