import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";
import { Icon } from "@blueshift-gg/ui-components";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Fira_Code, Funnel_Display } from "next/font/google";
import { headers } from "next/headers";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";
import Footer from "@/app/components/Footer/Footer";
import Header from "@/app/components/Header/Header";
import GlobalModals from "@/app/components/Modals/GlobalModals";
import { URLS } from "@/constants/urls";
import { AuthProvider } from "@/contexts/AuthContext";
import TanstackProvider from "@/contexts/TanstackProvider";
import WalletProvider from "@/contexts/WalletProvider";
import { getLocalizedAlternates } from "@/i18n/metadata";

/**
 * Normalizes absolute URL or relative path to a pathname starting with "/".
 *
 * Examples:
 *   - "https://blueshift.gg/en/courses/intro?tab=overview" becomes "/en/courses/intro"
 *   - "en/courses/intro" becomes "/en/courses/intro"
 *  - "/en/courses/intro" stays "/en/courses/intro"
 * @param rawPath The raw path to normalize
 * @returns Normalized pathname
 */
function normalizePathname(rawPath: string): string {
  try {
    return new URL(rawPath, URLS.BLUESHIFT_EDUCATION).pathname;
  } catch {
    return rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  }
}

// Layout code works with a locale-free pathname so there is one stable shape
// internally: "/" or "/courses/foo", never "/en/...".
function stripLocalePrefix(pathname: string): string {
  for (const locale of routing.locales) {
    const localePrefix = `/${locale}`;

    if (pathname === localePrefix) {
      return "/";
    }

    if (pathname.startsWith(`${localePrefix}/`)) {
      return pathname.slice(localePrefix.length);
    }
  }

  return pathname;
}

// Server layouts do not get the locale-free pathname from next-intl directly,
// so this is the one place where we derive it from the current request.
function getCurrentPath(requestHeaders: Headers): string {
  const nextUrl = requestHeaders.get("next-url");
  const rewrittenPath = requestHeaders.get("x-nextjs-rewritten-path");
  const rawPath = rewrittenPath ?? nextUrl;

  if (!rawPath) {
    return "/";
  }

  return stripLocalePrefix(normalizePathname(rawPath));
}

const FiraCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code",
  display: "swap",
});

const Switzer = localFont({
  src: [
    {
      path: "../fonts/Switzer-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/Switzer-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/Switzer-Semibold.woff2",
      weight: "60",
      style: "normal",
    },
  ],
  variable: "--font-switzer",
  display: "swap",
});

const MontechV2 = localFont({
  src: "../../../node_modules/@blueshift-gg/ui-components/src/fonts/MONTECHV02-Medium.woff2",
  weight: "500",
  style: "normal",
  variable: "--font-montech",
  display: "swap",
});

const FunnelDisplay = Funnel_Display({
  subsets: ["latin"],
  variable: "--font-funnel-display",
  display: "swap",
});

interface RootLayoutProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: RootLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const requestHeaders = await headers();
  const pathname = getCurrentPath(requestHeaders);
  const alternates = getLocalizedAlternates(pathname, locale);

  return {
    metadataBase: new URL(URLS.BLUESHIFT_EDUCATION),
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    alternates,
    openGraph: {
      title: t("title"),
      type: "website",
      description: t("description"),
      url: alternates.canonical,
      siteName: t("title"),
      images: [
        {
          url: `${URLS.BLUESHIFT_EDUCATION}/graphics/meta-image.png`,
          width: 1200,
          height: 628,
        },
      ],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const requestHeaders = await headers();
  const pathname = getCurrentPath(requestHeaders);
  const isHomepage = pathname === "/";

  // Organization schema for homepage
  const organizationSchema = isHomepage
    ? {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        name: "Blueshift",
        url: URLS.BLUESHIFT_EDUCATION,
        logo: `${URLS.BLUESHIFT_EDUCATION}/branding/logo.svg`,
        description:
          "Learn Solana development with hands-on courses, challenges, and on-chain verification. Free education from blockchain basics to advanced program development.",
        foundingDate: "2023",
        knowsAbout: [
          "Solana",
          "Blockchain Development",
          "Anchor Framework",
          "Rust Programming",
          "Web3",
          "Smart Contracts",
          "DeFi",
          "NFTs",
        ],
        teaches: "Solana Blockchain Development",
      }
    : null;

  return (
    <html lang={locale}>
      <body
        className={`${MontechV2.variable} ${FiraCode.variable} ${Switzer.variable} ${FunnelDisplay.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <TanstackProvider>
            <WalletProvider>
              <AuthProvider>
                {organizationSchema && (
                  <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
                )}
                <GlobalModals />
                {!pathname.includes("/nft-generator") ? (
                  <>
                    <Header />
                    <div className="min-h-[calc(100dvh-74px)] pt-[74px]">{children}</div>
                    <Footer />
                  </>
                ) : (
                  children
                )}
                <Toaster
                  position="top-center"
                  toastOptions={{
                    className:
                      "bg-card-solid! rounded-none! text-shade-primary! border! border-border-light! p-4!",
                    error: {
                      icon: <Icon name="Close" className="text-error" />,
                      iconTheme: {
                        primary: "var(--color-state-error)",
                        secondary: "var(--color-shade-primary)",
                      },
                    },
                  }}
                />
                <SonnerToaster position="bottom-right" closeButton={false} />
              </AuthProvider>
            </WalletProvider>
          </TanstackProvider>
        </NextIntlClientProvider>
      </body>
      <GoogleAnalytics gaId="G-BW45TC8WPK" />
    </html>
  );
}
