"use client";

import { ChevronRight, Diamond, Clock, ShieldCheck, ShoppingBag, Menu, CheckCircle2 } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import CartSidebar from "../components/CartSidebar";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function OrderStatusBanner() {
  const { clearCart } = useCartStore();
  const searchParams = useSearchParams();
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status) {
      setOrderStatus(status);
      if (status === "success") {
        clearCart();
      }

      // Clear URL parameter so it doesn't stay there indefinitely
      window.history.replaceState(null, '', window.location.pathname);

      // Auto-hide the banner after 5 seconds
      setTimeout(() => setOrderStatus(null), 5000);
    }
  }, [searchParams, clearCart]);

  if (orderStatus !== "success") return null;

  return (
    <>
      <style>{`
        .navbar { margin-top: 50px !important; }
      `}</style>
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, background: "#1a472a", color: "white", padding: "1rem", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", fontWeight: 500 }}>
        <CheckCircle2 size={18} color="var(--accent-gold)" /> Your acquisition was successful. The concierge will contact you shortly regarding delivery.
      </div>
    </>
  );
}

export default function Home() {
  const { addItem, toggleCart, getItemCount } = useCartStore();

  const featuredWatches = [
    {
      id: 1,
      brand: "Patek Philippe",
      model: "Nautilus",
      price: "$125,000",
      image: "https://images.unsplash.com/photo-1548171915-e76a6a165b6d?q=80&w=800&auto=format&fit=crop",
      tag: "Rare Find"
    },
    {
      id: 2,
      brand: "Audemars Piguet",
      model: "Royal Oak Openworked",
      price: "$95,000",
      image: "https://images.unsplash.com/photo-1549972574-8e3e1ed6a215?q=80&w=800&auto=format&fit=crop",
      tag: "Boutique Exclusive"
    },
    {
      id: 3,
      brand: "Rolex",
      model: "Cosmograph Daytona",
      price: "$45,000",
      image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop",
      tag: "Iconic"
    }
  ];

  const itemCount = getItemCount();

  return (
    <main>
      <CartSidebar />
      <Suspense fallback={null}>
        <OrderStatusBanner />
      </Suspense>

      <nav className="navbar fade-in">
        <div className="container nav-container">
          <div className="logo"><span style={{ color: "var(--accent-gold)", fontWeight: 300, marginRight: "0.2rem", textTransform: "none" }}>&mu;</span>MICRON</div>
          <div className="nav-links">
            <a href="#">Collections</a>
            <a href="#">Brands</a>
            <a href="#">Concierge</a>
            <a href="#">About</a>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            <button className="btn-outline" style={{ padding: "0.5rem 1.5rem", display: "none" }}>Sign In</button>
            <div style={{ position: "relative", cursor: "pointer" }} onClick={toggleCart}>
              <ShoppingBag style={{ opacity: 0.8 }} />
              {itemCount > 0 && (
                <span style={{
                  position: "absolute", top: "-8px", right: "-8px",
                  backgroundColor: "var(--accent-gold)", color: "#000",
                  fontSize: "0.65rem", fontWeight: "bold", width: "18px", height: "18px",
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {itemCount}
                </span>
              )}
            </div>
            <Menu style={{ cursor: "pointer", display: "none" }} className="mobile-menu" />
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content container slide-up">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", color: "var(--accent-gold)", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "0.8rem", padding: "0.5rem 1rem", border: "1px solid var(--border-color)", borderRadius: "20px", background: "rgba(212, 175, 55, 0.05)" }}>
            <Diamond size={14} /> Only Authentic Pieces
          </div>
          <h1>Timeless Elegance, <br /> Redefined.</h1>
          <p>Discover our curated collection of the world's most exquisite luxury watches. Handpicked for the discerning collector.</p>
          <div className="hero-actions">
            <button className="btn-primary">Explore Collection <ChevronRight size={18} style={{ marginLeft: "0.5rem" }} /></button>
            <button className="btn-outline">View Brands</button>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "4rem", marginTop: "5rem", opacity: 0.7 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <ShieldCheck size={24} color="var(--accent-gold)" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 500, fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem" }}>Guaranteed</div>
                <div style={{ fontSize: "0.8rem", color: "#888" }}>100% Authentic</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Clock size={24} color="var(--accent-gold)" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 500, fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem" }}>Insured Shipping</div>
                <div style={{ fontSize: "0.8rem", color: "#888" }}>Worldwide Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-section container slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <h2>Featured Timepieces</h2>
          <a href="#" className="view-all">View All</a>
        </div>
        <div className="watch-grid">
          {featuredWatches.map((watch) => (
            <div key={watch.id} className="watch-card">
              <div className="watch-image-container">
                <div style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 10, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)", padding: "0.3rem 0.8rem", border: "1px solid rgba(255,255,255,0.1)", color: "var(--foreground)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>{watch.tag}</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={watch.image} alt={`${watch.brand} ${watch.model}`} className="watch-image" />
              </div>
              <div className="watch-details">
                <h3 className="watch-brand">{watch.brand}</h3>
                <p className="watch-model">{watch.model}</p>
                <div className="watch-footer">
                  <span className="watch-price">{watch.price}</span>
                  <button
                    className="btn-buy"
                    onClick={() => addItem(watch, watch.price)}
                  >
                    Acquire
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer container fade-in" style={{ animationDelay: '0.4s' }}>
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo" style={{ marginBottom: "1.5rem" }}><span style={{ color: "var(--accent-gold)", fontWeight: 300, marginRight: "0.2rem", textTransform: "none" }}>&mu;</span>MICRON</div>
            <p>Elevating the standard of luxury watch acquisition. Operating exclusively with verified collectors worldwide.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Collections</h4>
              <ul>
                <li><a href="#">New Arrivals</a></li>
                <li><a href="#">Vintage Masterpieces</a></li>
                <li><a href="#">Limited Editions</a></li>
                <li><a href="#">Complications</a></li>
              </ul>
            </div>
            <div>
              <h4>Support</h4>
              <ul>
                <li><a href="mailto:thomas.muhm@gmail.com">Contact Us</a></li>
                <li><a href="#">Shipping & Returns</a></li>
                <li><a href="#">Authenticity Guarantee</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 MICRON Timepieces Limited. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}

