"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Diamond } from "lucide-react";

export default function Register() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/signin");
                }, 2000);
            } else {
                const data = await res.json();
                setError(data.message || "Ocurrió un error en el registro");
            }
        } catch (err) {
            setError("No se pudo registrar. Por favor intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                <div style={{ textAlign: "center", background: "var(--surface-dark)", padding: "3rem", border: "1px solid var(--glass-border)", borderRadius: "10px", color: "var(--accent-red)" }} className="fade-in">
                    <Diamond size={32} style={{ margin: "0 auto 1.5rem" }} />
                    <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Solicitud Aprobada</h2>
                    <p style={{ color: "#fff" }}>Su portafolio ha sido creado. Redirigiendo al inicio de sesión...</p>
                </div>
            </main>
        );
    }

    return (
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
            <div style={{ maxWidth: "450px", width: "100%", background: "var(--surface-dark)", padding: "3rem", border: "1px solid var(--glass-border)", borderRadius: "10px" }} className="slide-up">
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", fontFamily: "var(--font-serif)" }}>Solicitar Acceso</h1>
                    <p style={{ color: "#888", fontSize: "0.9rem" }}>Únase a la exclusiva red de coleccionistas MICRON</p>
                </div>

                {error && (
                    <div style={{ background: "rgba(255, 0, 0, 0.1)", border: "1px solid rgba(255, 0, 0, 0.3)", color: "#ff6b6b", padding: "0.8rem", borderRadius: "5px", marginBottom: "1.5rem", fontSize: "0.85rem", textAlign: "center" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#aaa" }}>Nombre Completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{ width: "100%", padding: "0.8rem", background: "rgba(0,0,0,0.5)", border: "1px solid var(--border-color)", color: "white", outline: "none" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#aaa" }}>Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ width: "100%", padding: "0.8rem", background: "rgba(0,0,0,0.5)", border: "1px solid var(--border-color)", color: "white", outline: "none" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#aaa" }}>Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            style={{ width: "100%", padding: "0.8rem", background: "rgba(0,0,0,0.5)", border: "1px solid var(--border-color)", color: "white", outline: "none" }}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", marginTop: "1rem", opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Enviando..." : "Enviar Solicitud"}
                    </button>
                </form>

                <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "#888" }}>
                    ¿Ya es coleccionista? <Link href="/signin" style={{ color: "var(--accent-red)" }}>Iniciar Sesión</Link>
                </div>
            </div>
        </main>
    );
}
