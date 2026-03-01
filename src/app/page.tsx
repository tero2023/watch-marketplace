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

  const [featuredWatches, setFeaturedWatches] = useState<any[]>([]);

  useEffect(() => {
    async function loadWatches() {
      try {
        const res = await fetch('/api/watches');
        const data = await res.json();
        setFeaturedWatches(data);
      } catch (err) {
        console.error("Error loading watches:", err);
      }
    }
    loadWatches();
  }, []);
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
          <div className="nav-actions">
            {session ? (
              <div className="auth-actions">
                <span className="welcome-text">Bienvenido, <strong style={{ color: "var(--accent-red)", fontWeight: 400 }}>{session.user?.name?.split(' ')[0] || "Coleccionista"}</strong></span>
                <button className="btn-outline auth-btn" onClick={() => signOut()}>Cerrar Sesión</button>
              </div>
            ) : (
              <button className="btn-outline auth-btn" onClick={() => router.push("/signin")}>Iniciar Sesión</button>
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
          <div className="hero-badge">
            <Diamond size={14} /> Solo Piezas Auténticas
          </div>
          <h1>Elegancia Atemporal, <br /> Redefinida.</h1>
          <p>Descubra nuestra colección curada de los relojes de lujo más exquisitos del mundo. Seleccionados a mano para el coleccionista más exigente.</p>
          <div className="hero-actions">
            <button className="btn-primary">Explorar Colección <ChevronRight size={18} style={{ marginLeft: "0.5rem" }} /></button>
            <button className="btn-outline">Ver Marcas</button>
          </div>

          <div className="hero-features">
            <div className="feature-item">
              <ShieldCheck size={24} color="var(--accent-red)" className="feature-icon" />
              <div className="feature-text">
                <div className="feature-title">Garantía</div>
                <div className="feature-subtitle">100% Auténtico</div>
              </div>
            </div>
            <div className="feature-item">
              <Clock size={24} color="var(--accent-red)" className="feature-icon" />
              <div className="feature-text">
                <div className="feature-title">Envío Asegurado</div>
                <div className="feature-subtitle">Entrega Mundial</div>
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
              className={`watch-card scroll-reveal ${watch.stock <= 0 ? 'sold-out' : ''}`}
              style={{ transitionDelay: `${index * 0.15}s`, opacity: watch.stock <= 0 ? 0.6 : 1 }}
              ref={(el) => { revealRefs.current[index + 1] = el; }}
            >
              <div className="watch-image-container">
                {watch.stock <= 0 && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--accent-red)', color: 'white', padding: '0.4rem 0.8rem', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', zIndex: 10, borderRadius: '4px' }}>
                    AGOTADO
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={watch.image} alt={`${watch.brand} ${watch.model}`} className="watch-image" />
              </div>
              <div className="watch-details">
                <h3 className="watch-brand">{watch.brand}</h3>
                <p className="watch-model">{watch.model}</p>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.2rem', marginBottom: '0.5rem' }}>
                  En stock: {watch.stock}
                </p>
                <div className="watch-footer">
                  <span className="watch-price">{watch.price}</span>
                  <button
                    className="btn-buy"
                    onClick={() => addItem(watch, watch.price)}
                    disabled={watch.stock <= 0}
                    style={{ opacity: watch.stock <= 0 ? 0.5 : 1, cursor: watch.stock <= 0 ? 'not-allowed' : 'pointer' }}
                  >
                    COMPRAR
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
