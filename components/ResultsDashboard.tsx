import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, ReferenceLine } from 'recharts';
import type { AnalysisResult, HistoricalData, Recommendation, ActionableSuggestion } from '../types';

const ContentRenderer: React.FC<{ text: string; ordered?: boolean }> = ({ text, ordered = false }) => {
    if (!text) return null;

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return null;

    const isListDetected = lines.length > 1 && /^\s*(\d+\.|-|\*)\s/.test(lines[0]);

    if (isListDetected || ordered) {
        const isOrderedList = ordered || /^\s*\d+\./.test(lines[0]);
        const ListTag = isOrderedList ? 'ol' : 'ul';
        const listClass = isOrderedList ? 'list-decimal' : 'list-disc';

        return (
            <ListTag className={`pl-4 sm:pl-5 space-y-1 sm:space-y-1.5 ${listClass} text-slate-300 leading-relaxed text-sm sm:text-base`}>
                {lines.map((line, index) => (
                    <li key={index}>
                        {line.replace(/^\s*(\d+\.|-|\*)\s*/, '')}
                    </li>
                ))}
            </ListTag>
        );
    }

    return (
        <div className="space-y-2">
            {lines.map((line, index) => (
                <p key={index} className="text-slate-300 leading-relaxed text-justify text-sm sm:text-base">
                    {line}
                </p>
            ))}
        </div>
    );
};


const SuggestionDetail: React.FC<{ suggestion: ActionableSuggestion }> = ({ suggestion }) => {
    return (
        <div className="p-3 sm:p-4 bg-slate-700/20 rounded-md border border-slate-700">
            <h4 className="font-semibold text-lg sm:text-xl text-emerald-300 mb-2">{suggestion.action}</h4>
            <div className="mt-3 sm:mt-4 space-y-4 sm:space-y-6 text-xs sm:text-sm">
                <div>
                    <p className="font-semibold text-slate-200 mb-1 sm:mb-1.5">Rasional</p>
                    <ContentRenderer text={suggestion.rationale} />
                </div>
                <div>
                    <p className="font-semibold text-slate-200 mb-1 sm:mb-1.5">Target IKU</p>
                    <ContentRenderer text={suggestion.kpi} />
                </div>
                <div>
                    <p className="font-semibold text-slate-200 mb-1 sm:mb-1.5">Langkah Implementasi</p>
                    <ContentRenderer text={suggestion.implementation_steps} ordered={true} />
                </div>
                 <div>
                    <p className="font-semibold text-slate-200 mb-1 sm:mb-1.5">Potensi Risiko</p>
                    <ContentRenderer text={suggestion.potential_risk} />
                </div>
            </div>
        </div>
    );
};


const RecommendationAccordion: React.FC<{ item: Recommendation }> = ({ item }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const iconMap: { [key: string]: React.ReactNode } = {
      'Pendapatan': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      'Aset': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>,
      'Piutang': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
      'Inventaris': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  };
  const defaultIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  
  const matchedIcon = Object.keys(iconMap).find(key => item.category.toLowerCase().includes(key.toLowerCase()));

  return (
    <div className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-800/70 shadow-md">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-3 sm:p-4 bg-slate-700/30 hover:bg-slate-700/60 transition duration-300">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <span className="text-emerald-400 flex-shrink-0">{matchedIcon ? iconMap[matchedIcon] : defaultIcon}</span>
          <span className="font-semibold text-slate-100 text-left text-sm sm:text-base break-words">{item.category}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 sm:h-5 sm:w-5 transform transition-transform text-slate-400 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-3 sm:p-4 bg-transparent space-y-3 sm:space-y-4">
           {item.suggestions.map((suggestion, index) => (
              <SuggestionDetail key={index} suggestion={suggestion} />
           ))}
        </div>
      )}
    </div>
  );
};

const AtrGauge: React.FC<{ value: number }> = ({ value }) => {
    const [displayValue, setDisplayValue] = React.useState(0);
    const MAX_ATR_SCALE = 2.5;

    React.useEffect(() => {
        let start = displayValue;
        const end = value;
        if (start === end) return;

        let startTime: number | null = null;
        const duration = 750; // ms

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const newDisplayValue = start + (end - start) * progress;
            setDisplayValue(newDisplayValue);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setDisplayValue(end); // Ensure it ends on the exact value
            }
        };

        window.requestAnimationFrame(step);
        
        return () => { startTime = null; };
    }, [value]);

    const percentage = Math.min(100, (value / MAX_ATR_SCALE) * 100);
    const angle = (percentage / 100) * 180;
    
    const getGaugeInfo = (atr: number) => {
        if (atr < 1.0) return { label: 'Needs Improvement', color: 'text-orange-400' };
        if (atr >= 1.0 && atr < 1.5) return { label: 'Efficient', color: 'text-emerald-400' };
        return { label: 'Very Efficient', color: 'text-sky-400' };
    };

    const { label, color } = getGaugeInfo(value);

    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    };

    const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
      const start = polarToCartesian(x, y, radius, endAngle);
      const end = polarToCartesian(x, y, radius, startAngle);
      const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
      return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y].join(' ');
    };

    const threshold1 = polarToCartesian(100, 100, 80, (1.0 / MAX_ATR_SCALE) * 180);
    const threshold2 = polarToCartesian(100, 100, 80, (1.5 / MAX_ATR_SCALE) * 180);

    return (
        <div className="relative w-full max-w-lg mx-auto">
            <svg viewBox="0 0 200 120" className="w-full h-auto">
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f43f5e" />
                        <stop offset="40%" stopColor="#f97316" />
                        <stop offset="60%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <path d={describeArc(100, 100, 80, 0, 180)} fill="none" stroke="#1e293b" strokeWidth="24" strokeLinecap="round" />
                <path d={describeArc(100, 100, 80, 0, angle)} fill="none" stroke="url(#gaugeGradient)" strokeWidth="24" strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.75s cubic-bezier(0.4, 0, 0.2, 1)', strokeDasharray: `${(angle / 180) * (Math.PI * 80)} ${(Math.PI * 80)}` }} />
                
                <circle cx={threshold1.x} cy={threshold1.y} r="4" fill="#0f172a" stroke="#f97316" strokeWidth="2" />
                <circle cx={threshold2.x} cy={threshold2.y} r="4" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />

                <g transform={`rotate(${angle - 90} 100 100)`} style={{ transition: 'transform 0.75s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                    <path d="M100 20 L92 100 L108 100 Z" fill="#f8fafc" filter="url(#glow)" />
                    <circle cx="100" cy="100" r="10" fill="#f8fafc" stroke="#1e293b" strokeWidth="3"/>
                </g>
            </svg>
            <div className="absolute top-[55%] left-1/2 -translate-x-1/2 text-center">
                <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tabular-nums">{displayValue.toFixed(2)}</div>
                <div className={`mt-2 text-lg sm:text-xl font-semibold ${color} transition-colors duration-500`}>{label}</div>
            </div>
        </div>
    );
};

interface ResultsDashboardProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  historicalData: HistoricalData[];
  onClearHistory: () => void;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, isLoading, error, historicalData, onClearHistory }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6 sm:p-10 bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-800 min-h-[300px] sm:min-h-[400px]">
        <div className="text-center">
            <svg className="animate-spin mx-auto h-10 w-10 sm:h-12 sm:w-12 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 sm:mt-4 text-slate-200 font-semibold text-sm sm:text-base">Adiwidia is analyzing your data...</p>
            <p className="text-xs sm:text-sm text-slate-300">This may take a few seconds.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/50 border-l-4 border-red-500 p-3 sm:p-4 rounded-md shadow-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-xs sm:text-sm text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result && historicalData.length === 0) {
    return (
      <div className="text-center p-6 sm:p-10 bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-800 min-h-[300px] sm:min-h-[400px] flex flex-col justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 text-slate-700 mb-3 sm:mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2a4 4 0 00-4-4H3V7h2a4 4 0 004-4V1h4v2a4 4 0 004 4h2v4h-2a4 4 0 00-4 4v2H9z" /></svg>
        <h3 className="text-lg sm:text-xl font-semibold text-slate-200">Welcome!</h3>
        <p className="mt-2 text-slate-400 max-w-md text-sm sm:text-base text-center px-4">Enter your hospital's financial data on the left to begin the analysis and receive AI-driven recommendations.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {result && (
        <div className="bg-slate-900/70 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-slate-800">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Analysis Results</h2>
            
            {/* ATR Gauge - Full Width Row */}
            <div className="mb-6 sm:mb-8">
                <div className="flex flex-col items-center justify-center bg-slate-800/50 p-6 sm:p-8 rounded-lg border border-slate-700">
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-300 mb-4 sm:mb-6 text-center">Asset Turnover Ratio</h3>
                    <div className="w-full max-w-md mx-auto">
                        <AtrGauge value={result.atr} />
                    </div>
                    <p className="text-sm sm:text-base text-slate-500 mt-6 sm:mt-8 text-center max-w-lg">A higher ratio indicates better asset efficiency and optimal utilization of hospital assets.</p>
                </div>
            </div>

            {/* Analysis Section */}
            <div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-4 sm:mb-6">Adiwidia In-Depth Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-slate-800/60 rounded-lg border border-slate-700">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto sm:mx-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            </div>
                            <div className="text-center sm:text-left">
                                <h4 className="font-semibold text-slate-200 text-sm sm:text-base">Kesehatan Finansial</h4>
                                <div className="mt-1 text-sm sm:text-base">
                                    <ContentRenderer text={result.analysis.financialHealth} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-slate-800/60 rounded-lg border border-slate-700">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto sm:mx-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            </div>
                            <div className="text-center sm:text-left">
                                <h4 className="font-semibold text-slate-200 text-sm sm:text-base">Efisiensi Operasional</h4>
                                <div className="mt-1 text-sm sm:text-base">
                                    <ContentRenderer text={result.analysis.operationalEfficiency} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-slate-800/60 rounded-lg border border-slate-700">
                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto sm:mx-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <div className="text-center sm:text-left">
                                <h4 className="font-semibold text-slate-200 text-sm sm:text-base">Posisi Strategis</h4>
                                <div className="mt-1 text-sm sm:text-base">
                                    <ContentRenderer text={result.analysis.strategicPosition} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <div className="mt-6 sm:mt-8">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Strategic Recommendations</h3>
                <div className="space-y-2 sm:space-y-3">
                    {result.recommendations.map((item, index) => (
                        <RecommendationAccordion key={index} item={item} />
                    ))}
                </div>
            </div>
        </div>
      )}

      {historicalData.length > 0 && (
          <div className="bg-slate-900/70 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-2xl border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4 space-y-2 sm:space-y-0">
              <h2 className="text-xl sm:text-2xl font-bold text-white">Asset Turnover Ratio Trend</h2>
              <button
                onClick={onClearHistory}
                className="text-sm text-rose-500 hover:text-rose-400 font-medium transition self-start sm:self-auto"
              >
                Clear History
              </button>
            </div>
            <div style={{ width: '100%', height: '250px' }} className="sm:h-[300px]">
              <ResponsiveContainer>
                <AreaChart data={historicalData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }} className="sm:margin-right-20">
                   <defs>
                    <linearGradient id="colorAtr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tick={{ dy: 5 }} className="sm:text-xs" />
                  <YAxis stroke="#64748b" fontSize={10} className="sm:text-xs" />
                  <ReferenceLine y={1.0} label={{ value: 'Efficient', position: 'insideTopLeft', fill: '#f59e0b', fontSize: 10 }} stroke="#f59e0b" strokeDasharray="4 4" className="sm:fontSize-12" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid #334155',
                      borderRadius: '0.5rem',
                      color: '#e2e8f0',
                      fontSize: '0.75rem'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.75rem' }} verticalAlign="top" align="right" iconSize={8} height={25} className="sm:text-sm sm:iconSize-10 sm:height-30" />
                  <Brush dataKey="name" height={25} stroke="#10b981" fill="#0f172a" y={220} className="sm:height-30 sm:y-265"/>
                  <Area type="monotone" dataKey="atr" stroke="#10b981" fillOpacity={1} fill="url(#colorAtr)" strokeWidth={2} name="ATR"/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      }
    </div>
  );
};