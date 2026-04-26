import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "../components/Navbar";
import { Hero } from "../components/Hero";
import { Marquee } from "../components/Marquee";
import { Products } from "../components/Products";
import { About } from "../components/About";
import { Footer } from "../components/Footer";
import { CartDrawer } from "../components/CartDrawer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Products />
        <About />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
