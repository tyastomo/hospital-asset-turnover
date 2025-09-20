## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Query Parameters Support

The application now supports pre-filling form data via URL query parameters. This is useful for:
- Direct links with specific hospital data
- Integration with external systems
- Bookmarking specific scenarios

### Supported Parameters

#### Financial Data (Main Parameters)
- `netRevenue` - Net revenue amount (numeric, without currency symbols)
- `startAssets` - Starting assets amount (numeric, without currency symbols)  
- `endAssets` - Ending assets amount (numeric, without currency symbols)

#### Optional Configuration Parameters
- `analysisScope` - Analysis scope: `unit` or `global`
- `bpjsStatus` - BPJS status: `bpjs` or `non-bpjs`
- `hospitalType` - Hospital type: `umum` or `khusus`
- `unitName` - Department/unit name (must match predefined list)
- `hospitalSpecialty` - Hospital specialty (for specialized hospitals)
- `aiPersona` - AI analysis persona: `strategic`, `operational`, or `financial`

### Example URLs

#### Basic Usage (Financial Data Only)
```
http://localhost:5173/?netRevenue=50000000000&startAssets=80000000000&endAssets=85000000000
```

#### Full Configuration
```
http://localhost:5173/?netRevenue=50000000000&startAssets=80000000000&endAssets=85000000000&analysisScope=unit&bpjsStatus=bpjs&hospitalType=umum&unitName=Instalasi%20Gawat%20Darurat%20(IGD)&aiPersona=strategic
```

#### ICU Analysis Example
```
http://localhost:5173/?netRevenue=25000000000&startAssets=45000000000&endAssets=48000000000&analysisScope=unit&unitName=Unit%20Perawatan%20Intensif%20(ICU)&aiPersona=operational
```

### Usage with External Systems

You can generate URLs programmatically using the utility function:

```javascript
import { generateUrlWithParams } from './utils/urlHelpers';

const url = generateUrlWithParams(window.location.pathname, {
  netRevenue: 50000000000,
  startAssets: 80000000000,
  endAssets: 85000000000,
  analysisScope: 'unit',
  unitName: 'Instalasi Gawat Darurat (IGD)',
  aiPersona: 'strategic'
});
```
