"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Next Image

// Responsive navigation - open/close mobile nav
export default function HomePage() {
  const [navOpen, setNavOpen] = useState(false);

  // Prevent background scrolling when nav is open on mobile
  useEffect(() => {
    if (navOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    }
  }, [navOpen]);

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-br from-blue-100 via-white to-blue-200 flex flex-col overflow-x-hidden">
      {/* Blobs and Modern Gradients (Decor) */}
      <div className="absolute top-0 left-0 w-60 h-60 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-blue-200 rounded-full mix-blend-lighten blur-2xl opacity-40 -z-10 pointer-events-none"
        style={{ filter: "blur(80px)", top: "-4rem", left: "-2rem" }} />
      <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 bg-blue-300 rounded-full mix-blend-lighten blur-2xl opacity-30 -z-10 pointer-events-none"
        style={{ filter: "blur(65px)", bottom: "-2rem", right: "-2rem" }} />
      <div className="absolute top-1/2 left-0 w-44 h-40 sm:w-56 sm:h-52 lg:w-72 lg:h-64 bg-purple-100 rounded-full blur-3xl opacity-20 -z-10 pointer-events-none"
        style={{ filter: "blur(40px)", top: "53%", left: "-2rem" }} />

      {/* Header */}
      <header className="w-full max-w-[100vw] px-4 sm:px-6 md:px-12 py-3 flex items-center justify-between bg-white/70 shadow-lg backdrop-blur-2xl sticky top-0 z-30 border-b border-blue-200/40">
        <div className="flex items-center gap-2 md:gap-4">
          <Image
            src="/bus-logo.png"
            alt="Bus Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 drop-shadow-md"
            width={40}
            height={40}
            priority
          />
          <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 tracking-tight font-sans select-none">
            SmartYatri
          </span>
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:flex gap-2 lg:gap-6 items-center">
          <Link href="/Booking" className="text-blue-700 hover:bg-blue-100/50 focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl px-4 py-2 text-[17px] font-medium transition duration-200">
            Book Ticket
          </Link>
          <Link href="/Pass" className="text-blue-700 hover:bg-blue-100/50 focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl px-4 py-2 text-[17px] font-medium transition duration-200">
            My Pass
          </Link>
          <Link href="/Login" className="text-blue-700 hover:bg-blue-100/50 focus-visible:ring-2 focus-visible:ring-blue-600 rounded-xl px-4 py-2 text-[17px] font-medium transition duration-200">
            Login
          </Link>
          <Link href="/Signup" className="bg-gradient-to-tr from-blue-700 to-blue-600 text-white rounded-2xl px-6 py-2.5 font-semibold shadow-lg shadow-blue-100/40 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-blue-400 transition-all duration-200 text-[17px] font-semibold">
            Get Started
          </Link>
        </nav>
        {/* Mobile Hamburger */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-xl text-blue-700 border border-blue-300 bg-white/60 shadow hover:bg-blue-50 transition-all duration-200 focus:outline-none"
            aria-label="Open menu"
            onClick={() => setNavOpen((open) => !open)}
            aria-expanded={navOpen}
            aria-controls="mobile-menu"
          >
            <svg width="30" height="30" fill="none" viewBox="0 0 30 30">
              <rect y="7" width="30" height="3" rx="1.5" fill="#2563eb" />
              <rect y="14" width="30" height="3" rx="1.5" fill="#2563eb" />
              <rect y="21" width="30" height="3" rx="1.5" fill="#2563eb" />
            </svg>
          </button>
        </div>
        {/* Mobile Nav Drawer */}
        <div
          id="mobile-menu"
          className={`fixed inset-0 transition-all duration-300 z-50 bg-black/30 md:hidden${navOpen ? "" : " hidden"}`}
          onClick={() => setNavOpen(false)}
        >
          <div
            className="absolute top-0 right-0 w-4/5 max-w-xs bg-white shadow-xl h-full flex flex-col py-10 px-7 gap-4"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-2xl text-blue-800"
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
            >
              &times;
            </button>
            <Link href="/Booking" className="text-blue-800 hover:bg-blue-50 rounded-lg px-3 py-2 font-medium text-[17px] transition" onClick={() => setNavOpen(false)}>
              Book Ticket
            </Link>
            <Link href="/Pass" className="text-blue-800 hover:bg-blue-50 rounded-lg px-3 py-2 font-medium text-[17px] transition" onClick={() => setNavOpen(false)}>
              My Pass
            </Link>
            <Link href="/Login" className="text-blue-800 hover:bg-blue-50 rounded-lg px-3 py-2 font-medium text-[17px] transition" onClick={() => setNavOpen(false)}>
              Login
            </Link>
            <Link href="/Signup" className="bg-gradient-to-tr from-blue-700 to-blue-600 text-white rounded-xl px-4 py-3 font-semibold shadow hover:brightness-110 transition text-[17px] font-semibold" onClick={() => setNavOpen(false)}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 w-full flex flex-col md:flex-row items-center justify-center px-4 sm:px-6 md:px-16 xl:px-36 pb-12 pt-10 gap-8 md:gap-20 transition-all duration-500 z-10">
        {/* Left: Headline and Actions */}
        <div className="w-full max-w-2xl space-y-7">
          <h1 className="font-bold leading-tight text-blue-900 text-[2.4rem] sm:text-[2.8rem] md:text-[3.1rem] tracking-tight animate-fade-in-down">
            🚌 <span className="bg-gradient-to-tr from-blue-700 to-blue-500 bg-clip-text text-transparent animate-gradient font-bold">SmartYatri</span> – Your Smart Way to Travel
          </h1>
          <p className="text-[1.18rem] sm:text-[1.28rem] md:text-[1.38rem] text-blue-800/80 mt-2 animate-fade-in-down font-normal">
            <strong>SmartYatri</strong> is a modern and user-friendly bus ticket and pass booking platform designed to make daily travel simple, fast, and reliable. Whether you're commuting to work, planning a trip, or managing regular bus passes, SmartYatri gives you a smooth and hassle-free travel experience.
          </p>
          <div className="flex flex-wrap items-center gap-4 animate-fade-in-up">
            <Link
              href="/Booking"
              className="bg-gradient-to-tr from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 transition-all text-white px-7 py-3 rounded-2xl font-semibold shadow-xl text-[18px] ring-1 ring-blue-700 focus-visible:ring-2 focus-visible:ring-blue-400 animate-bounce-in"
            >
              Book Now
            </Link>
            <Link
              href="/Signup"
              className="px-7 py-3 rounded-2xl border-2 border-blue-700 text-blue-700 bg-white/80 hover:bg-blue-50 font-medium shadow-md text-[18px] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Create Account
            </Link>
          </div>
        </div>
        {/* Right: Illustration */}
        <div className="w-full flex-1 flex items-center justify-center animate-fade-in-up">
          <div className="relative bg-white/80 rounded-3xl shadow-2xl px-3 sm:px-6 py-6 sm:py-8 md:py-12 md:pr-0 flex items-center justify-center border border-blue-100/40 backdrop-blur-xl w-full max-w-xs sm:max-w-sm md:max-w-md">
            {/* Professional SVG Illustration */}
            <svg
              viewBox="0 0 320 180"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md drop-shadow-2xl"
              style={{ minWidth: "180px" }}
              aria-label="Professional Bus Booking Illustration"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
            >
              {/* Main bus body */}
              <rect x="32" y="78" rx="19" width="250" height="56" fill="#2563EB" />
              {/* Windows */}
              <rect x="48" y="90" rx="4" width="36" height="18" fill="#fff" opacity="0.95"/>
              <rect x="88" y="90" rx="4" width="36" height="18" fill="#fff" opacity="0.92"/>
              <rect x="128" y="90" rx="4" width="36" height="18" fill="#fff" opacity="0.90"/>
              <rect x="168" y="90" rx="4" width="36" height="18" fill="#fff" opacity="0.93"/>
              {/* Door */}
              <rect x="210" y="92" rx="3" width="26" height="24" fill="#f1f5f9" stroke="#2563EB" strokeWidth="1"/>
              {/* Front glass */}
              <rect x="242" y="92" rx="5" width="24" height="22" fill="#93c5fd" stroke="#2563EB" strokeWidth="1" opacity="0.83"/>
              {/* Wheels */}
              <circle cx="70" cy="136" r="15" fill="#111827" />
              <circle cx="70" cy="136" r="7" fill="#fde68a" />
              <circle cx="236" cy="136" r="15" fill="#111827" />
              <circle cx="236" cy="136" r="7" fill="#fde68a" />
              {/* Headlights */}
              <ellipse cx="281" cy="106" rx="4" ry="7" fill="#fde047" />
              <ellipse cx="281" cy="122" rx="4" ry="3" fill="#fff7ae" />
              {/* Small decorations */}
              <rect x="45" y="126" width="30" height="5" rx="2.5" fill="#1e40af" opacity="0.18"/>
              <rect x="178" y="127" width="20" height="4.5" rx="2.2" fill="#1e40af" opacity="0.18"/>
              {/* Road */}
              <rect x="24" y="150" rx="7" width="270" height="13" fill="#64748b" opacity="0.16"/>
              {/* Abstract sky circle behind */}
              <circle cx="160" cy="72" r="60" fill="#60a5fa" opacity="0.09"/>
            </svg>
            {/* SVG Decoration behind image */}
            <div className="absolute -z-10 left-0 top-0 blur-2xl opacity-20">
              <svg width="180" height="90" viewBox="0 0 220 110" fill="none">
                <ellipse cx="110" cy="80" rx="90" ry="26" fill="#2563EB" opacity="0.11"/>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-white/90 py-10 sm:py-16 px-4 sm:px-5 md:px-0 flex flex-col items-center border-t border-blue-100/60 shadow-inner z-20">
        <h2 className="text-[2rem] sm:text-[2.5rem] md:text-[2.85rem] font-bold text-blue-900 text-center mb-8 sm:mb-12 tracking-tight animate-fade-in-down">
          ⭐ Key Features
        </h2>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7 md:gap-10 max-w-7xl">
          <div className="group relative bg-gradient-to-tr from-blue-50/90 to-blue-100/80 rounded-3xl p-6 sm:p-8 md:p-9 pt-12 shadow-lg flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-[0px_12px_48px_-16px_rgb(59_130_246/0.085)] hover:ring-2 hover:ring-blue-200/70 transition-all duration-300 overflow-hidden">
            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-blue-600/10 rounded-full h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center">
              <svg width="34" height="34" sm="38" fill="none" viewBox="0 0 40 40">
                <circle cx="19" cy="19" r="18" fill="#3B82F6" opacity="0.13"/>
                <path d="M28 16v7a5 5 0 01-5 5H15a5 5 0 01-5-5v-7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
                <rect x="13" y="13" width="7" height="9" rx="2" stroke="#2563eb" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="font-semibold text-[1.10rem] sm:text-[1.17rem] mt-4 sm:mt-6 mb-1 sm:mb-2 text-blue-700">Instant Ticket Booking</h3>
            <p className="text-blue-900/70 text-[1.07rem] sm:text-[1.12rem] font-normal">
              Find buses, check seat availability, and book tickets in seconds.
            </p>
          </div>
          <div className="group relative bg-gradient-to-tr from-green-50/90 to-blue-100/70 rounded-3xl p-6 sm:p-8 md:p-9 pt-12 shadow-lg flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-[0px_12px_48px_-16px_rgb(34_197_94/0.11)] hover:ring-2 hover:ring-green-100/60 transition-all duration-300 overflow-hidden">
            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-green-500/10 rounded-full h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center">
              <svg width="34" height="34" sm="38" fill="none" viewBox="0 0 40 40">
                <circle cx="19" cy="19" r="18" fill="#10B981" opacity="0.15"/>
                <path d="M20 12v7l5 3" stroke="#10B981" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="20" cy="20" r="8" stroke="#10B981" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="font-semibold text-[1.10rem] sm:text-[1.17rem] mt-4 sm:mt-6 mb-1 sm:mb-2 text-green-700">Digital Bus Passes</h3>
            <p className="text-green-900/70 text-[1.07rem] sm:text-[1.12rem] font-normal">
              Create, renew, and manage your bus passes anytime.
            </p>
          </div>
          <div className="group relative bg-gradient-to-tr from-orange-50/90 to-blue-100/80 rounded-3xl p-6 sm:p-8 md:p-9 pt-12 shadow-lg flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-[0px_14px_48px_-16px_rgb(251_146_60/0.11)] hover:ring-2 hover:ring-orange-200/60 transition-all duration-300 overflow-hidden">
            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-orange-400/10 rounded-full h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center">
              <svg width="34" height="34" sm="38" fill="none" viewBox="0 0 40 40">
                <circle cx="19" cy="19" r="18" fill="#f59e42" opacity="0.10"/>
                <path d="M15 25l10-10M15 15h10v10" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="font-semibold text-[1.10rem] sm:text-[1.17rem] mt-4 sm:mt-6 mb-1 sm:mb-2 text-orange-600">Real-Time Updates</h3>
            <p className="text-orange-900/70 text-[1.07rem] sm:text-[1.12rem] font-normal">
              Live bus timings, delays, and route information.
            </p>
          </div>
          <div className="group relative bg-gradient-to-tr from-purple-50/90 to-blue-100/80 rounded-3xl p-6 sm:p-8 md:p-9 pt-12 shadow-lg flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-[0px_14px_48px_-16px_rgb(91_33_182/0.11)] hover:ring-2 hover:ring-purple-200/60 transition-all duration-300 overflow-hidden">
            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-purple-400/10 rounded-full h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="#a78bfa" opacity="0.12"/>
                <path d="M10 22v-2a4 4 0 014-4h2a4 4 0 014 4v2" stroke="#7c3aed" strokeWidth="2"/>
                <circle cx="16" cy="13" r="3" stroke="#7c3aed" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="font-semibold text-[1.10rem] sm:text-[1.17rem] mt-4 sm:mt-6 mb-1 sm:mb-2 text-purple-700">Secure Payments</h3>
            <p className="text-purple-900/70 text-[1.07rem] sm:text-[1.12rem] font-normal">
              Fast and safe online payment options.
            </p>
          </div>
          <div className="group relative bg-gradient-to-tr from-slate-100/90 to-blue-100/90 rounded-3xl p-6 sm:p-8 md:p-9 pt-12 shadow-lg flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-[0px_12px_48px_-16px_rgb(100_116_139/0.1)] hover:ring-2 hover:ring-blue-200/70 transition-all duration-300 overflow-hidden">
            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-blue-400/10 rounded-full h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="#3b82f6" opacity="0.07"/>
                <rect x="9" y="12" width="14" height="8" rx="3" stroke="#2563eb" strokeWidth="2"/>
                <path d="M16 15.5v2M13.5 18H18.5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="font-semibold text-[1.10rem] sm:text-[1.17rem] mt-4 sm:mt-6 mb-1 sm:mb-2 text-blue-700">User-Friendly Design</h3>
            <p className="text-blue-900/70 text-[1.07rem] sm:text-[1.12rem] font-normal">
              Clean interface built for all age groups.
            </p>
          </div>
          <div className="group relative bg-gradient-to-tr from-teal-50/90 to-blue-100/80 rounded-3xl p-6 sm:p-8 md:p-9 pt-12 shadow-lg flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-[0px_14px_48px_-16px_rgb(13_148_136/0.09)] hover:ring-2 hover:ring-teal-200/60 transition-all duration-300 overflow-hidden">
            <div className="absolute top-5 left-1/2 -translate-x-1/2 bg-teal-400/10 rounded-full h-14 w-14 sm:h-16 sm:w-16 flex items-center justify-center">
              <svg width="32" height="32" fill="none" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="14" fill="#14b8a6" opacity="0.09"/>
                <rect x="10" y="11" width="12" height="10" rx="2" stroke="#14b8a6" strokeWidth="2"/>
                <path d="M14 17h4M14 19h2" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h3 className="font-semibold text-[1.10rem] sm:text-[1.17rem] mt-4 sm:mt-6 mb-1 sm:mb-2 text-teal-700">Booking History</h3>
            <p className="text-teal-900/70 text-[1.07rem] sm:text-[1.12rem] font-normal">
              Track your past tickets and manage future trips.
            </p>
          </div>
        </div>
      </section>

      {/* Why SmartYatri Section */}
      <section className="w-full py-10 sm:py-14 px-4 sm:px-5 md:px-0 flex flex-col items-center border-t border-blue-100/70 bg-gradient-to-br from-blue-50/50 to-white/90 z-10">
        <h2 className="text-[2rem] sm:text-[2.5rem] md:text-[2.85rem] font-bold text-blue-900 text-center mb-7 sm:mb-10 tracking-tight animate-fade-in-down">
          🎯 Why SmartYatri?
        </h2>
        <div className="max-w-2xl mx-auto text-center text-blue-800/90 text-[1.18rem] sm:text-[1.22rem] font-medium animate-fade-in-up">
          SmartYatri is built to reduce long queues, simplify travel planning, and provide a smarter commute solution. With powerful features and a simple interface, it’s the perfect companion for students, office commuters, and travelers.
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 px-4 sm:px-7 md:px-20 bg-gradient-to-r from-blue-900 to-blue-800 text-slate-50 flex flex-col md:flex-row items-center justify-between mt-auto border-t border-blue-950/20 shadow-2xl z-30">
        <div className="text-[15px] sm:text-[16px] opacity-85 font-normal flex items-center gap-1 select-none">
          <svg width="20" height="20" className="inline mr-1 mb-0.5" fill="none" viewBox="0 0 20 20"><rect width="20" height="20" rx="6" fill="#2563eb" /><path d="M5 14V8.5A4 4 0 0113.4 6.2l.1.1A4 4 0 017.8 15.1l-.8-.1A4 4 0 015 14z" fill="#fff" /></svg>
          &copy; {new Date().getFullYear()} <span className="ml-1 mr-1 text-blue-200 font-semibold">SmartYatri</span> · All rights reserved.
        </div>
        <div className="flex gap-3 sm:gap-6 text-[15px] sm:text-[16px] mt-4 sm:mt-5 md:mt-0">
          <Link href="/Login" className="hover:underline hover:text-blue-300 transition font-medium">Login</Link>
          <Link href="/Signup" className="hover:underline hover:text-blue-300 transition font-medium">Sign Up</Link>
          <a href="mailto:support@smartyatri.app" className="hover:underline hover:text-blue-200 transition font-medium">Support</a>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(52px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-32px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in-up { animation: fade-in-up 0.85s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in-down { animation: fade-in-down 0.85s cubic-bezier(.4,0,.2,1) both; }

        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.92) translateY(38px);}
          60% { opacity: 1; transform: scale(1.08) translateY(-10px);}
          100% { opacity: 1; transform: scale(1) translateY(0);}
        }
        .animate-bounce-in { animation: bounce-in 1s cubic-bezier(.4,0,.2,1) 0.2s both; }
        @keyframes gradientMove {
          0%,100% {background-position:0% 50%}
          50% {background-position:100% 50%}
        }
        .animate-gradient {
          background-size: 300% 300%;
          animation: gradientMove 5s ease-in-out infinite;
        }
        html, body, #__next {
          height: 100%;
          max-width: 100vw;
          overflow-x: hidden;
        }
        main {
          min-height: 100vh;
          max-width: 100vw;
          overflow: hidden;
        }
        /* Make scrollbar modern on primary page only */
        html, body {
          scrollbar-color: #9399ff #eef4ff;
          scrollbar-width: thin;
        }
        ::-webkit-scrollbar {
          width: 9px;
          background: #ecf0fe;
        }
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg,#597bfb 0%,#bfd5fd 100%);
          border-radius: 999px;
        }
        /* Remove double scrollbars on mobile when mobile menu open */
        body {
          overscroll-behavior: contain;
        }
      `}</style>
    </main>
  );
}