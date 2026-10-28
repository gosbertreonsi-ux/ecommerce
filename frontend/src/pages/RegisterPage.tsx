import { useState } from "react";
import type { FormEvent } from "react";

import { Link, useNavigate } from "react-router-dom";

import Container from "../components/Container";
import { register } from "../api/auth.api";

type ApiError = { response?: { data?: { message?: string } } };

function RegisterPage() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register({ firstName, lastName, email, password });

      navigate("/login");
    } catch (err) {
      setError(
        (err as ApiError)?.response?.data?.message ||
          "Registration failed. Please try again.",
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
              Create your <em>account</em>
            </h1>

            <p className="mt-6 text-neutral-600">
              Join E-Shop and start shopping.
            </p>
          </div>

          <div className="max-w-md">
            {error && (
              <div className="vero-error mb-8" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="register-first-name" className="vero-label">
                  First name
                </label>

                <input
                  id="register-first-name"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  required
                  autoComplete="given-name"
                  className="vero-input"
                  placeholder="Leonce"
                />
              </div>

              <div>
                <label htmlFor="register-last-name" className="vero-label">
                  Last name
                </label>

                <input
                  id="register-last-name"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  required
                  autoComplete="family-name"
                  className="vero-input"
                  placeholder="Amani"
                />
              </div>

              <div>
                <label htmlFor="register-email" className="vero-label">
                  Email
                </label>

                <input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                  className="vero-input"
                  placeholder="leonceamani@example.com"
                />
              </div>

              <div>
                <label htmlFor="register-password" className="vero-label">
                  Password (at least 6 characters)
                </label>

                <input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="vero-input"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="vero-btn w-full"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="mt-8 text-sm text-neutral-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-black underline underline-offset-4"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default RegisterPage;