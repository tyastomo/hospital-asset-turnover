
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { DataInputForm } from './components/DataInputForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import type { FinancialData, AnalysisResult, HistoricalData, DataInput } from './types';
import { ValidationError, GeminiApiError } from './types';
import { getOptimizationSuggestions } from './services/geminiService';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [historicalData, setHistoricalData] = useLocalStorage<HistoricalData[]>('hospitalAtrHistory', []);

  const handleCalculate = useCallback(async (data: DataInput) => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const { netRevenue, startAssets, endAssets, analysisScope, bpjsStatus, hospitalType, hospitalSpecialty, aiPersona } = data;
      
      if (analysisScope === 'unit' && !data.unitName) {
        throw new ValidationError("Nama unit/departemen harus dipilih untuk analisis per unit.");
      }
      
      const unitIdentifier = analysisScope === 'global' ? 'Seluruh Rumah Sakit' : data.unitName!;

      const averageAssets = (startAssets + endAssets) / 2;
      
      if (averageAssets === 0) {
        throw new ValidationError("Rata-rata total aset tidak boleh nol. Periksa kembali input aset awal dan akhir periode.");
      }

      const atr = parseFloat((netRevenue / averageAssets).toFixed(2));
      
      const financialDataForAI: FinancialData = {
        unitName: unitIdentifier,
        netRevenue,
        startAssets,
        endAssets,
        bpjsStatus,
        hospitalType,
        hospitalSpecialty,
        aiPersona,
      };

      const aiSuggestions = await getOptimizationSuggestions({ ...financialDataForAI, atr });

      const newResult: AnalysisResult = {
        atr,
        ...aiSuggestions,
      };

      setAnalysisResult(newResult);
      
      const periodForIdentifier = historicalData.filter(h => h.name.split(' - ')[0] === unitIdentifier).length + 1;
      const newHistoricalEntry: HistoricalData = {
        name: `${unitIdentifier} - P${periodForIdentifier}`,
        atr,
      };
      setHistoricalData(prev => [...prev, newHistoricalEntry]);

    } catch (err) {
      if (err instanceof ValidationError) {
        setError(`Kesalahan Input: ${err.message}`);
      } else if (err instanceof GeminiApiError) {
        setError(`Kesalahan Analisis AI: ${err.message}`);
      } else if (err instanceof Error) {
        setError(`Terjadi kesalahan yang tidak terduga: ${err.message}`);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [historicalData, setHistoricalData]);

  const handleClearHistory = () => {
    setHistoricalData([]);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 bg-slate-900/70 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-slate-800">
            <DataInputForm onSubmit={handleCalculate} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-2">
            <ResultsDashboard
              result={analysisResult}
              isLoading={isLoading}
              error={error}
              historicalData={historicalData}
              onClearHistory={handleClearHistory}
            />
          </div>
        </div>
      </main>
      <footer className="text-center p-4 mt-8 text-sm text-slate-400">
        <p>&copy; Adiwidia Bernas Winaya.</p>
      </footer>
    </div>
  );
};

export default App;
