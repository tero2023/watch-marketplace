"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Diamond } from "lucide-react";

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setError("Credenciales inválidas. Por favor verifique su correo electrónico y contraseña.");
            setLoading(false);
        } else {
            router.push("/");
            router.refresh();
        }
    };

    return (
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
            <div style={{ maxWidth: "400px", width: "100%", background: "var(--surface-dark)", padding: "3rem", border: "1px solid var(--glass-border)", borderRadius: "10px" }} className="fade-in">
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                        <Diamond size={24} color="var(--accent-gold)" />
                    </div>
                    <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>Iniciar Sesión</h1>
                    <p style={{ color: "#888", fontSize: "0.9rem" }}>Acceda a su portafolio exclusivo MICRON</p>
                </div>

                {error && (
                    <div style={{ background: "rgba(255, 0, 0, 0.1)", border: "1px solid rgba(255, 0, 0, 0.3)", color: "#ff6b6b", padding: "0.8rem", borderRadius: "5px", marginBottom: "1.5rem", fontSize: "0.85rem", textAlign: "center" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
                            style={{ width: "100%", padding: "0.8rem", background: "rgba(0,0,0,0.5)", border: "1px solid var(--border-color)", color: "white", outline: "none" }}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", marginTop: "1rem", opacity: loading ? 0.7 : 1 }}>
                        {loading ? "Autenticando..." : "Iniciar Sesión"}
                    </button>
                </form>

                <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "#888" }}>
                    ¿Aún no tiene una cuenta? <Link href="/register" style={{ color: "var(--accent-gold)" }}>Solicitar Acceso</Link>
                </div>
            </div>
        </main>
    );
}
