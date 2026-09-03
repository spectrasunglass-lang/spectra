import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BenefitsBar from "@/components/BenefitsBar";
import { CartProvider } from "@/components/CartContext";
import CartDrawer from "@/components/CartDrawer";
import PreIntro from "@/components/PreIntro";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {/* Luxury Pre-Intro Splash Screen (plays on first visit of session) */}
      <PreIntro />

      <div
        id="spectra-store-root"
        className="min-h-full flex flex-col bg-[#0a0a0a] text-neutral-100 font-sans"
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <BenefitsBar />
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
