import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// ── Test del componente Nav ───────────────────────────────
// Testeamos que el Nav renderiza los elementos correctos
// sin depender de ninguna lógica externa
describe("Nav", () => {
  it("renderiza el nombre de la plataforma", async () => {
    // Importación dinámica para evitar conflictos con next/link
    const { default: Nav } = await import("@/components/Nav");
    render(<Nav />);

    expect(screen.getByText("Catálogo")).toBeInTheDocument();
  });

  it("renderiza el link de explorar", async () => {
    const { default: Nav } = await import("@/components/Nav");
    render(<Nav />);

    expect(screen.getByText("Explorar")).toBeInTheDocument();
  });

  it("renderiza el link de mi negocio", async () => {
    const { default: Nav } = await import("@/components/Nav");
    render(<Nav />);

    expect(screen.getByText("Mi negocio")).toBeInTheDocument();
  });
});

// ── Test del componente Footer ────────────────────────────
describe("Footer", () => {
  it("renderiza el copyright", async () => {
    const { default: Footer } = await import("@/components/Footer");
    render(<Footer />);

    expect(screen.getByText(/CatálogoSaaS/i)).toBeInTheDocument();
  });

  it("renderiza el link de admin", async () => {
    const { default: Footer } = await import("@/components/Footer");
    render(<Footer />);

    expect(screen.getByText("Admin")).toBeInTheDocument();
  });
});
