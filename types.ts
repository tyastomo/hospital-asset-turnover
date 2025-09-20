export type BpjsStatus = 'bpjs' | 'non-bpjs';
export type HospitalType = 'umum' | 'khusus';
export type AnalysisScope = 'unit' | 'global';
export type AIPersona = 'strategic' | 'operational' | 'financial';

export interface DataInput {
  analysisScope: AnalysisScope;
  unitName?: string;
  netRevenue: number;
  startAssets: number;
  endAssets: number;
  bpjsStatus: BpjsStatus;
  hospitalType: HospitalType;
  hospitalSpecialty?: string;
  aiPersona: AIPersona;
}

export interface FinancialData {
  unitName: string;
  netRevenue: number;
  startAssets: number;
  endAssets: number;
  bpjsStatus: BpjsStatus;
  hospitalType: HospitalType;
  hospitalSpecialty?: string;
  aiPersona: AIPersona;
}

export interface ActionableSuggestion {
  action: string;
  rationale: string;
  kpi: string;
  implementation_steps: string;
  potential_risk: string;
}

export interface Recommendation {
  category: string;
  suggestions: ActionableSuggestion[];
}

export interface AnalysisBreakdown {
  financialHealth: string;
  operationalEfficiency: string;
  strategicPosition: string;
}

export interface AIResponse {
  analysis: AnalysisBreakdown;
  recommendations: Recommendation[];
}

export interface AnalysisResult extends AIResponse {
  atr: number;
}

export interface HistoricalData {
  name: string;
  atr: number;
}

// Custom Error Types for better error handling
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class GeminiApiError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'GeminiApiError';
  }
}
