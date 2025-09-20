import type { DataInput } from '../types';

/**
 * Generate URL with query parameters from form data
 */
export const generateUrlWithParams = (baseUrl: string, data: Partial<DataInput>): string => {
  const url = new URL(baseUrl, window.location.origin);
  
  // Add financial data parameters
  if (data.netRevenue !== undefined) {
    url.searchParams.set('netRevenue', data.netRevenue.toString());
  }
  
  if (data.startAssets !== undefined) {
    url.searchParams.set('startAssets', data.startAssets.toString());
  }
  
  if (data.endAssets !== undefined) {
    url.searchParams.set('endAssets', data.endAssets.toString());
  }
  
  // Add other optional parameters
  if (data.analysisScope) {
    url.searchParams.set('analysisScope', data.analysisScope);
  }
  
  if (data.bpjsStatus) {
    url.searchParams.set('bpjsStatus', data.bpjsStatus);
  }
  
  if (data.hospitalType) {
    url.searchParams.set('hospitalType', data.hospitalType);
  }
  
  if (data.unitName) {
    url.searchParams.set('unitName', data.unitName);
  }
  
  if (data.hospitalSpecialty) {
    url.searchParams.set('hospitalSpecialty', data.hospitalSpecialty);
  }
  
  if (data.aiPersona) {
    url.searchParams.set('aiPersona', data.aiPersona);
  }
  
  return url.toString();
};

/**
 * Parse numeric value from string with Indonesian number formatting
 */
export const parseFormattedNumber = (value: string): number => {
  return parseInt(value.replace(/[^\d]/g, ''), 10) || 0;
};

/**
 * Format number with Indonesian thousand separators
 */
export const formatNumberWithDots = (value: string): string => {
  let sign = value.startsWith('-') ? '-' : '';
  const numericValue = value.replace(/[^0-9]/g, '');
  if (numericValue === '') return ''; 
  return sign + parseInt(numericValue, 10).toLocaleString('id-ID');
};

/**
 * Example usage for generating URLs:
 * 
 * // Basic usage with financial data
 * const url1 = generateUrlWithParams(window.location.pathname, {
 *   netRevenue: 50000000000,
 *   startAssets: 80000000000,
 *   endAssets: 85000000000
 * });
 * // Result: /?netRevenue=50000000000&startAssets=80000000000&endAssets=85000000000
 * 
 * // Full usage with all parameters
 * const url2 = generateUrlWithParams(window.location.pathname, {
 *   netRevenue: 50000000000,
 *   startAssets: 80000000000,
 *   endAssets: 85000000000,
 *   analysisScope: 'unit',
 *   bpjsStatus: 'bpjs',
 *   hospitalType: 'umum',
 *   unitName: 'Instalasi Gawat Darurat (IGD)',
 *   aiPersona: 'strategic'
 * });
 */
