import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "@/app/globals.css";
import { Icon } from "@blueshift-gg/ui-components";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Fira_Code, Funnel_Display } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";
import GlobalModals from "@/app/components/Modals/GlobalModals";
import { URLS } from "@/constants/urls";
import { AuthProvider } from "@/contexts/AuthContext";
import TanstackProvider from "@/contexts/TanstackProvider";
import WalletProvider from "@/contexts/WalletProvider";

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

  return {
    metadataBase: new URL(URLS.BLUESHIFT_EDUCATION),
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
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

  return (
    <html lang={locale}>
      <body
        className={`${MontechV2.variable} ${FiraCode.variable} ${Switzer.variable} ${FunnelDisplay.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <TanstackProvider>
            <WalletProvider>
              <AuthProvider>
                <GlobalModals />
                {children}
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
