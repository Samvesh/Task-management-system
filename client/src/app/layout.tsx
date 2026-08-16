import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { StoreProvider } from "@/providers/store-provider";
import { themeInitScript } from "@/lib/theme-init-script";
import "./globals.css";

/**
 * Inter font — matches the Figma design.
 * next/font/google handles self-hosting and optimization automatically.
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AbleSpace — Task Management",
  description: "A collaborative task management system for teams",
};

/**
 * Root layout — wraps every page.
 *
 * Key details:
 * 1. The theme init <script> runs BEFORE React hydrates, reading
 *    theme/color from localStorage and setting data-theme/data-color
 *    attributes on <html>. This prevents the "flash of wrong theme"
 *    that happens with client-only theme detection.
 *
 * 2. suppressHydrationWarning is needed because the server renders
 *    without data-theme/data-color, but the client script adds them
 *    before React mounts. Without this flag, React would warn about
 *    the attribute mismatch.
 *
 * 3. StoreProvider initializes the MobX State Tree root store and
 *    makes it available to all child components via useStore().
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent flash of wrong theme — runs before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
