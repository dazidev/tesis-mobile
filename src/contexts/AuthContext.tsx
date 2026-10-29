import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { setSessionExpiredHandler } from "../infrastructure/api";
import { AuthUser } from "../interfaces/auth.interface";
import { logoutSession, restoreSession } from "../services/auth.service";

interface AuthContextProps {
  user: AuthUser | null;
  isRestoring: boolean;
  restoreError: boolean;
  signIn: (user: AuthUser) => void;
  signOut: () => Promise<boolean>;
  retryRestore: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [restoreError, setRestoreError] = useState(false);

  const initialized = useRef(false);

  const retryRestore = useCallback(async () => {
    setIsRestoring(true);
    setRestoreError(false);

    try {
      const sessionUser = await restoreSession();
      setUser(sessionUser);
    } catch {
      setRestoreError(true);
    } finally {
      setIsRestoring(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;

    initialized.current = true;
    void retryRestore();
  }, [retryRestore]);

  const signIn = (authenticatedUser: AuthUser) => {
    setUser(authenticatedUser);
  };

  const signOut = async (): Promise<boolean> => {
    try {
      return await logoutSession();
    } finally {
      setUser(null);
    }
  };

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
    });

    return () => {
      setSessionExpiredHandler(null);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isRestoring,
        restoreError,
        signIn,
        signOut,
        retryRestore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
