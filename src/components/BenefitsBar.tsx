import React from "react";

const benefits = [
  {
    id: "free-shipping",
    title: "FREE SHIPPING",
    subtitle: "On all orders",
    icon: (
      <svg
        viewBox="0 0 32 24"
        fill="none"
        stroke="#c8874a"
        strokeWidth="1.5"
        className="w-8 h-6 flex-shrink-0"
      >
        <rect x="1" y="5" width="20" height="14" rx="1.5" />
        <path d="M21 9h6l4 5v5h-10V9z" />
        <circle cx="7" cy="20" r="2" fill="#c8874a" stroke="none" />
        <circle cx="24" cy="20" r="2" fill="#c8874a" stroke="none" />
      </svg>
    ),
  },
  {
    id: "easy-returns",
    title: "EASY RETURNS",
    subtitle: "14 days return",
    icon: (
      <svg
        viewBox="0 0 28 28"
        fill="none"
        stroke="#c8874a"
        strokeWidth="1.5"
        className="w-7 h-7 flex-shrink-0"
      >
        <circle cx="14" cy="14" r="12" />
        <path d="M9 14l3-3-3-3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 11H8.5a4.5 4.5 0 100 9H14" strokeLinecap="round" />
        <path d="M17 11l2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "secure-payment",
    title: "SECURE PAYMENT",
    subtitle: "100% protected",
    icon: (
      <svg
        viewBox="0 0 28 28"
        fill="none"
        stroke="#c8874a"
        strokeWidth="1.5"
        className="w-7 h-7 flex-shrink-0"
      >
        <path d="M14 2L4 6v8c0 5.5 4.4 10.7 10 12 5.6-1.3 10-6.5 10-12V6L14 2z" />
        <path d="M10 14l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function BenefitsBar() {
  return (
    <div className="bg-[#0a0a0a] border-t border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 divide-x divide-neutral-800">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 py-4 sm:py-5 px-2 sm:px-5 justify-center"
            >
              {benefit.icon}
              <div className="text-center sm:text-left">
                <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.18em] text-white uppercase">
                  {benefit.title}
                </p>
                <p className="text-[9px] sm:text-[10px] text-neutral-500 tracking-wide mt-0.5">
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
