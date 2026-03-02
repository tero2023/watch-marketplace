import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import { format } from "date-fns";

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        redirect("/");
    }

    // Fetch orders from database, ordered by creation date descending
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            user: {
                select: { email: true, name: true }
            }
        }
    });

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "3rem 1rem", color: "#111" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
                    <div>
                        <h1 style={{ fontSize: "2rem", fontWeight: "bold", fontFamily: "serif", color: "#C80000", letterSpacing: "0.05em" }}>MICRON</h1>
                        <h2 style={{ fontSize: "1.5rem", color: "#333", marginTop: "0.5rem" }}>Panel de Administración de Ventas</h2>
                    </div>
                    <a href="/" style={{ padding: "0.5rem 1rem", backgroundColor: "#111", color: "white", textDecoration: "none", borderRadius: "4px", fontSize: "0.9rem" }}>
                        ← Volver a la Tienda
                    </a>
                </header>

                <main style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                    <div style={{ padding: "1.5rem", borderBottom: "1px solid #e5e7eb", backgroundColor: "#f8fafc" }}>
                        <h3 style={{ fontSize: "1.2rem", fontWeight: "600", color: "#1e293b" }}>Resumen de Órdenes ({orders.length})</h3>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ backgroundColor: "#f1f5f9", borderBottom: "2px solid #e2e8f0" }}>
                                    <th style={{ padding: "1rem", color: "#475569", fontWeight: "600", fontSize: "0.875rem" }}>Orden #</th>
                                    <th style={{ padding: "1rem", color: "#475569", fontWeight: "600", fontSize: "0.875rem" }}>Fecha</th>
                                    <th style={{ padding: "1rem", color: "#475569", fontWeight: "600", fontSize: "0.875rem" }}>Cliente</th>
                                    <th style={{ padding: "1rem", color: "#475569", fontWeight: "600", fontSize: "0.875rem" }}>Estado</th>
                                    <th style={{ padding: "1rem", color: "#475569", fontWeight: "600", fontSize: "0.875rem" }}>Total (USD)</th>
                                    <th style={{ padding: "1rem", color: "#475569", fontWeight: "600", fontSize: "0.875rem" }}>Detalles de Envío</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
                                            No hay órdenes generadas aún.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((order) => (
                                        <tr key={order.id} style={{ borderBottom: "1px solid #e2e8f0", transition: "background-color 0.2s" }}>
                                            <td style={{ padding: "1rem", fontFamily: "monospace", fontWeight: "bold", color: "#334155" }}>
                                                {order.orderNumber}
                                            </td>
                                            <td style={{ padding: "1rem", color: "#475569", fontSize: "0.875rem" }}>
                                                {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                                            </td>
                                            <td style={{ padding: "1rem" }}>
                                                <div style={{ fontWeight: "500", color: "#0f172a" }}>{order.user.name || "Usuario"}</div>
                                                <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{order.user.email}</div>
                                            </td>
                                            <td style={{ padding: "1rem" }}>
                                                <span style={{
                                                    padding: "0.25rem 0.75rem",
                                                    borderRadius: "9999px",
                                                    fontSize: "0.75rem",
                                                    fontWeight: "bold",
                                                    backgroundColor: order.status === 'PAID' ? '#dcfce7' : order.status === 'PENDING' ? '#fef08a' : '#fecaca',
                                                    color: order.status === 'PAID' ? '#166534' : order.status === 'PENDING' ? '#854d0e' : '#991b1b',
                                                }}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: "1rem", fontWeight: "600", color: "#0f172a" }}>
                                                ${order.totalAmount}
                                            </td>
                                            <td style={{ padding: "1rem", fontSize: "0.875rem", color: "#475569" }}>
                                                <div><strong>{order.shippingName}</strong></div>
                                                <div>{order.shippingAddress}</div>
                                                <div>{order.shippingCity}, {order.shippingState}</div>
                                                <div>Tel: {order.shippingPhone}</div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        </div>
    );
}
