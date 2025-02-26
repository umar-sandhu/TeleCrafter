import  { useState } from 'react';
import { Download, Phone } from 'lucide-react';

type GenerationMode = 'random' | 'fixMiddle' | 'fixEnd';

interface PhoneNumber {
  number: string;
  id: string;
}

function App() {
  const [prefix, setPrefix] = useState('0301');
  const [middleDigits, setMiddleDigits] = useState('');
  const [endDigits, setEndDigits] = useState('');
  const [mode, setMode] = useState<GenerationMode>('random');
  const [limit, setLimit] = useState(1000);
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const prefixOptions = Array.from({ length: 49 }, (_, i) => 
    `03${String(i + 1).padStart(2, '0')}`
  );

  const generateRandomDigits = (length: number, fixedPattern?: string) => {
    if (!fixedPattern) {
      return Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');
    }

    // Handle partial fixed digits
    return Array.from({ length }, (_, index) => {
      if (index < fixedPattern.length && fixedPattern[index] !== '_') {
        return fixedPattern[index];
      }
      return Math.floor(Math.random() * 10).toString();
    }).join('');
  };

  const generateNumbers = () => {
    setIsGenerating(true);
    const generatedNumbers = new Set<string>();
    const results: PhoneNumber[] = [];

    while (generatedNumbers.size < limit) {
      let number = prefix;

      switch (mode) {
        case 'fixMiddle': {
          const middlePattern = middleDigits.padEnd(5, '_');
          const randomMiddle = generateRandomDigits(5, middlePattern);
          number += randomMiddle + generateRandomDigits(2);
          break;
        }
        case 'fixEnd': {
          const endPattern = endDigits.padEnd(5, '_');
          const randomMiddle = generateRandomDigits(2);
          const randomEnd = generateRandomDigits(5, endPattern);
          number += randomMiddle + randomEnd;
          break;
        }
        case 'random':
          number += generateRandomDigits(7);
          break;
      }

      if (!generatedNumbers.has(number)) {
        generatedNumbers.add(number);
        results.push({
          number: number.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3'),
          id: crypto.randomUUID()
        });
      }
    }

    setNumbers(results);
    setIsGenerating(false);
  };

  const downloadNumbers = (format: 'txt' | 'csv') => {
    const content = format === 'csv'
      ? 'Phone Number\n' + numbers.map(n => n.number).join('\n')
      : numbers.map(n => n.number).join('\n');
    
    const blob = new Blob([content], { type: 'text/' + format });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phone-numbers.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getDigitPlaceholder = (mode: 'middle' | 'end') => {
    const value = mode === 'middle' ? middleDigits : endDigits;
    const remaining = 3 - value.length;
    if (remaining === 0) return '';
    return ` (${remaining} digit${remaining > 1 ? 's' : ''} will be random)`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Phone className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-800">Phone Number Generator</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prefix (First 4 digits)
              </label>
              <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
              >
                {prefixOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Generation Mode
              </label>
              <select
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={mode}
                onChange={(e) => setMode(e.target.value as GenerationMode)}
              >
                <option value="random">Completely Random (after prefix)</option>
                <option value="fixMiddle">Fix Middle Digits</option>
                <option value="fixEnd">Fix Last Digits</option>
              </select>
            </div>

            {mode === 'fixMiddle' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Digits (0-5 digits){getDigitPlaceholder('middle')}
                </label>
                <input
                  type="text"
                  pattern="\d*"
                  maxLength={5}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={middleDigits}
                  onChange={(e) => setMiddleDigits(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter up to 5 digits"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Format: XXXXX (any unfilled positions will be random)
                </p>
              </div>
            )}

            {mode === 'fixEnd' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Digits (0-5 digits){getDigitPlaceholder('end')}
                </label>
                <input
                  type="text"
                  pattern="\d*"
                  maxLength={5}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={endDigits}
                  onChange={(e) => setEndDigits(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter up to 5 digits"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Format: XXXXX (any unfilled positions will be random)
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of combinations (max 1,000,000)
              </label>
              <input
                type="number"
                min="1"
                max="1000000"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={limit}
                onChange={(e) => setLimit(Math.min(1000000, Math.max(1, parseInt(e.target.value) || 0)))}
              />
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={generateNumbers}
              disabled={isGenerating}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate Numbers'}
            </button>
          </div>

          {numbers.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-700">
                  Generated Numbers ({numbers.length})
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadNumbers('txt')}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <Download className="w-4 h-4" />
                    TXT
                  </button>
                  <button
                    onClick={() => downloadNumbers('csv')}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone Number
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {numbers.map((num) => (
                        <tr key={num.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {num.number}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;