import { ReactNode } from "react";
import SiteNavbar from "./site/SiteNavbar";
import SiteFooter from "./site/SiteFooter";
import { MobileActionBar, WhatsAppFab, useMobileBarVisible } from "./site/ContactDock";
import { ConsentBanner } from "./site/ConsentBanner";
import { SmoothScroll } from "@/lib/motion/SmoothScroll";
import { cn } from "@/lib/utils";

const Layout = ({ children }: { children: ReactNode }) => {
  const mobileBar = useMobileBarVisible();

  return (
    <div className={cn("min-h-screen bg-background", mobileBar && "pb-[calc(var(--mobile-bar-h)+env(safe-area-inset-bottom))] md:pb-0")}>
      <SiteNavbar />
      <main id="main" tabIndex={-1} className="pt-[72px] outline-none">
        {children}
      </main>
      <SiteFooter />
      <WhatsAppFab />
      <MobileActionBar />
      <ConsentBanner />
      <SmoothScroll />
    </div>
  );
};

export default Layout;
