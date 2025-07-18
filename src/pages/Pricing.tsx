import React from "react";
import logo from "../assets/fAIshion_logo.avif";

const plans = [
  {
    name: "Free",
    price: 0,
    currency: "USD",
    period: "monthly",
    features: [
      { text: "Discounts and promotions tab", included: false },
      { text: "Limited daily virtual try-ons", included: false },
      { text: "Limited size recommendations based on measurements", included: false },
    ],
    button: {
      text: "Your current plan",
      disabled: true,
    },
    recommended: false,
  },
  {
    name: "Plus",
    price: 5,
    currency: "USD",
    period: "monthly",
    features: [
      { text: "History tab", included: true },
      { text: "Discounts and promotions tab", included: true },
      { text: "Unlimited virtual try-ons", included: true },
      { text: "Unlimited size recommendations based on measurements", included: true },
      { text: "Virtual try-on custom background generator", included: true },
    ],
    button: {
      text: "Get Plus",
      disabled: false,
    },
    recommended: true,
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 flex flex-col">
      {/* Navbar */}
      <header className="flex items-center justify-between px-12 py-4 bg-white shadow-sm font-sans">
        <div className="flex items-center">
          <img src={logo} alt="fAIshion logo" className="h-8 w-auto" />
        </div>
        <nav className="flex space-x-10 text-gray-700 font-medium text-lg font-sans">
          <a href="#" className="hover:text-black transition-colors">Home</a>
          <a href="#" className="hover:text-black transition-colors">How it works</a>
          <a href="#" className="hover:text-black transition-colors">Blog</a>
          <a href="#" className="hover:text-black transition-colors">More</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center flex-1 px-4 py-10 font-sans bg-white">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Unlock Effortless Shopping</h1>
        <p className="text-lg text-gray-600 mb-10 text-center">Find your perfect plan and take the hassle out of shopping for good</p>

        {/* Plans */}
        <div className="flex flex-col md:flex-row gap-8 mb-10">
          {/* Free Card */}
          <div className="flex-1 bg-white border border-black rounded-[24px] p-10 min-w-[350px] max-w-[420px] transition-all duration-200 relative font-sans">
            <h2 className="text-3xl font-bold text-black mb-6">Free</h2>
            <div className="flex items-end mb-8">
              <span className="text-5xl font-bold text-black mr-2">$0</span>
              <div className="flex flex-col leading-tight">
                <span className="text-base text-gray-500 font-medium">USD/</span>
                <span className="text-base text-gray-500">monthly</span>
              </div>
            </div>
            <ul className="mb-10 space-y-4">
              <li className="flex items-center text-lg text-black"><span className="text-green-500 text-2xl mr-3">✓</span>Discounts and promotions tab</li>
              <li className="flex items-center text-lg text-black"><span className="text-red-500 text-2xl mr-3">✗</span>Limited daily virtual try-ons</li>
              <li className="flex items-center text-lg text-black"><span className="text-red-500 text-2xl mr-3">✗</span>Limited size recommendations based on measurements</li>
            </ul>
            <div className="flex justify-center w-full mt-16">
              <button className="w-3/4 bg-[#B3B3B3] text-white text-lg font-medium py-4 rounded-full" disabled>Your current plan</button>
            </div>
          </div>
          {/* Plus Card */}
          <div className="flex-1 bg-[#ECEAF3] border border-[#A78BFA] rounded-[24px] p-10 min-w-[350px] max-w-[420px] transition-all duration-200 relative font-sans">
            <div className="flex items-center mb-6">
              <h2 className="text-3xl font-bold text-black mr-3">Plus</h2>
              <span className="bg-gradient-to-r from-[#D1E9FF] to-[#E0D7FF] text-[#7C5CDB] text-base font-semibold px-4 py-1 rounded-full">Recommended</span>
            </div>
            <div className="flex items-end mb-8">
              <span className="text-5xl font-bold text-black mr-2">$5</span>
              <div className="flex flex-col leading-tight">
                <span className="text-base text-gray-500 font-medium">USD/</span>
                <span className="text-base text-gray-500">monthly</span>
              </div>
            </div>
            <ul className="mb-10 space-y-4">
              <li className="flex items-center text-lg text-black"><span className="text-green-500 text-2xl mr-3">✓</span>History tab</li>
              <li className="flex items-center text-lg text-black"><span className="text-green-500 text-2xl mr-3">✓</span>Discounts and promotions tab</li>
              <li className="flex items-center text-lg text-black"><span className="text-green-500 text-2xl mr-3">✓</span>Unlimited virtual try-ons</li>
              <li className="flex items-center text-lg text-black"><span className="text-green-500 text-2xl mr-3">✓</span>Unlimited size recommendations based on measurements</li>
              <li className="flex items-center text-lg text-black"><span className="text-green-500 text-2xl mr-3">✓</span>Virtual try-on custom background generator</li>
            </ul>
            <button className="w-full bg-[#5F52D9] text-white text-lg font-medium py-4 rounded-full mt-8">Get Plus</button>
          </div>
        </div>

        {/* OR Divider */}
        <div className="flex items-center w-full max-w-2xl mb-8">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="mx-4 text-gray-500 font-semibold">OR</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        {/* Invite a Friend */}
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center mt-12 font-sans">
          <h3 className="text-3xl font-bold mb-2 text-center">Invite a Friend for Some Perks</h3>
          <p className="text-xl text-gray-700 mb-8 text-center">Invite a friend and you’ll both get 1 day of free access to all Plus features</p>
          <div className="flex flex-col md:flex-row w-full gap-6 mb-4">
            {/* Remaining Free Pro Days */}
            <div className="flex-1 bg-white border border-black rounded-[18px] flex items-center justify-between px-8 py-6 text-xl font-semibold">
              <span>Remaining Free Pro Days</span>
              <span className="font-bold">2</span>
            </div>
            {/* Invite input and button */}
            <div className="flex-1 flex flex-col gap-3">
              <div className="flex w-full gap-3">
                <input type="email" placeholder="" className="flex-1 border border-[#A78BFA] rounded-[12px] px-4 py-2 text-lg focus:outline-none" />
                <button className="bg-[#6C5DD3] text-white text-lg font-semibold px-6 py-2 rounded-[12px]">Send Invite</button>
              </div>
              <button className="w-full bg-[#6C5DD3] text-white text-lg font-semibold py-3 rounded-[14px] mt-1">Copy Invite Link</button>
            </div>
          </div>
          {/* Social icons row */}
          <div className="flex gap-6 mt-4">
            {/* Instagram */}
            <span className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#6C5DD3] text-[#6C5DD3]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/></svg>
            </span>
            {/* WhatsApp */}
            <span className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#6C5DD3] text-[#6C5DD3]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.67 20.13A10 10 0 1 0 3.87 3.87a10 10 0 0 0 13.36 13.36l3.11 3.11a1 1 0 0 0 1.42-1.42z"/><path d="M8.5 12.5a4 4 0 0 1 7 0"/></svg>
            </span>
            {/* TikTok */}
            <span className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#6C5DD3] text-[#6C5DD3]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 17a5 5 0 1 1 5-5V3h3a5 5 0 0 0 5 5"/></svg>
            </span>
            {/* Snapchat */}
            <span className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-[#6C5DD3] text-[#6C5DD3]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.7 17.29c.41.13.83.24 1.26.32.36.07.74.13 1.12.17.13.01.25.02.38.02.18 0 .36-.01.54-.03.13-.01.25-.03.37-.05.13-.02.25-.05.37-.08.13-.03.25-.07.37-.11.13-.04.25-.09.37-.14.13-.05.25-.11.37-.17.13-.06.25-.13.37-.2.13-.07.25-.15.37-.23.13-.09.25-.18.37-.28.13-.1.25-.21.37-.32.13-.12.25-.25.37-.38.13-.14.25-.29.37-.44.13-.16.25-.33.37-.5.13-.18.25-.37.37-.56.13-.2.25-.41.37-.62.13-.22.25-.45.37-.68.13-.24.25-.49.37-.74.13-.26.25-.53.37-.8.13-.28.25-.57.37-.86.13-.3.25-.61.37-.92.13-.32.25-.65.37-.98.13-.34.25-.69.37-1.04.13-.36.25-.73.37-1.1.13-.38.25-.77.37-1.16.13-.4.25-.81.37-1.22.13-.42.25-.85.37-1.28.13-.44.25-.89.37-1.34.13-.46.25-.93.37-1.4.13-.48.25-.97.37-1.46.13-.5.25-1.01.37-1.52.13-.52.25-1.05.37-1.58.13-.54.25-1.09.37-1.64.13-.56.25-1.13.37-1.7.13-.58.25-1.17.37-1.76.13-.6.25-1.21.37-1.82.13-.62.25-1.25.37-1.88.13-.64.25-1.29.37-1.94.13-.66.25-1.33.37-2 .13-.68.25-1.37.37-2.06.13-.7.25-1.41.37-2.12.13-.72.25-1.45.37-2.18.13-.74.25-1.49.37-2.24.13-.76.25-1.53.37-2.3.13-.78.25-1.57.37-2.36.13-.8.25-1.61.37-2.42.13-.82.25-1.65.37-2.48.13-.84.25-1.69.37-2.54.13-.86.25-1.73.37-2.6.13-.88.25-1.77.37-2.66.13-.9.25-1.81.37-2.72.13-.92.25-1.85.37-2.78.13-.94.25-1.89.37-2.84.13-.96.25-1.93.37-2.9.13-.98.25-1.97.37-2.96.13-.99.25-2 .37-3.01.13-1.02.25-2.05.37-3.09.13-1.04.25-2.09.37-3.15.13-1.07.25-2.14.37-3.22.13-1.09.25-2.19.37-3.3.13-1.11.25-2.23.37-3.36.13-1.14.25-2.29.37-3.45.13-1.17.25-2.35.37-3.54.13-1.19.25-2.39.37-3.6.13-1.21.25-2.43.37-3.66.13-1.24.25-2.47.37-3.72.13-1.26.25-2.51.37-3.78.13-1.28.25-2.55.37-3.83.13-1.31.25-2.59.37-3.88.13-1.34.25-2.68.37-4.03.13-1.37.25-2.74.37-4.12.13-1.41.25-2.81.37-4.22.13-1.45.25-2.9.37-4.33.13-1.49.25-2.99.37-4.45.13-1.53.25-3.07.37-4.57.13-1.57.25-3.15.37-4.7.13-1.61.25-3.23.37-4.83.13-1.65.25-3.29.37-4.97.13-1.69.25-3.35.37-5.11.13-1.73.25-3.47.37-5.25.13-1.77.25-3.53.37-5.39.13-1.81.25-3.61.37-5.53.13-1.85.25-3.69.37-5.67.13-1.89.25-3.77.37-5.81.13-1.93.25-3.85.37-5.95.13-1.97.25-3.93.37-6.09.13-2.01.25-4.01.37-6.23.13-2.05.25-4.09.37-6.37.13-2.09.25-4.17.37-6.51.13-2.13.25-4.25.37-6.65.13-2.17.25-4.33.37-6.79.13-2.21.25-4.41.37-6.93.13-2.25.25-4.49.37-7.07.13-2.29.25-4.57.37-7.21.13-2.33.25-4.65.37-7.35.13-2.37.25-4.73.37-7.49.13-2.41.25-4.81.37-7.63.13-2.45.25-4.89.37-7.77.13-2.49.25-4.97.37-7.91.13-2.53.25-5.05.37-8.05.13-2.57.25-5.13.37-8.19.13-2.61.25-5.21.37-8.33.13-2.65.25-5.29.37-8.47.13-2.69.25-5.37.37-8.61.13-2.73.25-5.45.37-8.75.13-2.77.25-5.53.37-8.89.13-2.81.25-5.61.37-9.03.13-2.85.25-5.69.37-9.17.13-2.89.25-5.77.37-9.31.13-2.93.25-5.85.37-9.45.13-2.97.25-5.93.37-9.59.13-3.01.25-6.01.37-9.73.13-3.05.25-6.09.37-9.87.13-3.09.25-6.17.37-10.01.13-3.13.25-6.25.37-10.15.13-3.17.25-6.33.37-10.29.13-3.21.25-6.41.37-10.43.13-3.25.25-6.49.37-10.57.13-3.29.25-6.57.37-10.71.13-3.33.25-6.65.37-10.85.13-3.37.25-6.73.37-10.99.13-3.41.25-6.81.37-11.13.13-3.45.25-6.89.37-11.27.13-3.49.25-6.97.37-11.41.13-3.53.25-7.05.37-11.55.13-3.57.25-7.13.37-11.69.13-3.61.25-7.21.37-11.83.13-3.65.25-7.29.37-11.97.13-3.69.25-7.37.37-12.11.13-3.73.25-7.45.37-12.25.13-3.77.25-7.53.37-12.39.13-3.81.25-7.61.37-12.53.13-3.85.25-7.69.37-12.67.13-3.89.25-7.77.37-12.81.13-3.93.25-7.85.37-12.95.13-3.97.25-7.93.37-13.09.13-4.01.25-8.01.37-13.23.13-4.05.25-8.09.37-13.37.13-4.09.25-8.17.37-13.51.13-4.13.25-8.25.37-13.65.13-4.17.25-8.33.37-13.79.13-4.21.25-8.41.37-13.93.13-4.25.25-8.49.37-14.07.13-4.29.25-8.57.37-14.21.13-4.33.25-8.65.37-14.35.13-4.37.25-8.73.37-14.49.13-4.41.25-8.81.37-14.63.13-4.45.25-8.89.37-14.77.13-4.49.25-8.97.37-14.91.13-4.53.25-9.05.37-15.05.13-4.57.25-9.13.37-15.19.13-4.61.25-9.21.37-15.33.13-4.65.25-9.29.37-15.47.13-4.69.25-9.37.37-15.61.13-4.73.25-9.45.37-15.75.13-4.77.25-9.53.37-15.89.13-4.81.25-9.61.37-16.03.13-4.85.25-9.69.37-16.17.13-4.89.25-9.77.37-16.31.13-4.93.25-9.85.37-16.45.13-4.97.25-9.93.37-16.59.13-5.01.25-10.01.37-16.73.13-5.05.25-10.09.37-16.87.13-5.09.25-10.17.37-17.01.13-5.13.25-10.25.37-17.15.13-5.17.25-10.33.37-17.29.13-5.21.25-10.41.37-17.43.13-5.25.25-10.49.37-17.57.13-5.29.25-10.57.37-17.71.13-5.33.25-10.65.37-17.85.13-5.37.25-10.73.37-17.99.13-5.41.25-10.81.37-18.13.13-5.45.25-10.89.37-18.27.13-5.49.25-10.97.37-18.41.13-5.53.25-11.05.37-18.55.13-5.57.25-11.13.37-18.69.13-5.61.25-11.21.37-18.83.13-5.65.25-11.29.37-18.97.13-5.69.25-11.37.37-19.11.13-5.73.25-11.45.37-19.25.13-5.77.25-11.53.37-19.39.13-5.81.25-11.61.37-19.53.13-5.85.25-11.69.37-19.67.13-5.89.25-11.77.37-19.81.13-5.93.25-11.85.37-19.95.13-5.97.25-11.93.37-20.09.13-6.01.25-12.01.37-20.23.13-6.05.25-12.09.37-20.37.13-6.09.25-12.17.37-20.51.13-6.13.25-12.25.37-20.65.13-6.17.25-12.33.37-20.79.13-6.21.25-12.41.37-20.93.13-6.25.25-12.49.37-21.07.13-6.29.25-12.57.37-21.21.13-6.33.25-12.65.37-21.35.13-6.37.25-12.73.37-21.49.13-6.41.25-12.81.37-21.63.13-6.45.25-12.89.37-21.77.13-6.49.25-12.97.37-21.91.13-6.53.25-13.05.37-22.05.13-6.57.25-13.13.37-22.19.13-6.61.25-13.21.37-22.33.13-6.65.25-13.29.37-22.47.13-6.69.25-13.37.37-22.61.13-6.73.25-13.45.37-22.75.13-6.77.25-13.53.37-22.89.13-6.81.25-13.61.37-23.03.13-6.85.25-13.69.37-23.17.13-6.89.25-13.77.37-23.31.13-6.93.25-13.85.37-23.45.13-6.97.25-13.93.37-23.59.13-7.01.25-14.01.37-23.73.13-7.05.25-14.09.37-23.87.13-7.09.25-14.17.37-24.01.13-7.13.25-14.25.37-24.15.13-7.17.25-14.33.37-24.29.13-7.21.25-14.41.37-24.43.13-7.25.25-14.49.37-24.57.13-7.29.25-14.57.37-24.71.13-7.33.25-14.65.37-24.85.13-7.37.25-14.73.37-24.99.13-7.41.25-14.81.37-25.13.13-7.45.25-14.89.37-25.27.13-7.49.25-14.97.37-25.41.13-7.53.25-15.05.37-25.55.13-7.57.25-15.13.37-25.69.13-7.61.25-15.21.37-25.83.13-7.65.25-15.29.37-25.97.13-7.69.25-15.37.37-26.11.13-7.73.25-15.45.37-26.25.13-7.77.25-15.53.37-26.39.13-7.81.25-15.61.37-26.53.13-7.85.25-15.69.37-26.67.13-7.89.25-15.77.37-26.81.13-7.93.25-15.85.37-26.95.13-7.97.25-15.93.37-27.09.13-8.01.25-16.01.37-27.23"/></svg>
            </span>
            {/* Facebook */}
            <span className="w-12 h-12 flex items-center justify-center rounded-full bg-[#6C5DD3] text-white">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
