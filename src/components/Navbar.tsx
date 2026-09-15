import Link from "next/link";
import { navItems, site } from "@/data/site";

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-panel-border bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="#topo"
          className="font-heading text-lg font-bold tracking-tight text-foreground"
        >
          {site.name}
        </Link>
        <ul className="flex items-center gap-4 text-sm sm:gap-6">
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
      </nav>
    </header>
  );
}
