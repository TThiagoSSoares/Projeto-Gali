"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { navItems, site } from "@/data/site";

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
    <header className="fixed top-0 inset-x-0 z-50 border-b border-panel-border bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="#topo"
          className="flex items-center gap-2 font-heading text-lg font-bold tracking-tight text-foreground"
          onClick={() => setOpen(false)}
        >
          {site.name}
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
        </Link>

        <ul className="hidden items-center gap-6 text-sm md:flex">
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-muted transition hover:text-accent"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center text-foreground md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
            {open ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>
    </header>

    {open && (
      <ul className="fixed inset-x-0 top-14 bottom-0 z-40 flex flex-col gap-1 overflow-y-auto bg-background px-4 py-4 text-base md:hidden">
        {navItems.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-2 py-3.5 text-muted transition hover:bg-panel hover:text-foreground"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    )}
    </>
  );
}
