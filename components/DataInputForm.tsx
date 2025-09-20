import React, { useEffect, useState } from 'react';
import type { DataInput, BpjsStatus, HospitalType, AnalysisScope, AIPersona } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useQueryParams } from '../hooks/useQueryParams';
import { formatNumberWithDots, parseFormattedNumber } from '../utils/urlHelpers';

interface DataInputFormProps {
  onSubmit: (data: DataInput) => void;
  isLoading: boolean;
}

const DEPARTMENTS = [
    "Instalasi Gawat Darurat (IGD)",
    "Unit Perawatan Intensif (ICU)",
    "Unit Perawatan Tinggi (HCU)",
    "Unit Perawatan Koroner Intensif (ICCU)",
    "ICU Anak/Neonatal (PICU/NICU)",
    "Kamar Operasi (Bedah Sentral)",
    "Ruang Pemulihan (RR)",
    "Klinik Rawat Jalan (Umum & Spesialis)",
    "Rawat Inap - Penyakit Dalam",
    "Rawat Inap - Bedah",
    "Rawat Inap - Anak",
    "Rawat Inap - Obstetri & Ginekologi",
    "Rawat Inap - Saraf",
    "Rawat Inap - VIP/VVIP",
    "Ruang Isolasi",
    "Laboratorium (Klinik & Patologi Anatomi)",
    "Radiologi & Pencitraan Diagnostik",
    "Farmasi & Gudang Farmasi",
    "Rehabilitasi Medik (Fisioterapi, Okupasi)",
    "Unit Hemodialisa",
    "Unit Kemoterapi",
    "Bank Darah",
    "Unit Endoskopi",
    "Laboratorium Kateterisasi (Cath Lab)",
    "Gizi & Dapur",
    "Rekam Medis",
    "CSSD & Laundry",
    "Pemeliharaan Sarana Prasarana RS (IPSRS)",
    "Sanitasi & Pengelolaan Limbah",
    "Ambulans & Transportasi",
    "Instalasi Pemulasaraan Jenazah",
    "Manajemen, Keuangan, & SDM",
    "Humas & Pemasaran",
    "IT / SIMRS",
    "Lainnya"
];

const SPECIALTY_HOSPITALS = [
    "Ibu dan Anak (KIA)",
    "Jantung dan Pembuluh Darah",
    "Kanker (Onkologi)",
    "Otak dan Saraf (Neurologi)",
    "Paru (Respirasi/Pulmonologi)",
    "THT (Telinga, Hidung, Tenggorokan)",
    "Mata",
    "Gigi dan Mulut",
    "Bedah (Umum & Terspesialisasi)",
    "Ortopedi dan Traumatologi",
    "Penyakit Infeksi Tropis",
    "Jiwa",
    "Kulit dan Kelamin",
    "Ginjal dan Hipertensi (Nefrologi)",
    "Pencernaan dan Hati (Gastroenterologi-Hepatologi)",
    "Rehabilitasi Medik",
    "Geriatri",
    "Ketergantungan Obat & Rehabilitasi",
    "Urologi",
    "Bedah Plastik & Estetika",
    "Kedokteran Olahraga",
    "Lainnya"
];


const NumberInputField: React.FC<{ id: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onToggleSign: () => void; placeholder: string }> = ({ id, label, value, onChange, onToggleSign, placeholder }) => {
    const isNegative = value.startsWith('-');

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1.5">
                {label}
            </label>
            <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    Rp
                </span>
                <input
                    type="text"
                    inputMode="numeric"
                    id={id}
                    name={id}
                    value={value}
                    onChange={onChange}
                    className={`w-full pl-9 pr-12 py-2 border border-slate-700 rounded-md shadow-sm bg-slate-800/50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${isNegative ? 'text-red-400' : 'text-slate-100'}`}
                    placeholder={placeholder}
                    required
                />
                <button
                    type="button"
                    onClick={onToggleSign}
                    className={`absolute inset-y-0 right-0 flex items-center justify-center w-10 rounded-r-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500 transition-colors duration-200 ${isNegative ? 'text-red-400 hover:text-red-300' : 'text-slate-400 hover:text-emerald-400'}`}
                    aria-label={`Toggle sign for ${label}`}
                >
                    <span className="text-lg font-bold">±</span>
                </button>
            </div>
        </div>
    );
};


const RadioGroup: React.FC<{ legend: string; name: string; options: {value: string; label: string; description?: string}[]; selectedValue: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; description?: string;}> = ({ legend, name, options, selectedValue, onChange, description}) => (
    <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">{legend}</label>
        <fieldset className="flex flex-wrap gap-x-6 gap-y-2">
            {options.map(opt => (
                <div key={opt.value} className="flex items-center">
                    <input id={`${name}-${opt.value}`} name={name} type="radio" value={opt.value} checked={selectedValue === opt.value} onChange={onChange} className="h-4 w-4 text-emerald-500 bg-slate-700 border-slate-600 focus:ring-emerald-500 focus:ring-offset-slate-900" />
                    <label htmlFor={`${name}-${opt.value}`} className="ml-2 block text-sm text-slate-200">{opt.label}</label>
                </div>
            ))}
        </fieldset>
        {description && <p className="text-xs text-slate-400 mt-2">{description}</p>}
    </div>
);

interface FormState {
  analysisScope: AnalysisScope;
  bpjsStatus: BpjsStatus;
  hospitalType: HospitalType;
  hospitalSpecialty: string;
  unitName: string;
  netRevenue: string;
  startAssets: string;
  endAssets: string;
  aiPersona: AIPersona;
}

const initialFormState: FormState = {
  analysisScope: 'unit',
  bpjsStatus: 'bpjs',
  hospitalType: 'umum',
  hospitalSpecialty: SPECIALTY_HOSPITALS[0],
  unitName: DEPARTMENTS[0],
  netRevenue: '50.000.000.000',
  startAssets: '80.000.000.000',
  endAssets: '85.000.000.000',
  aiPersona: 'strategic',
};

const StrategicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-3 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16l2-6 6-2-2 6-6 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
  </svg>
);

const OperationalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-3 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const FinancialIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);


export const DataInputForm: React.FC<DataInputFormProps> = ({ onSubmit, isLoading }) => {
  const [formState, setFormState] = useLocalStorage<FormState>('hospitalAtrFormData', initialFormState);
  const { getNumericParam, getParam, hasParam } = useQueryParams();
  const [queryParamsApplied, setQueryParamsApplied] = useState(false);
  
  // Apply query parameters to form state on component mount - ONLY ONCE
  useEffect(() => {
    // Skip if query params have already been applied
    if (queryParamsApplied) return;
    
    // Check if there are any query parameters to apply
    const hasAnyParams = hasParam('netRevenue') || hasParam('startAssets') || hasParam('endAssets') ||
                        hasParam('analysisScope') || hasParam('bpjsStatus') || hasParam('hospitalType') ||
                        hasParam('unitName') || hasParam('hospitalSpecialty') || hasParam('aiPersona');
    
    // If no query params, reset to initial state and mark as applied
    if (!hasAnyParams) {
      setFormState(initialFormState);
      setQueryParamsApplied(true);
      return;
    }
    
    const netRevenue = getNumericParam('netRevenue');
    const startAssets = getNumericParam('startAssets');
    const endAssets = getNumericParam('endAssets');
    
    const analysisScope = getParam('analysisScope');
    const bpjsStatus = getParam('bpjsStatus');
    const hospitalType = getParam('hospitalType');
    const unitName = getParam('unitName');
    const hospitalSpecialty = getParam('hospitalSpecialty');
    const aiPersona = getParam('aiPersona');
    
    // Prepare updates object
    const updates: Partial<FormState> = {};
    
    // Apply financial data
    if (netRevenue !== null) {
      updates.netRevenue = netRevenue.toLocaleString('id-ID');
    }
    if (startAssets !== null) {
      updates.startAssets = startAssets.toLocaleString('id-ID');
    }
    if (endAssets !== null) {
      updates.endAssets = endAssets.toLocaleString('id-ID');
    }
    
    // Apply other parameters with validation
    if (analysisScope && (analysisScope === 'unit' || analysisScope === 'global')) {
      updates.analysisScope = analysisScope as AnalysisScope;
    }
    if (bpjsStatus && (bpjsStatus === 'bpjs' || bpjsStatus === 'non-bpjs')) {
      updates.bpjsStatus = bpjsStatus as BpjsStatus;
    }
    if (hospitalType && (hospitalType === 'umum' || hospitalType === 'khusus')) {
      updates.hospitalType = hospitalType as HospitalType;
    }
    if (unitName && DEPARTMENTS.includes(unitName)) {
      updates.unitName = unitName;
    }
    if (hospitalSpecialty && SPECIALTY_HOSPITALS.includes(hospitalSpecialty)) {
      updates.hospitalSpecialty = hospitalSpecialty;
    }
    if (aiPersona && (aiPersona === 'strategic' || aiPersona === 'operational' || aiPersona === 'financial')) {
      updates.aiPersona = aiPersona as AIPersona;
    }
    
    // Apply all updates at once if there are any
    if (Object.keys(updates).length > 0) {
      setFormState(prev => ({ ...prev, ...updates }));
    }
    
    // Mark query params as applied
    setQueryParamsApplied(true);
  }, []); // Empty dependency array - only run once on mount
  
  const personas = [
      { value: 'strategic' as AIPersona, label: 'Strategic Analyst', description: 'Fokus pada posisi pasar, keunggulan kompetitif, dan pertumbuhan jangka panjang.', icon: <StrategicIcon />, color: 'sky' },
      { value: 'operational' as AIPersona, label: 'Operational Expert', description: 'Fokus pada efisiensi alur kerja, utilisasi aset, dan perbaikan proses harian.', icon: <OperationalIcon />, color: 'orange' },
      { value: 'financial' as AIPersona, label: 'Financial Forecaster', description: 'Fokus pada profitabilitas, arus kas, dan dampak finansial yang terukur.', icon: <FinancialIcon />, color: 'emerald' }
  ];

  const getPersonaStyles = (personaColor: string, isSelected: boolean) => {
    const baseClasses = 'h-full flex flex-col text-left p-4 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
    if (isSelected) {
        switch (personaColor) {
            case 'sky': return `${baseClasses} bg-slate-700/50 border-sky-500 shadow-lg shadow-sky-500/10 focus:ring-sky-500`;
            case 'orange': return `${baseClasses} bg-slate-700/50 border-orange-500 shadow-lg shadow-orange-500/10 focus:ring-orange-500`;
            case 'emerald': return `${baseClasses} bg-slate-700/50 border-emerald-500 shadow-lg shadow-emerald-500/10 focus:ring-emerald-500`;
            default: return `${baseClasses} bg-slate-700/50 border-slate-500`;
        }
    } else {
        return `${baseClasses} bg-slate-800/60 border-slate-700 hover:border-slate-500 focus:ring-slate-500`;
    }
  };

  const handleStateChange = (field: keyof FormState, value: any) => {
    setFormState(prev => ({...prev, [field]: value}));
  };

  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target as { name: keyof FormState, value: string };
    setFormState(prev => ({ ...prev, [name]: formatNumberWithDots(value) }));
  };
  
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target as { name: keyof FormState, value: string };
    handleStateChange(name, value);
  };

  const handleHospitalTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newType = e.target.value as HospitalType;
    setFormState(prev => {
        const updatedState = { ...prev, hospitalType: newType };
        if (newType === 'umum') {
            updatedState.hospitalSpecialty = SPECIALTY_HOSPITALS[0];
        }
        return updatedState;
    });
  };

  const handleToggleSign = (fieldName: keyof Pick<FormState, 'netRevenue' | 'startAssets' | 'endAssets'>) => {
      setFormState(prev => {
          const currentValue = prev[fieldName];
          if (currentValue === '') return prev;
          
          const newValue = currentValue.startsWith('-')
              ? currentValue.substring(1)
              : '-' + currentValue;
          
          return { ...prev, [fieldName]: newValue };
      });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({
      analysisScope: formState.analysisScope,
      bpjsStatus: formState.bpjsStatus,
      hospitalType: formState.hospitalType,
      hospitalSpecialty: formState.hospitalType === 'khusus' ? formState.hospitalSpecialty : undefined,
      unitName: formState.analysisScope === 'unit' ? formState.unitName : undefined,
      netRevenue: parseFormattedNumber(formState.netRevenue),
      startAssets: parseFormattedNumber(formState.startAssets),
      endAssets: parseFormattedNumber(formState.endAssets),
      aiPersona: formState.aiPersona,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Input Data</h2>
      
      {/* Debug info - only show if query params were applied */}
      {queryParamsApplied && (hasParam('netRevenue') || hasParam('startAssets') || hasParam('endAssets')) && (
        <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-700/50 rounded-lg">
          <p className="text-sm text-emerald-300">
            ✓ Data berhasil dimuat - Anda bisa mengubah nilai sesuai kebutuhan
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-3">Pilih Persona AI</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {personas.map((persona) => {
              const isSelected = formState.aiPersona === persona.value;
              return (
                <button
                  key={persona.value}
                  type="button"
                  onClick={() => handleStateChange('aiPersona', persona.value)}
                  className={getPersonaStyles(persona.color, isSelected)}
                  aria-pressed={isSelected}
                >
                  {persona.icon}
                  <h3 className="font-semibold text-slate-100">{persona.label}</h3>
                  <p className="text-xs text-slate-400 mt-2">{persona.description}</p>
                </button>
              );
            })}
          </div>
        </div>
        
        <RadioGroup
            legend="Status Kemitraan"
            name="bpjsStatus"
            selectedValue={formState.bpjsStatus}
            onChange={(e) => handleStateChange('bpjsStatus', e.target.value as BpjsStatus)}
            options={[
                { value: 'bpjs', label: 'Mitra BPJS' },
                { value: 'non-bpjs', label: 'Non-BPJS' },
            ]}
        />
        
        <div>
            <RadioGroup
                legend="Tipe Rumah Sakit"
                name="hospitalType"
                selectedValue={formState.hospitalType}
                onChange={handleHospitalTypeChange}
                options={[
                    { value: 'umum', label: 'Umum' },
                    { value: 'khusus', label: 'Khusus' },
                ]}
            />
            {formState.hospitalType === 'khusus' && (
                <div className="mt-4">
                    <label htmlFor="hospitalSpecialty" className="block text-sm font-medium text-slate-300 mb-1.5">
                        Spesialisasi
                    </label>
                    <select
                        id="hospitalSpecialty"
                        name="hospitalSpecialty"
                        value={formState.hospitalSpecialty}
                        onChange={handleSelectChange}
                        className="w-full px-3 py-2 border border-slate-700 rounded-md shadow-sm bg-slate-800/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        required
                    >
                        {SPECIALTY_HOSPITALS.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                    </select>
                </div>
            )}
        </div>

        <RadioGroup
            legend="Cakupan Analisis"
            name="analysisScope"
            selectedValue={formState.analysisScope}
            onChange={(e) => handleStateChange('analysisScope', e.target.value as AnalysisScope)}
            options={[
                { value: 'unit', label: 'Per Unit' },
                { value: 'global', label: 'Global (Seluruh RS)' },
            ]}
        />

        {formState.analysisScope === 'unit' && (
            <div>
                <label htmlFor="unitName" className="block text-sm font-medium text-slate-300 mb-1.5">
                    Nama Unit / Departemen
                </label>
                <select
                    id="unitName"
                    name="unitName"
                    value={formState.unitName}
                    onChange={handleSelectChange}
                    className="w-full px-3 py-2 border border-slate-700 rounded-md shadow-sm bg-slate-800/50 text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    required
                >
                    {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
            </div>
        )}
        
        <NumberInputField id="netRevenue" label="Pendapatan Bersih" value={formState.netRevenue} onChange={handleNumericChange} onToggleSign={() => handleToggleSign('netRevenue')} placeholder="Masukkan pendapatan bersih" />
        <NumberInputField id="startAssets" label="Total Aset (Awal Periode)" value={formState.startAssets} onChange={handleNumericChange} onToggleSign={() => handleToggleSign('startAssets')} placeholder="Masukkan total aset awal" />
        <NumberInputField id="endAssets" label="Total Aset (Akhir Periode)" value={formState.endAssets} onChange={handleNumericChange} onToggleSign={() => handleToggleSign('endAssets')} placeholder="Masukkan total aset akhir" />
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-500 disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menganalisis...
            </>
          ) : (
            'Analisis Optimasi Aset'
          )}
        </button>
      </form>
    </div>
  );
};