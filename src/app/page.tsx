"use client";

import { ChevronRight, Diamond, Clock, ShieldCheck, ShoppingBag, Menu, CheckCircle2 } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import CartSidebar from "../components/CartSidebar";
import React, { useEffect, useState, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

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
        <CheckCircle2 size={18} color="var(--accent-red)" /> Su adquisición fue exitosa. Nuestro conserje se comunicará con usted en breve sobre la entrega.
      </div>
    </>
  );
}

export default function Home() {
  const { addItem, toggleCart, getItemCount } = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();

  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1,
    };

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Create a stable copy of current refs to avoid cleanup issues
    const elements = revealRefs.current;
    elements.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const featuredWatches = [
    {
      id: 1,
      brand: "Patek Philippe",
      model: "Nautilus",
      price: "$125,000",
      image: "https://images.unsplash.com/photo-1548171915-e76a6a165b6d?q=80&w=800&auto=format&fit=crop",
      tag: "Hallazgo Raro"
    },
    {
      id: 2,
      brand: "Audemars Piguet",
      model: "Royal Oak Openworked",
      price: "$95,000",
      image: "https://images.unsplash.com/photo-1549972574-8e3e1ed6a215?q=80&w=800&auto=format&fit=crop",
      tag: "Exclusivo Boutique"
    },
    {
      id: 3,
      brand: "Rolex",
      model: "Cosmograph Daytona",
      price: "$45,000",
      image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800&auto=format&fit=crop",
      tag: "Icónico"
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
          <div className="animated-logo">
            <div className="logo-icon">
              <div className="watch-face">
                <div className="logo-hand minute"></div>
                <div className="logo-hand hour"></div>
              </div>
              <span className="mu-symbol">&mu;</span>
            </div>
            <span className="brand-text">MICRON</span>
          </div>
          <div className="nav-links">
            <a href="#">Colecciones</a>
            <a href="#">Marcas</a>
            <a href="#">Servicios</a>
            <a href="#">Nosotros</a>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
            {session ? (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "0.9rem", color: "#888", letterSpacing: "0.05em" }}>Bienvenido, <strong style={{ color: "var(--accent-red)", fontWeight: 400 }}>{session.user?.name?.split(' ')[0] || "Coleccionista"}</strong></span>
                <button className="btn-outline" onClick={() => signOut()} style={{ padding: "0.5rem 1.5rem" }}>Cerrar Sesión</button>
              </div>
            ) : (
              <button className="btn-outline" onClick={() => router.push("/signin")} style={{ padding: "0.5rem 1.5rem" }}>Iniciar Sesión</button>
            )}
            <div style={{ position: "relative", cursor: "pointer" }} onClick={toggleCart}>
              <ShoppingBag style={{ opacity: 0.8 }} />
              {itemCount > 0 && (
                <span style={{
                  position: "absolute", top: "-8px", right: "-8px",
                  backgroundColor: "var(--accent-red)", color: "#fff",
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
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", color: "var(--accent-red)", letterSpacing: "0.2em", textTransform: "uppercase", fontSize: "0.8rem", padding: "0.5rem 1rem", border: "1px solid var(--border-color)", borderRadius: "20px", background: "rgba(0, 0, 0, 0.03)" }}>
            <Diamond size={14} /> Solo Piezas Auténticas
          </div>
          <h1>Elegancia Atemporal, <br /> Redefinida.</h1>
          <p>Descubra nuestra colección curada de los relojes de lujo más exquisitos del mundo. Seleccionados a mano para el coleccionista más exigente.</p>
          <div className="hero-actions">
            <button className="btn-primary">Explorar Colección <ChevronRight size={18} style={{ marginLeft: "0.5rem" }} /></button>
            <button className="btn-outline">Ver Marcas</button>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "4rem", marginTop: "5rem", opacity: 0.7 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <ShieldCheck size={24} color="var(--accent-red)" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 500, fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem" }}>Garantía</div>
                <div style={{ fontSize: "0.8rem", color: "#888" }}>100% Auténtico</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <Clock size={24} color="var(--accent-red)" />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 500, fontFamily: "var(--font-sans)", textTransform: "uppercase", letterSpacing: "0.1em", fontSize: "0.8rem" }}>Envío Asegurado</div>
                <div style={{ fontSize: "0.8rem", color: "#888" }}>Entrega Mundial</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="featured-section container">
        <div
          className="section-header scroll-reveal"
          ref={(el) => { revealRefs.current[0] = el; }}
        >
          <h2>Piezas Destacadas</h2>
          <a href="#" className="view-all">Ver Todas</a>
        </div>
        <div className="watch-grid">
          {featuredWatches.map((watch, index) => (
            <div
              key={watch.id}
              className="watch-card scroll-reveal"
              style={{ transitionDelay: `${index * 0.15}s` }}
              ref={(el) => { revealRefs.current[index + 1] = el; }}
            >
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
                    Adquirir
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
            <div className="animated-logo" style={{ marginBottom: "1.5rem" }}>
              <div className="logo-icon">
                <div className="watch-face">
                  <div className="logo-hand minute"></div>
                  <div className="logo-hand hour"></div>
                </div>
                <span className="mu-symbol">&mu;</span>
              </div>
              <span className="brand-text-footer">MICRON</span>
            </div>
            <p>Elevando el estándar en la adquisición de relojes de lujo. Operando exclusivamente con coleccionistas verificados en todo el mundo.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Colecciones</h4>
              <ul>
                <li><a href="#">Recién Llegados</a></li>
                <li><a href="#">Obras Maestras Vintage</a></li>
                <li><a href="#">Ediciones Limitadas</a></li>
                <li><a href="#">Complicaciones</a></li>
              </ul>
            </div>
            <div>
              <h4>Soporte</h4>
              <ul>
                <li><a href="mailto:thomas.muhm@gmail.com">Contáctenos</a></li>
                <li><a href="#">Envíos y Devoluciones</a></li>
                <li><a href="#">Garantía de Autenticidad</a></li>
                <li><a href="#">Preguntas Frecuentes</a></li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Términos de Servicio</a></li>
                <li><a href="#">Política de Privacidad</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 MICRON Timepieces Limited. Todos los derechos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
