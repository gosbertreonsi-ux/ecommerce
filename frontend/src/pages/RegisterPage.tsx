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

import {
  register,
} from "../api/auth.api";


function RegisterPage() {

  const navigate = useNavigate();

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

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

      await register({
        firstName,
        lastName,
        email,
        password,
      });

      navigate("/login");

    } catch (error: any) {

      const message =
        error?.response?.data?.message ||
        "Registration failed. Please try again.";

      setError(message);

    } finally {

      setLoading(false);

    }
  };


  return (
    <section className="py-16">

      <Container>

        <div className="mx-auto max-w-md">

          <h1 className="text-3xl font-bold">
            Create your account
          </h1>

          <p className="mt-2 text-neutral-600">
            Join E-Shop and start shopping.
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

            {/* First name */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                First name
              </label>

              <input
                type="text"
                value={firstName}
                onChange={(event) =>
                  setFirstName(event.target.value)
                }
                required
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                placeholder="John"
              />

            </div>


            {/* Last name */}

            <div>

              <label className="mb-2 block text-sm font-medium">
                Last name
              </label>

              <input
                type="text"
                value={lastName}
                onChange={(event) =>
                  setLastName(event.target.value)
                }
                required
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                placeholder="Doe"
              />

            </div>


            {/* Email */}

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


            {/* Password */}

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
                minLength={6}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 outline-none focus:border-black"
                placeholder="••••••••"
              />

            </div>


            {/* Submit */}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </Button>

          </form>


          <p className="mt-6 text-center text-sm text-neutral-600">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-black hover:underline"
            >
              Sign in
            </Link>

          </p>

        </div>

      </Container>

    </section>
  );
}


export default RegisterPage;