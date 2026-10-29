import { useState } from "react";

import { AuthUser } from "../interfaces/auth.interface";
import { login } from "../services/auth.service";

export const useLoginViewModel = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (): Promise<AuthUser | null> => {
    if (isLoading) return null;

    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Todos los campos son obligatorios.");
      return null;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage("Ingrese un correo electrónico válido.");
      return null;
    }

    if (password.length < 8) {
      setErrorMessage("La contraseña debe contener al menos 8 caracteres.");
      return null;
    }

    setIsLoading(true);

    try {
      const user = await login(email, password);
      return user;
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al iniciar sesión.",
      );

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    errorMessage,
    handleLogin,
  };
};
