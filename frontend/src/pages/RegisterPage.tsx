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
                  First name
                </label>

                <input
                  type="text"
                  value={firstName}
                  onChange={(event) =>
                    setFirstName(event.target.value)
                  }
                  required
                  className="vero-input"
                  placeholder="John"
                />
              </div>


              <div>
                <label className="vero-label">
                  Last name
                </label>

                <input
                  type="text"
                  value={lastName}
                  onChange={(event) =>
                    setLastName(event.target.value)
                  }
                  required
                  className="vero-input"
                  placeholder="Doe"
                />
              </div>


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
                  minLength={6}
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
                  ? "Creating account..."
                  : "Create account"}
              </button>

            </form>


            <p className="mt-8 text-sm text-neutral-600">

              Already have an account?{" "}

              <Link
                to="/login"
                className="font-semibold text-black underline underline-offset-4"
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