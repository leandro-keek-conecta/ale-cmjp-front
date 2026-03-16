import { isAxiosError } from "axios";
import { api } from "../api/api";

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

function resolveErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ??
      error.response?.data?.error ??
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export async function sendEmail(email: string) {
  try {
    const response = await api.post("/user/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw new Error(
      resolveErrorMessage(
        error,
        "Nao foi possivel enviar o email de recuperacao."
      )
    );
  }
}

export async function resetPassword(
  token: string,
  uid: string,
  password: string
) {
  try {
    const response = await api.post("/user/reset-password", {
      token,
      uid,
      password,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      resolveErrorMessage(error, "Nao foi possivel redefinir a senha.")
    );
  }
}
