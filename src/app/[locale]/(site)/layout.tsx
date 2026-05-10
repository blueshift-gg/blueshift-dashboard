import type { ReactNode } from "react";
import Footer from "@/app/components/Footer/Footer";
import Header from "@/app/components/Header/Header";

interface SiteLayoutProps {
  children: ReactNode;
}

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <>
      <Header />
      <div className="min-h-[calc(100dvh-74px)] pt-[74px]">{children}</div>
      <Footer />
    </>
  );
}
