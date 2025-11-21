import './globals.css';
import { seedRoleData } from '@/utils/seedData';

// ---
// App-wide Metadata for SmartYatri
// ---
export const metadata = {
  title: 'SmartYatri',
  description: `SmartYatri is a modern, user-friendly bus ticket and pass booking platform designed for simple, fast, and reliable daily travel. Instantly book tickets, create and manage digital bus passes, view live updates, and enjoy secure payments with a clean interface. The perfect companion for students, office commuters, and travelers.`,
};

export default async function RootLayout({ children }) {
  if (typeof window === "undefined") {
    await seedRoleData();
  }

  return (
    <html lang="en">
      <head>
        {/* SmartYatri Logo Favicon */}
        <link rel="icon" href="/bus-logo.png" type="image/png"/>
        {/* App Meta */}
        <meta name="application-name" content="SmartYatri" />
        <meta name="theme-color" content="#0e73fa" />
        <meta name="description" content={metadata.description} />
        <script src="/force-auth.js" defer></script>
      </head>
      <body className="bg-white text-black">
        {children}
      </body>
    </html>
  );
}