import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/supabase/actions";

/**
 * Shared top navigation — server component so auth state is always accurate.
 * Import directly into any page that needs it.
 */
export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b-2 border-white bg-[#0A0A0A]">
      {/* Logo */}
      <Link
        href="/"
        className="font-sans font-black text-white text-lg uppercase tracking-tight hover:text-[#D4FF00] transition-colors"
      >
        Blueprint<span className="text-[#D4FF00]">.</span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-1">
        <NavLink href="/blueprints">Explore</NavLink>

        {user ? (
          <>
            <NavLink href="/dashboard">Dashboard</NavLink>
            <NavLink href="/dashboard/settings">Settings</NavLink>
            <form action={signOut}>
              <button
                type="submit"
                className="font-mono text-sm text-white/40 hover:text-[#D4FF00] px-3 py-1.5 transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </>
        ) : (
          <>
            <NavLink href="/login">Sign in</NavLink>
            <Link
              href="/signup"
              className={[
                "ml-2 font-mono text-xs font-bold uppercase tracking-widest px-4 py-2",
                "bg-[#D4FF00] text-black border-2 border-black",
                "shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]",
                "hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                "transition-[transform,box-shadow] duration-75",
              ].join(" ")}
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="font-mono text-sm text-white/50 hover:text-[#D4FF00] px-3 py-1.5 transition-colors"
    >
      {children}
    </Link>
  );
}
