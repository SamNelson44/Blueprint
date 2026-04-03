"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginValues } from "@/lib/validators";
import { cn } from "@/lib/cn";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const confirmedError = searchParams.get("error");

  const [serverError, setServerError] = useState<string | null>(
    confirmedError === "confirmation_failed"
      ? "Email confirmation failed. Please try again."
      : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(
        error.message === "Invalid login credentials"
          ? "Wrong email or password."
          : error.message
      );
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h1 className="font-sans font-black text-white uppercase text-4xl leading-tight tracking-tight">
          Welcome
          <br />
          <span className="text-[#D4FF00]">back.</span>
        </h1>
        <p className="mt-3 font-mono text-sm text-white/40">
          Sign in to your Blueprint account.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="border-2 border-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] bg-[#0A0A0A] p-6 flex flex-col gap-5"
      >
        {serverError && (
          <div className="flex items-start gap-2 border-2 border-red-500 px-3 py-2 bg-red-500/10">
            <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <span className="font-mono text-xs text-red-400">{serverError}</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className={cn(
              "w-full bg-black border-2 px-3 py-2.5 font-mono text-sm text-white placeholder-white/20 focus:outline-none transition-colors",
              errors.email ? "border-red-500" : "border-white/40 focus:border-[#D4FF00]"
            )}
          />
          {errors.email && (
            <span className="font-mono text-[10px] text-red-400">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={cn(
              "w-full bg-black border-2 px-3 py-2.5 font-mono text-sm text-white placeholder-white/20 focus:outline-none transition-colors",
              errors.password ? "border-red-500" : "border-white/40 focus:border-[#D4FF00]"
            )}
          />
          {errors.password && (
            <span className="font-mono text-[10px] text-red-400">
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "mt-1 flex items-center justify-center gap-2 py-3",
            "font-mono font-bold text-sm uppercase tracking-widest border-2",
            "transition-[transform,box-shadow] duration-75",
            isSubmitting
              ? "bg-white/10 text-white/30 border-white/20 cursor-not-allowed"
              : [
                  "bg-[#D4FF00] text-black border-black",
                  "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
                  "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                  "active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
                ]
          )}
        >
          {isSubmitting ? (
            <><Loader2 size={14} className="animate-spin" /> Signing in…</>
          ) : (
            "Sign In →"
          )}
        </button>
      </form>

      <p className="mt-6 text-center font-mono text-xs text-white/20">
        Don't have an account?{" "}
        <Link href="/signup" className="text-[#D4FF00] hover:underline">
          Create one free
        </Link>
      </p>
    </div>
  );
}
