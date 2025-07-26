import { getTranslations } from "next-intl/server";
import localFont from "next/font/local";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";
import Header from "@/app/components/Header/Header";
import Footer from "@/app/components/Footer/Footer";
import GlobalModals from "@/app/components/Modals/GlobalModals";
import WalletProvider from "@/contexts/WalletProvider";
import TanstackProvider from "@/contexts/TanstackProvider";
import { Geist_Mono, Funnel_Display } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { headers } from "next/headers";

const GeistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
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
  src: "../fonts/MontechV2-Medium.ttf",
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

  return {
    metadataBase: new URL("https://learn.blueshift.gg"),
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    openGraph: {
      title: t("title"),
      type: "website",
      description: t("description"),
      url: `/${locale}`,
      siteName: t("title"),
      images: [
        {
          url: "https://learn.blueshift.gg/graphics/meta-image.png",
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

  return (
    <html lang={locale}>
      <body
        className={`${MontechV2.variable} ${GeistMono.variable} ${FunnelDisplay.variable} ${Switzer.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <TanstackProvider>
            <WalletProvider>
              <GlobalModals />
              {!pathname?.includes("/nft-generator") ? (
                <>
                  <Header />
                  <div className="pt-[69px] min-h-[calc(100dvh-69px)]">
                    {children}
                  </div>
                  <Footer />
                </>
              ) : (
                children
              )}
            </WalletProvider>
          </TanstackProvider>
        </NextIntlClientProvider>
      </body>
      <GoogleAnalytics gaId="G-BW45TC8WPK" />
    </html>
  );
}
