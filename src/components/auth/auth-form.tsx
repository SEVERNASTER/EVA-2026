"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, signUp } from "@/app/actions/auth";

type Mode = "login" | "registro";

type AuthState = { error: string } | null;

async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const result = await signIn(formData);
  return result ?? null;
}

async function registerAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const result = await signUp(formData);
  return result ?? null;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const action = mode === "login" ? loginAction : registerAction;
  const [state, formAction, pending] = useActionState(action, null);
  const isLogin = mode === "login";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {!isLogin ? (
        <label className="flex flex-col gap-2 text-sm">
          <span className="text-zinc-400">Nombre</span>
          <input
            className="auth-field h-10 rounded-md border border-line bg-input px-3 text-sm text-foreground"
            name="full_name"
            autoComplete="name"
            required
          />
        </label>
      ) : null}

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-zinc-400">Correo</span>
        <input
          className="auth-field h-10 rounded-md border border-line bg-input px-3 text-sm text-foreground"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>

      <label className="flex flex-col gap-2 text-sm">
        <span className="text-zinc-400">Contraseña</span>
        <input
          className="auth-field h-10 rounded-md border border-line bg-input px-3 text-sm text-foreground"
          name="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={6}
          required
        />
      </label>

      {state?.error ? (
        <p className="auth-error rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      ) : null}

      <button
        className="auth-submit mt-1 h-10 rounded-md bg-white text-sm font-medium text-black disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? "Entrando…" : isLogin ? "Continuar" : "Crear cuenta"}
      </button>

      <p className="text-center text-sm text-zinc-500">
        {isLogin ? (
          <>
            ¿No tienes cuenta?{" "}
            <Link className="text-zinc-200 underline-offset-4 hover:underline" href="/registro">
              Registrarse
            </Link>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <Link className="text-zinc-200 underline-offset-4 hover:underline" href="/login">
              Iniciar sesión
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
