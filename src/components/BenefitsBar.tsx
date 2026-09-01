import React from "react";

const benefits = [
  {
    id: "free-shipping",
    title: "FREE SHIPPING",
    subtitle: "On all orders",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#c8874a"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0"
      >
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M14 9h4l4 4v4a1 1 0 0 1-1 1h-2" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    ),
  },
  {
    id: "easy-returns",
    title: "EASY RETURNS",
    subtitle: "14 days return",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#c8874a"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="m9 10-2 2 2 2" />
        <path d="M7 12h7a3 3 0 0 1 0 6h-2" />
      </svg>
    ),
  },
  {
    id: "secure-payment",
    title: "SECURE PAYMENT",
    subtitle: "100% protected",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="#c8874a"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
];

export default function BenefitsBar() {
  return (
    <div className="bg-[#070707] border-t border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 divide-x divide-white/[0.08]">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="flex flex-col md:flex-row items-center text-center md:text-left gap-1.5 sm:gap-3.5 py-4 sm:py-6 px-1.5 sm:px-8 justify-center"
            >
              {benefit.icon}
              <div>
                <p className="text-[9px] sm:text-[12px] font-bold tracking-[0.1em] sm:tracking-[0.16em] text-white uppercase leading-tight">
                  {benefit.title}
                </p>
                <p className="text-[8.5px] sm:text-[12px] text-neutral-400 font-normal tracking-tight sm:tracking-wide mt-0.5 leading-tight">
                  {benefit.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
