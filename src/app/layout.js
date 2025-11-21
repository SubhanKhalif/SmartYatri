import './globals.css';
import { seedRoleData } from '@/utils/seedData';

export const metadata = {
  title: 'JP Fashion POS',
  description: 'Invoice preview + entry form',
};

export default async function RootLayout({ children }) {
  if (typeof window === "undefined") {
    await seedRoleData();
  }

  return (
    <html lang="en">
      <head>
      <script src="/force-auth.js" defer></script></head>
      <body className="bg-white text-black">{children}</body>
    </html>
  );
}