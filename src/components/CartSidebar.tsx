"use client";

import { X, ShoppingBag, Trash2, Lock } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartSidebar() {
    const { items, isOpen, toggleCart, removeItem, getCartTotal } = useCartStore();
    const { data: session } = useSession();
    const router = useRouter();

    const [shipping, setShipping] = useState({
        name: '', address: '', phone: '', city: '', state: '', zip: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const isFormValid = Object.values(shipping).every(val => val.trim().length > 0);

    const total = getCartTotal();
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(price) + ' USD';
    };

    const handleCheckout = async () => {
        if (!session) {
            router.push("/signin");
            toggleCart();
            return;
        }

        if (!isFormValid) {
            alert("Por favor, rellene todos los campos de envío.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items, shipping }),
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
        } finally {
            setIsSubmitting(false);
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
                className="fixed top-0 right-0 h-full w-full max-w-md shadow-2xl z-50 flex flex-col items-stretch transform transition-transform duration-300"
                style={{ position: 'fixed', top: 0, right: 0, height: '100%', width: '100%', maxWidth: '450px', backgroundColor: 'var(--surface-dark)', zIndex: 101, borderLeft: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ padding: '2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShoppingBag color="var(--accent-red)" />
                        <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)', letterSpacing: '0.05em' }}>Su Carrito</h2>
                    </div>
                    <button onClick={toggleCart} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '0.5rem' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#666', marginTop: '4rem', fontFamily: 'var(--font-sans)' }}>
                            <p>Su carrito esta vacío.</p>
                            <button onClick={toggleCart} className="btn-outline" style={{ marginTop: '2rem' }}>Explorar Colección</button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <div style={{ width: '80px', height: '100px', backgroundColor: 'var(--background)', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                                    <img src={item.image} alt={item.model} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <p style={{ color: 'var(--accent-red)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{item.brand}</p>
                                    <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.model}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Cant: {item.quantity}</p>
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
                    <div style={{ padding: '2rem', borderTop: '1px solid var(--glass-border)', backgroundColor: 'var(--background)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontFamily: 'var(--font-sans)' }}>
                            <span style={{ color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.85rem' }}>Subtotal</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 300 }}>{formatPrice(total)}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#666', marginBottom: '1.5rem', textAlign: 'center' }}>
                            El envío y el seguro de entrega se calcularán al pagar.
                        </p>
                        <div style={{ padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginBottom: '1rem', color: '#333' }}>Datos de Envío</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.8rem' }}>
                                <input placeholder="Nombre completo" value={shipping.name} onChange={e => setShipping({ ...shipping, name: e.target.value })} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }} />
                                <input placeholder="Teléfono" value={shipping.phone} onChange={e => setShipping({ ...shipping, phone: e.target.value })} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }} />
                                <input placeholder="Dirección completa" value={shipping.address} onChange={e => setShipping({ ...shipping, address: e.target.value })} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                                    <input placeholder="Localidad/Ciudad" value={shipping.city} onChange={e => setShipping({ ...shipping, city: e.target.value })} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }} />
                                    <input placeholder="Departamento" value={shipping.state} onChange={e => setShipping({ ...shipping, state: e.target.value })} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }} />
                                </div>
                                <input placeholder="Código Postal" value={shipping.zip} onChange={e => setShipping({ ...shipping, zip: e.target.value })} style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem' }} />
                            </div>
                        </div>

                        <button
                            style={{
                                width: '100%',
                                padding: '1rem',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: isFormValid && !isSubmitting ? '#009ee3' : '#ccc',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontWeight: 500,
                                fontSize: '1rem',
                                cursor: isFormValid && !isSubmitting ? 'pointer' : 'not-allowed',
                                transition: 'background-color 0.2s ease',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseOver={(e) => { if (isFormValid && !isSubmitting) e.currentTarget.style.backgroundColor = '#008bca' }}
                            onMouseOut={(e) => { if (isFormValid && !isSubmitting) e.currentTarget.style.backgroundColor = '#009ee3' }}
                            onClick={handleCheckout}
                            disabled={!isFormValid || isSubmitting}
                        >
                            {!session && <Lock size={16} />}
                            {isSubmitting ? 'Procesando...' : (session ? "Pagar con" : "Iniciar Sesión para Pagar con")}
                            {(!isSubmitting) && (
                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '6px' }}>
                                    <img src="/images/mp_logo.png" alt="Mercado Pago Logo" style={{ height: '20px', width: 'auto', objectFit: 'contain' }} />
                                    <span style={{ fontWeight: 800, letterSpacing: '-0.5px', marginLeft: '6px', color: '#009ee3' }}>mercado</span>
                                    <span style={{ fontWeight: 400, letterSpacing: '-0.5px', color: '#009ee3' }}>pago</span>
                                </div>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
