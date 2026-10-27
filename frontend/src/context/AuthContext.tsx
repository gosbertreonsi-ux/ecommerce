import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  login as loginApi,
  register as registerApi,
  type LoginPayload,
  type RegisterPayload,
  type AuthUser,
} from "../api/auth.api";


interface AuthContextType {
  user: AuthUser | null;

  token: string | null;

  loading: boolean;

  login: (
    payload: LoginPayload,
  ) => Promise<void>;

  register: (
    payload: RegisterPayload,
  ) => Promise<void>;

  logout: () => void;

  isAuthenticated: boolean;
}


const AuthContext =
  createContext<
    AuthContextType | undefined
  >(undefined);


interface AuthProviderProps {
  children: ReactNode;
}


export function AuthProvider({
  children,
}: AuthProviderProps) {

  const [
    user,
    setUser,
  ] = useState<AuthUser | null>(null);


  const [
    token,
    setToken,
  ] = useState<string | null>(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  /*
  |--------------------------------------------------------------------------
  | RESTORE AUTHENTICATION
  |--------------------------------------------------------------------------
  |
  | When the browser refreshes, React state is destroyed.
  |
  | We therefore restore the customer session from localStorage.
  |
  */

  useEffect(() => {

    try {

      const storedToken =
        localStorage.getItem(
          "token",
        );


      const storedUser =
        localStorage.getItem(
          "user",
        );


      if (storedToken) {

        setToken(
          storedToken,
        );

      }


      if (storedUser) {

        try {

          const parsedUser =
            JSON.parse(
              storedUser,
            ) as AuthUser;


          setUser(
            parsedUser,
          );

        } catch {

          localStorage.removeItem(
            "user",
          );

        }

      }

    } finally {

      setLoading(false);

    }

  }, []);


  /*
  |--------------------------------------------------------------------------
  | LOGIN
  |--------------------------------------------------------------------------
  */

  const login = async (
    payload: LoginPayload,
  ) => {

    const result =
      await loginApi(
        payload,
      );


    /*
     * Save authentication
     * permanently for this browser
     * until logout.
     */

    localStorage.setItem(
      "token",
      result.token,
    );


    localStorage.setItem(
      "user",
      JSON.stringify(
        result.user,
      ),
    );


    /*
     * Update React state
     * immediately.
     */

    setToken(
      result.token,
    );


    setUser(
      result.user,
    );

  };


  /*
  |--------------------------------------------------------------------------
  | REGISTER
  |--------------------------------------------------------------------------
  */

  const register = async (
    payload: RegisterPayload,
  ) => {

    const result =
      await registerApi(
        payload,
      );


    /*
     * Some registration
     * implementations return
     * a token while others may
     * require login afterwards.
     */

    if (result.token) {

      localStorage.setItem(
        "token",
        result.token,
      );


      setToken(
        result.token,
      );

    }


    localStorage.setItem(
      "user",
      JSON.stringify(
        result.user,
      ),
    );


    setUser(
      result.user,
    );

  };


  /*
  |--------------------------------------------------------------------------
  | LOGOUT
  |--------------------------------------------------------------------------
  */

  const logout = () => {

    /*
     * Clear only authentication
     * information.
     *
     * Orders remain safely stored
     * in PostgreSQL.
     */

    localStorage.removeItem(
      "token",
    );


    localStorage.removeItem(
      "user",
    );


    setToken(
      null,
    );


    setUser(
      null,
    );

  };


  /*
  |--------------------------------------------------------------------------
  | PROVIDER
  |--------------------------------------------------------------------------
  */

  return (
    <AuthContext.Provider
      value={{
        user,

        token,

        loading,

        login,

        register,

        logout,

        isAuthenticated:
          Boolean(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}


/*
|--------------------------------------------------------------------------
| USE AUTH
|--------------------------------------------------------------------------
*/

export function useAuth() {

  const context =
    useContext(
      AuthContext,
    );


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider",
    );

  }


  return context;
}