import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OnboardX - Client Onboarding for Paid Ads Agencies',
  description: 'Simplify client onboarding for Google Ads and Meta Ads agencies',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
