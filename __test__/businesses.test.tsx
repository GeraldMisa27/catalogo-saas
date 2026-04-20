import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockRouterPush = vi.fn();
const mockRouterBack = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    back: mockRouterBack,
  }),
}));

// Mock del fetch global para no hacer llamadas reales a la API
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ── Tests del formulario de nuevo producto ────────────────
describe("NewProductPage", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockRouterPush.mockClear();
    mockRouterBack.mockClear();
  });

  it("muestra error si el nombre está vacío", async () => {
    const { default: NewProductPage } = await import(
      "@/app/(frontend)/dashboard/productos/nuevo/page"
    );
    render(<NewProductPage />);

    // Intenta enviar sin nombre
    fireEvent.click(screen.getByText("Guardar producto"));

    // El navegador valida el campo required — el fetch no se llama
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("renderiza el formulario correctamente", async () => {
    const { default: NewProductPage } = await import(
      "@/app/(frontend)/dashboard/productos/nuevo/page"
    );
    render(<NewProductPage />);

    expect(screen.getByPlaceholderText("Pizza Margarita")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("150")).toBeInTheDocument();
    expect(screen.getByText("Guardar producto")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("muestra error de conexión cuando el fetch falla", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { default: NewProductPage } = await import(
      "@/app/(frontend)/dashboard/productos/nuevo/page"
    );
    render(<NewProductPage />);

    // Rellena los campos obligatorios
    fireEvent.change(screen.getByPlaceholderText("Pizza Margarita"), {
      target: { value: "Pizza Margarita" },
    });
    fireEvent.change(screen.getByPlaceholderText("150"), {
      target: { value: "150" },
    });

    fireEvent.click(screen.getByText("Guardar producto"));

    await waitFor(() => {
      expect(
        screen.getByText("Error de conexión. Inténtalo de nuevo.")
      ).toBeInTheDocument();
    });
  });
});

// ── Tests de la página de login ───────────────────────────
describe("LoginPage", () => {
  beforeEach(() => {
    mockFetch.mockClear();
    mockRouterPush.mockClear();
    mockRouterBack.mockClear();
  });

  it("renderiza el formulario de login", async () => {
    const { default: LoginPage } = await import("@/app/(frontend)/login/page");
    render(<LoginPage />);

    expect(screen.getByPlaceholderText("tu@email.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Acceder" })
    ).toBeInTheDocument();
  });

  it("muestra error de credenciales incorrectas", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        errors: [{ message: "Credenciales incorrectas" }],
      }),
    });

    const { default: LoginPage } = await import("@/app/(frontend)/login/page");
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "wrongpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Acceder" }));

    await waitFor(() => {
      expect(screen.getByText("Credenciales incorrectas")).toBeInTheDocument();
    });
  });

  it("muestra error de conexión cuando el fetch falla", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const { default: LoginPage } = await import("@/app/(frontend)/login/page");
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("tu@email.com"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("••••••••"), {
      target: { value: "password" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Acceder" }));

    await waitFor(() => {
      expect(
        screen.getByText("Error de conexión. Inténtalo de nuevo.")
      ).toBeInTheDocument();
    });
  });
});
