import { getTranslations } from "next-intl/server";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import GlobalModals from "@/app/components/Modals/GlobalModals";
import { AuthProvider } from "@/contexts/AuthContext";
import WalletProvider from "@/contexts/WalletProvider";
import TanstackProvider from "@/contexts/TanstackProvider";
import { Fira_Code, Funnel_Display } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { headers } from "next/headers";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";
import { Icon } from "@blueshift-gg/ui-components";
import { URLS } from "@/constants/urls";

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
  const requestURL = await headers();
  const pathname = requestURL.get("x-current-path") || "";

  return {
    metadataBase: new URL(URLS.BLUESHIFT_EDUCATION),
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    alternates: {
      canonical: `/${locale}${pathname}`,
      languages: {
        en: `/en${pathname}`,
        "zh-CN": `/zh-CN${pathname}`,
        "zh-HK": `/zh-HK${pathname}`,
        fr: `/fr${pathname}`,
        id: `/id${pathname}`,
        vi: `/vi${pathname}`,
        uk: `/uk${pathname}`,
        de: `/de${pathname}`,
      },
    },
    openGraph: {
      title: t("title"),
      type: "website",
      description: t("description"),
      url: `/${locale}`,
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

  const requestURL = await headers();
  const pathname = requestURL.get("x-current-path");
  const isHomepage = pathname === `/${locale}` || pathname === "/";

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
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                      __html: JSON.stringify(organizationSchema),
                    }}
                  />
                )}
                <GlobalModals />
                {!pathname?.includes("/nft-generator") ? (
                  <>
                    <Header />
                    <div className="pt-[74px] min-h-[calc(100dvh-74px)]">
                      {children}
                    </div>
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
