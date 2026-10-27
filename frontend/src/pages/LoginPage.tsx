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
    <section className="py-16 sm:py-24">

      <Container>

        <div className="grid gap-14 md:grid-cols-2 md:items-end">

          <div>
            <h1>
              Welcome <em>back</em>
            </h1>

            <p className="mt-6 text-neutral-600">
              Sign in to your account.
            </p>
          </div>


          <div className="max-w-md">

            {error && (
              <div className="vero-error mb-8">
                {error}
              </div>
            )}


            <form
              onSubmit={handleSubmit}
              className="space-y-8"
            >

              <div>
                <label className="vero-label">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                  className="vero-input"
                  placeholder="you@example.com"
                />
              </div>


              <div>
                <label className="vero-label">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                  className="vero-input"
                  placeholder="••••••••"
                />
              </div>


              <button
                type="submit"
                className="vero-btn w-full"
                disabled={loading}
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}
              </button>

            </form>


            <p className="mt-8 text-sm text-neutral-600">

              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-semibold text-black underline underline-offset-4"
              >
                Create one
              </Link>

            </p>

          </div>

        </div>

      </Container>

    </section>
  );
}

export default LoginPage;