"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { profileSchema, type ProfileValues } from "@/lib/validators";
import { updateProfile } from "@/lib/supabase/actions";
import { cn } from "@/lib/cn";

interface SettingsFormProps {
  defaultValues: ProfileValues;
  email: string;
}

export function SettingsForm({ defaultValues, email }: SettingsFormProps) {
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  async function onSubmit(values: ProfileValues) {
    setStatus("idle");
    setServerError(null);
    try {
      await updateProfile(values);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Update failed");
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border-2 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] bg-[#0A0A0A] p-6 flex flex-col gap-6"
    >
      {/* Account email — read-only */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
          Email
        </label>
        <div className="w-full bg-black/50 border-2 border-white/20 px-3 py-2.5 font-mono text-sm text-white/40 cursor-not-allowed">
          {email}
        </div>
        <span className="font-mono text-[10px] text-white/20">
          Email cannot be changed here.
        </span>
      </div>

      {/* Full name */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
          Display Name
        </label>
        <input
          {...register("full_name")}
          placeholder="Your full name"
          className={cn(
            "w-full bg-black border-2 px-3 py-2.5",
            "font-sans font-bold text-sm text-white placeholder-white/20",
            "focus:outline-none transition-colors",
            errors.full_name ? "border-red-500" : "border-white/40 focus:border-[#D4FF00]"
          )}
        />
        {errors.full_name && (
          <span className="flex items-center gap-1 font-mono text-[10px] text-red-400">
            <AlertCircle size={10} /> {errors.full_name.message}
          </span>
        )}
        <span className="font-mono text-[10px] text-white/20">
          Shown on your published blueprint pages.
        </span>
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
          Bio
        </label>
        <textarea
          {...register("bio")}
          rows={4}
          placeholder="Tell learners who you are and what you teach…"
          className={cn(
            "w-full resize-none bg-black border-2 px-3 py-2.5",
            "font-mono text-sm text-white/70 placeholder-white/20 leading-relaxed",
            "focus:outline-none transition-colors",
            errors.bio ? "border-red-500" : "border-white/40 focus:border-[#D4FF00]"
          )}
        />
        {errors.bio && (
          <span className="flex items-center gap-1 font-mono text-[10px] text-red-400">
            <AlertCircle size={10} /> {errors.bio.message}
          </span>
        )}
      </div>

      {/* Avatar URL */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[10px] text-white/40 uppercase tracking-widest">
          Avatar URL
        </label>
        <input
          {...register("avatar_url")}
          type="url"
          placeholder="https://…"
          className={cn(
            "w-full bg-black border-2 px-3 py-2.5",
            "font-mono text-sm text-white placeholder-white/20",
            "focus:outline-none transition-colors",
            errors.avatar_url ? "border-red-500" : "border-white/40 focus:border-[#D4FF00]"
          )}
        />
        {errors.avatar_url && (
          <span className="flex items-center gap-1 font-mono text-[10px] text-red-400">
            <AlertCircle size={10} /> {errors.avatar_url.message}
          </span>
        )}
        <span className="font-mono text-[10px] text-white/20">
          Paste any publicly accessible image URL.
        </span>
      </div>

      {/* Feedback */}
      {serverError && (
        <div className="flex items-start gap-2 border-2 border-red-500 px-3 py-2 bg-red-500/10">
          <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
          <span className="font-mono text-xs text-red-400">{serverError}</span>
        </div>
      )}

      {/* Submit */}
      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className={cn(
            "flex items-center gap-2 px-6 py-3",
            "font-mono font-bold text-sm uppercase tracking-widest border-2",
            "transition-[transform,box-shadow] duration-75",
            isSubmitting || !isDirty
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
            <><Loader2 size={14} className="animate-spin" /> Saving…</>
          ) : (
            "Save Changes"
          )}
        </button>

        {status === "saved" && (
          <span className="flex items-center gap-1.5 font-mono text-sm text-[#D4FF00]">
            <CheckCircle size={14} /> Saved
          </span>
        )}
      </div>
    </form>
  );
}
