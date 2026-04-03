import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { SignupForm } from "./SignupForm";

export const metadata: Metadata = { title: "Create Account — Blueprint" };

export default function SignupPage() {
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
      <SignupForm />
    </div>
  );
}
