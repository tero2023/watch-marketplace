"use client";

import { X, ShoppingBag, Trash2, Lock } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CartSidebar() {
    const { items, isOpen, toggleCart, removeItem, getCartTotal } = useCartStore();
    const { data: session } = useSession();
    const router = useRouter();

    if (!isOpen) return null;

    const total = getCartTotal();
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const handleCheckout = async () => {
        if (!session) {
            router.push("/signin");
            toggleCart();
            return;
        }

        try {
            // We will implement this API route next
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url; // Redirect to MercadoPago
            } else {
                console.error("No checkout URL returned", data);
                alert("Faltan las credenciales de configuración de pago. Configure sus claves de MercadoPago en el archivo .env.");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Hubo un error al inicializar el pago.");
        }
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm transition-opacity"
                onClick={toggleCart}
                style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(4px)' }}
            />
            <div
                className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] shadow-2xl z-50 flex flex-col items-stretch transform transition-transform duration-300"
                style={{ position: 'fixed', top: 0, right: 0, height: '100%', width: '100%', maxWidth: '450px', backgroundColor: '#050505', zIndex: 101, borderLeft: '1px solid rgba(212, 175, 55, 0.15)', display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShoppingBag color="var(--accent-gold)" />
                        <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', letterSpacing: '0.05em' }}>Su Archivo de Adquisición</h2>
                    </div>
                    <button onClick={toggleCart} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '0.5rem' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#666', marginTop: '4rem', fontFamily: 'var(--font-sans)' }}>
                            <p>Su archivo de adquisición está actualmente vacío.</p>
                            <button onClick={toggleCart} className="btn-outline" style={{ marginTop: '2rem' }}>Explorar Colección</button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: '80px', height: '100px', backgroundColor: '#000', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                                    <img src={item.image} alt={item.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <p style={{ color: 'var(--accent-gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{item.brand}</p>
                                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.model}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                        <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Cant: {item.quantity}</p>
                                        <p style={{ fontFamily: 'var(--font-sans)', fontWeight: 300, fontSize: '1rem' }}>{formatPrice(item.price)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', alignSelf: 'center', padding: '0.5rem' }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div style={{ padding: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(20,20,20,0.8)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)' }}>
                            <span style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>Subtotal</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 300 }}>{formatPrice(total)}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '1.5rem', textAlign: 'center' }}>
                            El envío y el seguro de entrega se calcularán al pagar.
                        </p>
                        <button
                            className="btn-primary"
                            style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                            onClick={handleCheckout}
                        >
                            {!session && <Lock size={16} />}
                            {session ? "Pago Seguro vía MercadoPago" : "Iniciar Sesión para Pago Seguro"}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
