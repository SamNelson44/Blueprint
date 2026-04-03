import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Sign In — Blueprint" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="relative z-10">
        <Navbar />
      </div>
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-16">
        {/* Suspense required because LoginForm reads useSearchParams */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
