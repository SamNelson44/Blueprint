"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { AlertCircle, Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signupSchema, type SignupValues } from "@/lib/validators";
import { cn } from "@/lib/cn";

export function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({ resolver: zodResolver(signupSchema) });

  async function onSubmit(values: SignupValues) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setCheckEmail(true);
  }

  if (checkEmail) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md border-2 border-[#D4FF00] shadow-[6px_6px_0px_0px_#D4FF00] bg-[#0A0A0A] p-8 flex flex-col items-center gap-5 text-center">
          <MailCheck size={32} className="text-[#D4FF00]" />
          <h2 className="font-sans font-black text-white text-2xl uppercase tracking-tight">
            Check your email.
          </h2>
          <p className="font-mono text-sm text-white/50 leading-relaxed">
            We sent a confirmation link. Click it to activate your account —
            you'll land straight on your dashboard.
          </p>
          <Link href="/login" className="font-mono text-xs text-[#D4FF00] hover:underline">
            ← Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="font-sans font-black text-white uppercase text-4xl leading-tight tracking-tight">
            Start
            <br />
            <span className="text-[#D4FF00]">building.</span>
          </h1>
          <p className="mt-3 font-mono text-sm text-white/40">
            Create your free Blueprint account.
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
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Email</label>
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
            {errors.email && <span className="font-mono text-[10px] text-red-400">{errors.email.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Password</label>
            <input
              {...register("password")}
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className={cn(
                "w-full bg-black border-2 px-3 py-2.5 font-mono text-sm text-white placeholder-white/20 focus:outline-none transition-colors",
                errors.password ? "border-red-500" : "border-white/40 focus:border-[#D4FF00]"
              )}
            />
            {errors.password && <span className="font-mono text-[10px] text-red-400">{errors.password.message}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">Confirm Password</label>
            <input
              {...register("confirmPassword")}
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              className={cn(
                "w-full bg-black border-2 px-3 py-2.5 font-mono text-sm text-white placeholder-white/20 focus:outline-none transition-colors",
                errors.confirmPassword ? "border-red-500" : "border-white/40 focus:border-[#D4FF00]"
              )}
            />
            {errors.confirmPassword && <span className="font-mono text-[10px] text-red-400">{errors.confirmPassword.message}</span>}
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
              <><Loader2 size={14} className="animate-spin" /> Creating account…</>
            ) : (
              "Create Account →"
            )}
          </button>

          <p className="text-center font-mono text-[10px] text-white/20">
            By signing up you agree to our Terms of Service.
          </p>
        </form>

        <p className="mt-6 text-center font-mono text-xs text-white/20">
          Already have an account?{" "}
          <Link href="/login" className="text-[#D4FF00] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
