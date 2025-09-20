import React from 'react';

const HospitalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    <path d="M12 11h4"></path>
    <path d="M10 13V9"></path>
  </svg>
);


export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/50 border-b border-slate-800 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-emerald-500 to-sky-500 text-white p-2.5 rounded-lg shadow-lg">
              <HospitalIcon />
            </div>
            <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">
                Hospital Asset Turnover Optimizer
                </h1>
                <p className="text-sm text-slate-300">AI-Powered Insights for Peak Efficiency</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};