import React from "react";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="relative items-center hidden w-full h-full overflow-hidden lg:w-1/2 lg:flex">
          <img
            className="absolute inset-0 object-cover w-full h-full"
            src="/images/background/beautinow-niche-perfume-0sHorINihAI-unsplash.jpg"
            alt="Perfume bottles"
          />
          <div className="absolute inset-0 bg-black/35" />
          <div className="relative z-1 flex flex-col items-center justify-center w-full h-full text-white">
            <span className="text-4xl font-semibold tracking-[0.3em]">
              NOVIC
            </span>
            <span className="mt-3 text-lg tracking-[0.45em] lowercase">
              fragrances
            </span>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}
