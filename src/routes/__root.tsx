import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { I18nProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/cart";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "BLANCA" },
      {
        name: "description",
        content:
          "BLANCA — marque streetwear 2026. Drops limités, pièces audacieuses, livraison en Tunisie.",
      },
      { name: "author", content: "BLANCA" },
      { property: "og:title", content: "BLANCA" },
      {
        property: "og:description",
        content: "Drops limités. Style authentique. Zéro compromis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "BLANCA" },
      { name: "description", content: "BLANCA ne suit pas les règles. On les brise. Chaque pièce est taillée pour ceux qui refusent de passer inaperçus." },
      { property: "og:description", content: "BLANCA ne suit pas les règles. On les brise. Chaque pièce est taillée pour ceux qui refusent de passer inaperçus." },
      { name: "twitter:description", content: "BLANCA ne suit pas les règles. On les brise. Chaque pièce est taillée pour ceux qui refusent de passer inaperçus." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ba364d06-e3d1-46ae-9531-d746fbb441a0/id-preview-46995a52--29a58f3c-4eef-4bcd-8642-43a90753ba27.lovable.app-1776523002886.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/ba364d06-e3d1-46ae-9531-d746fbb441a0/id-preview-46995a52--29a58f3c-4eef-4bcd-8642-43a90753ba27.lovable.app-1776523002886.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <I18nProvider>
      <CartProvider>
        <Outlet />
      </CartProvider>
    </I18nProvider>
  );
}
