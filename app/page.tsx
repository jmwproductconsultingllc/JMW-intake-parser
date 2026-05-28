'use client';
import { useState } from 'react';

export default function IntakeParser() {
  const [formData, setFormData] = useState({
    liquidCapital: '',
    netWorth: '',
    role: 'Owner-Operator',
    timeline: '< 3 months',
    fdd: 'No',
    businessType: 'Brick & Mortar',
    partners: 'No'
  });
  
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.error) {
        setAnalysis("Backend Error: " + data.error);
      } else {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      setAnalysis('Backend Error: Failed to connect to API.');
    }
    
    setLoading(false);
  };

  const parseResults = (text: any) => {
    if (!text || text.includes("Backend Error")) return { error: text };

    const snapshotMatch = text.match(/1\.\s*\*?.*Snapshot.*?\*?\s*:\s*([\s\S]*?)(?=2\.|$)/i);
    const riskMatch = text.match(/2\.\s*\*?.*Risk.*?\*?\s*:\s*([\s\S]*?)(?=3\.|$)/i);
    const sowMatch = text.match(/3\.\s*\*?.*SOW.*?\*?\s*:\s*([\s\S]*?)$/i);

    const riskText = riskMatch ? riskMatch[1].trim() : '';
    
    let flagTheme = 'green';
    const lowerRiskText = riskText.toLowerCase();
    
    if (lowerRiskText.includes('red flag')) {
      flagTheme = 'red';
    } else if (lowerRiskText.includes('yellow flag')) {
      flagTheme = 'yellow';
    }

    return {
      snapshot: snapshotMatch ? snapshotMatch[1].trim() : '',
      risk: riskText || "No specific risk flags triggered by current inputs.",
      sow: sowMatch ? sowMatch[1].trim() : text,
      theme: flagTheme,
      isSuccess: true
    };
  };

  const parsedData = parseResults(analysis);

  const styleMap = {
    green: {
      bg: 'from-green-800 to-green-950',
      border: 'border-green-700',
      shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]',
      title: 'text-green-100',
      text: 'text-green-50',
      icon: 'text-green-400'
    },
    yellow: {
      bg: 'from-yellow-700 to-yellow-900',
      border: 'border-yellow-600',
      shadow: 'shadow-[0_0_20px_rgba(234,179,8,0.3)]',
      title: 'text-yellow-100',
      text: 'text-yellow-50',
      icon: 'text-yellow-400'
    },
    red: {
      bg: 'from-red-800 to-red-950',
      border: 'border-red-700',
      shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
      title: 'text-red-100',
      text: 'text-red-50',
      icon: 'text-red-400'
    }
  };

  const activeTheme = (styleMap as any)[parsedData.theme || 'green'];

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed py-12 px-4 sm:px-6 lg:px-8 font-sans"
      style={{ 
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop')` 
      }}
    >
      <div className="max-w-5xl mx-auto">
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            JMW <span className="text-blue-400">Intake Parser</span>
          </h1>
          <p className="mt-3 text-lg text-gray-200">
            Automated Franchise Viability & Scoping Engine
          </p>
        </div>

        <div className="bg-white py-8 px-10 shadow-2xl rounded-2xl border border-gray-100 mb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Liquid Capital</label>
                <input type="text" onChange={e => setFormData({...formData, liquidCapital: e.target.value})} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" placeholder="$200,000" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Net Worth</label>
                <input type="text" onChange={e => setFormData({...formData, netWorth: e.target.value})} required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm" placeholder="$1,000,000" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Intended Role</label>
                <select onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm cursor-pointer">
                  <option>Owner-Operator</option>
                  <option>Semi-Absentee</option>
                  <option>Passive Investor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Timeline</label>
                <select onChange={e => setFormData({...formData, timeline: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm cursor-pointer">
                  <option>&lt; 3 months</option>
                  <option>3-6 months</option>
                  <option>6-12 months</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">FDD Received?</label>
                <select onChange={e => setFormData({...formData, fdd: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm cursor-pointer">
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Business Type</label>
                <select onChange={e => setFormData({...formData, businessType: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm cursor-pointer">
                  <option>Brick & Mortar</option>
                  <option>Mobile / Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Partners?</label>
                <select onChange={e => setFormData({...formData, partners: e.target.value})} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm cursor-pointer">
                  <option>No</option>
                  <option>Yes</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full mt-6 py-4 px-6 text-white text-lg font-bold rounded-xl transition-all shadow-md ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:transform active:scale-95'}`}>
              {loading ? 'Processing Data...' : 'Generate Executive Dashboard'}
            </button>
          </form>
        </div>

        {analysis && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transition-all animate-fade-in-up border border-gray-100">
            
            <div className="bg-gray-50 px-8 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Consulting Output</h2>
              {parsedData.isSuccess ? (
                <span className="flex items-center gap-2 text-sm font-bold text-green-700 bg-green-100 px-4 py-2 rounded-full">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Complete
                </span>
              ) : (
                <span className="text-sm font-bold text-red-700 bg-red-100 px-4 py-2 rounded-full">Error</span>
              )}
            </div>

            {parsedData.error ? (
              <div className="p-8 text-red-600 font-medium whitespace-pre-wrap">{parsedData.error}</div>
            ) : (
              <div className="p-8">
                
                <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                  {parsedData.snapshot}
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  
                  <div className={`lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br ${activeTheme.bg} p-8 ${activeTheme.shadow} border ${activeTheme.border} transition-colors duration-500`}>
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <h3 className={`${activeTheme.title} font-semibold text-lg uppercase tracking-wider`}>Risk Assessment Detail</h3>
                        <svg className={`w-12 h-12 ${activeTheme.icon} opacity-80`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                      </div>
                      <div className={`${activeTheme.text} prose prose-invert max-w-none whitespace-pre-wrap font-medium text-[16px] leading-relaxed`}>
                        {parsedData.risk}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-gray-900 font-bold text-xl mb-6">Prospect Snapshot</h3>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Liquid Capital</p>
                        <p className="text-md font-bold text-gray-900 flex items-center gap-2">💰 {formData.liquidCapital || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Net Worth</p>
                        <p className="text-md font-bold text-gray-900 flex items-center gap-2">💎 {formData.netWorth || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Role</p>
                        <p className="text-md font-bold text-gray-900 flex items-center gap-2">👤 {formData.role}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Timeline</p>
                        <p className="text-md font-bold text-gray-900 flex items-center gap-2">⏳ {formData.timeline}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Business Type</p>
                        <p className="text-md font-bold text-gray-900 flex items-center gap-2">🏢 {formData.businessType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Partnership</p>
                        <p className="text-md font-bold text-gray-900 flex items-center gap-2">🤝 {formData.partners}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Recommended SOW</h3>
                  <div className="bg-blue-50/50 rounded-2xl border border-blue-100 p-6 text-gray-800 prose max-w-none whitespace-pre-wrap leading-relaxed text-[15px]">
                    {parsedData.sow}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}