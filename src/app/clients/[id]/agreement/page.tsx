'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

export default function AgreementPage() {
  const { id } = useParams();
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/api/clients/${id}`).then(res => setClient(res.data));
    }
  }, [id]);

  if (!client) return <div className="p-10 text-white">Loading Agreement...</div>;

  const handlePrint = async () => {
    const elements = document.querySelectorAll('.pdf-page');
    if (elements.length === 0) return;
    
    const actionBar = document.getElementById('action-bar');
    if (actionBar) actionBar.style.display = 'none';

    try {
      const { jsPDF } = await import('jspdf');
      const htmlToImage = await import('html-to-image');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const dataUrl = await htmlToImage.toJpeg(el, { quality: 0.98, backgroundColor: '#ffffff' });
        
        if (i > 0) pdf.addPage();
        pdf.addImage(dataUrl, 'JPEG', 0, 0, 210, 297);
      }
      const fileName = client?.name ? `${client.name.replace(/\s+/g, '_')}_Agreement.pdf` : 'Agreement.pdf';
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      if (actionBar) actionBar.style.display = 'flex';
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen text-black flex flex-col items-center py-8 print:py-0 print:bg-white gap-8">
      
      {/* Action Bar - Hidden during print */}
      <div id="action-bar" className="fixed top-4 right-4 print:hidden flex gap-3 z-50">
        <button 
          onClick={handlePrint}
          className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-yellow-600 flex items-center gap-2"
        >
          Download PDF
        </button>
        <button 
          onClick={() => window.close()}
          className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold shadow-lg"
        >
          Close
        </button>
      </div>

      <div id="pdf-content" className="flex flex-col items-center gap-8 w-full">
        {/* PAGE 1 */}
        <div className="pdf-page bg-white w-[210mm] min-h-[297mm] shadow-2xl relative overflow-hidden print:shadow-none">
        
        {/* Modern Header Banner */}
        <div className="bg-[#1f2937] text-white p-12 relative">
          <div className="absolute top-0 right-0 w-64 h-full bg-yellow-500 transform skew-x-12 translate-x-16 opacity-90"></div>
          <div className="absolute top-0 right-32 w-32 h-full bg-yellow-600 transform skew-x-12 translate-x-16 opacity-50"></div>
          
          <div className="relative z-10">
            <img src="/tecveq_logo.png" alt="Tecveq Logo" className="h-12 object-contain mb-8 bg-white p-2 rounded" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            <h1 className="text-5xl font-black mb-2 tracking-tight">Software License<br/>Agreement</h1>
            <p className="text-yellow-500 font-bold tracking-widest uppercase text-sm mt-4">Agreement Ref: TecveqAgmt{String(client.id).padStart(5, '0')}</p>
          </div>
        </div>

        <div className="p-12 pt-8">
          <p className="text-gray-600 text-sm mb-8 leading-relaxed">
            This Software License & Support Agreement (the "Agreement") is made and entered into as of <strong>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>, by and between:
          </p>

          {/* Company Details */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-yellow-600 mb-3 border-b-2 border-yellow-500 inline-block pb-1">Company</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Name</td>
                  <td className="p-3">Tecveq</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Website</td>
                  <td className="p-3">www.tecveq.com</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Role</td>
                  <td className="p-3">Software Provider</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center mb-8">
            <div className="h-px bg-gray-300 w-1/3"></div>
            <span className="px-4 font-bold text-gray-500">AND</span>
            <div className="h-px bg-gray-300 w-1/3"></div>
          </div>

          {/* Client Details */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-yellow-600 mb-3 border-b-2 border-yellow-500 inline-block pb-1">Client</h3>
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Business Name</td>
                  <td className="p-3 font-bold">{client.name}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Authorized Domain</td>
                  <td className="p-3">{client.domain}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">Email</td>
                  <td className="p-3">{client.email || 'N/A'}</td>
                </tr>
                <tr className="border-b border-gray-300">
                  <td className="p-3 bg-gray-50 font-bold w-1/3 border-r border-gray-300">License Key</td>
                  <td className="p-3 font-mono text-xs">{client.license_key}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
        </div>
      </div>

      {/* PAGE BREAK FOR PRINTING */}
      <div className="html2pdf__page-break"></div>

      {/* PAGE 2 */}
      <div className="pdf-page bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[20mm] relative print:shadow-none">
        
        {/* Purchase Details */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wider border-b pb-2">Purchase Summary</h3>
          <table className="w-full text-left border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-sm">
                <th className="p-3 font-bold border-r border-gray-200">Package Name</th>
                <th className="p-3 font-bold text-center border-r border-gray-200">Expiration Date</th>
                <th className="p-3 font-bold text-right">Agreed Price</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3 font-medium border-r border-gray-200">{client.plan?.name || 'Custom Plan'}</td>
                <td className="p-3 text-center border-r border-gray-200">{client.plan_expires_at ? new Date(client.plan_expires_at).toLocaleDateString() : 'Lifetime'}</td>
                <td className="p-3 text-right font-bold text-lg">PKR {Number(client.sale_price).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Features Included */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wider border-b pb-2">Features Included</h3>
          <div className="grid grid-cols-2 gap-y-3 text-sm bg-gray-50 p-6 rounded-lg border border-gray-200">
            {(() => {
              let featuresList: string[] = [];
              try {
                if (typeof client.plan?.features === 'string') {
                  featuresList = JSON.parse(client.plan.features);
                } else if (Array.isArray(client.plan?.features)) {
                  featuresList = client.plan.features;
                }
              } catch (e) {}
              
              if (featuresList.length === 0) {
                return <p className="text-gray-500">Standard base features included.</p>;
              }

              return featuresList.map((feat: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 font-medium text-gray-700">
                  <span className="text-green-500 bg-green-100 rounded-full w-5 h-5 flex items-center justify-center text-xs">✔</span> {feat}
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-gray-800 mb-4 uppercase tracking-wider border-b pb-2">Terms & Conditions</h3>
          <ul className="list-disc pl-5 space-y-3 text-sm text-gray-600 text-justify">
            <li><strong>License Usage:</strong> The software is licensed exclusively for use on the specified Authorized Domain. Attempting to copy, transfer, resell, or run the software on unauthorized domains is strictly prohibited and constitutes software piracy.</li>
            <li><strong>Telemetry & Monitoring:</strong> The software includes built-in telemetry to verify license authenticity. Unauthorized modifications to bypass these checks will result in immediate permanent suspension.</li>
            <li><strong>Payments:</strong> All recurring payments must be cleared before the Expiration Date. Failure to process payments may result in automated service suspension or data wiping at the discretion of Tecveq.</li>
            <li><strong>Data Protection:</strong> Tecveq is not liable for data loss resulting from server crashes, unauthorized wipes due to piracy, or missed payments. Regular data backups are the sole responsibility of the Client.</li>
            <li><strong>Support:</strong> Technical support is provided as per the selected package limits. Custom feature requests outside of the core package will be billed separately.</li>
          </ul>
        </div>

        {/* Signatures */}
        <div className="absolute bottom-[30mm] left-[20mm] right-[20mm]">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="border-b-2 border-gray-800 h-20 mb-2 relative">
                <span className="absolute bottom-1 left-0 right-0 text-gray-300 italic text-xs">Sign Here</span>
              </div>
              <p className="font-bold text-sm text-gray-800">Client Authorized Signature</p>
              <p className="text-xs text-gray-500">{client.name}</p>
            </div>
            <div className="text-center">
              <div className="border-b-2 border-gray-800 h-20 mb-2 relative"></div>
              <p className="font-bold text-sm text-gray-800">Manager Signature</p>
              <p className="text-xs text-gray-500">Tecveq Operations</p>
            </div>
            <div className="text-center">
              <div className="border-b-2 border-gray-800 h-20 mb-2 relative"></div>
              <p className="font-bold text-sm text-gray-800">CEO Signature</p>
              <p className="text-xs text-gray-500">Tecveq</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-[10mm] left-[20mm] right-[20mm] text-center border-t pt-4 bg-white">
          <p className="text-xs text-gray-500 font-bold mb-1">Tecveq</p>
          <p className="text-xs text-gray-400">2 Idmiston Road, London, England, E15 1RG | WhatsApp: +44 7721 716507</p>
          <p className="text-xs text-yellow-600 font-bold mt-1">www.tecveq.com</p>
        </div>

      </div>
      </div>
    </div>
  );
}
