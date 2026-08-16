import { AppRoot } from '@/components/pages';

/**
 * Home page — the entry point of the app.
 *
 * In Next.js App Router, each `page.tsx` is a route.
 * This root page renders the AppRoot which handles
 * auth gating (login → app shell) and page routing.
 */
export default function Home() {
  return <AppRoot />;
}
