import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Seladora3D } from "@/components/sections/Seladora3D";
import { Componentes } from "@/components/sections/Componentes";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Seladora3D />
        <Componentes />
      </main>
    </>
  );
}
