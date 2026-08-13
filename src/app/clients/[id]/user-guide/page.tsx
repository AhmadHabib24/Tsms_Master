'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

export default function UserGuidePage() {
  const { id } = useParams();
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/api/clients/${id}`).then(res => setClient(res.data));
    }
  }, [id]);

  if (!client) return <div className="p-10 text-white">Loading Guide...</div>;

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
      const fileName = client?.name ? `${client.name.replace(/\s+/g, '_')}_UserGuide.pdf` : 'UserGuide.pdf';
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      if (actionBar) actionBar.style.display = 'flex';
    }
  };

  const hasFeature = (featStr: string) => {
    let featuresList: string[] = [];
    try {
      if (typeof client.plan?.features === 'string') {
        featuresList = JSON.parse(client.plan.features);
      } else if (Array.isArray(client.plan?.features)) {
        featuresList = client.plan.features;
      }
    } catch (e) {}

    if (!featuresList || featuresList.length === 0) return true; // If no features defined, assume all or standard
    return featuresList.some((f: string) => f.toLowerCase().includes(featStr.toLowerCase()));
  };

  return (
    <div className="bg-gray-200 min-h-screen text-black flex justify-center py-8 print:py-0 print:bg-white">
      
      {/* Action Bar */}
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

      <div id="pdf-content" className="flex justify-center w-full">
        {/* A4 Document Container */}
        <div className="pdf-page bg-white w-[210mm] min-h-[297mm] shadow-2xl p-[20mm] pb-[40mm] relative">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b-2 border-yellow-500 pb-4 mb-8">
          <div>
            <img src="/tecveq_logo.png" alt="Tecveq Logo" className="h-12 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-black text-gray-900 uppercase">Software User Guide</h1>
            <p className="text-sm text-gray-500 mt-1">Prepared for: {client.name}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 leading-relaxed text-justify">
            Welcome to your new business management software provided by <strong>Tecveq</strong>. 
            This document outlines the core modules you have purchased and provides basic instructions on how to use them effectively to grow your business.
          </p>
        </div>

        <div className="space-y-6">
          
          {/* Quick Billing (Always included usually) */}
          <section className="bg-gray-50 p-4 rounded-lg border border-gray-200 break-inside-avoid">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="bg-yellow-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
              Quick Billing & POS
            </h3>
            <p className="text-sm text-gray-600 mb-2">Process customer orders quickly through the Billing interface.</p>
            <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
              <li>Navigate to <strong>Billing</strong> from the sidebar.</li>
              <li>Select the Services or Products the customer is purchasing.</li>
              <li>Select the assigned Employee (for commission tracking).</li>
              <li>Choose Payment Method (Cash, Card, or Udhar).</li>
              <li>Click <strong>Generate Bill</strong> to print the receipt.</li>
            </ul>
          </section>

          {/* Udhar Management */}
          <section className="bg-gray-50 p-4 rounded-lg border border-gray-200 break-inside-avoid">
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              <span className="bg-yellow-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
              Customer Udhar (Credit)
            </h3>
            <p className="text-sm text-gray-600 mb-2">Track pending payments and partial installments.</p>
            <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
              <li>When billing, select <strong>Udhar</strong> as the payment method.</li>
              <li>Go to the <strong>Customers</strong> tab to view all pending Udhar balances.</li>
              <li>Click <strong>Pay Installment</strong> to record partial payments (e.g., Rs 500 paid out of Rs 2000).</li>
              <li>The system maintains a permanent ledger of all installments.</li>
            </ul>
          </section>

          {/* Employee & Salary */}
          {hasFeature('Employee') && (
            <section className="bg-gray-50 p-4 rounded-lg border border-gray-200 break-inside-avoid">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-yellow-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
                Employee & Salary Management
              </h3>
              <p className="text-sm text-gray-600 mb-2">Manage staff attendance, commissions, and monthly salaries.</p>
              <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
                <li>Go to <strong>Employees</strong> to register your staff. Set their Daily Commission.</li>
                <li>When staff perform services, their daily commission is automatically tracked.</li>
                <li>Go to the <strong>Salary Management</strong> tab and click <em>Generate Drafts</em> at the end of the month.</li>
                <li>The system will automatically calculate total days worked × daily commission!</li>
              </ul>
            </section>
          )}

          {/* Inventory */}
          {hasFeature('Inventory') && (
            <section className="bg-gray-50 p-4 rounded-lg border border-gray-200 break-inside-avoid">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-yellow-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
                Inventory Tracking
              </h3>
              <p className="text-sm text-gray-600 mb-2">Prevent stockouts and track product usage.</p>
              <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
                <li>Add products in the <strong>Inventory</strong> tab with Low Stock Alerts.</li>
                <li>When products are sold via Billing, stock is automatically reduced.</li>
                <li>You will receive notifications when stock falls below the threshold.</li>
              </ul>
            </section>
          )}

          {/* Finance & Reports */}
          {hasFeature('Report') && (
            <section className="bg-gray-50 p-4 rounded-lg border border-gray-200 break-inside-avoid">
              <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-yellow-500 text-black w-6 h-6 rounded-full flex items-center justify-center text-xs">5</span>
                Finance & Reports
              </h3>
              <p className="text-sm text-gray-600 mb-2">Monitor business health and profitability.</p>
              <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1">
                <li>Use the <strong>Finance</strong> tab to log daily expenses (Tea, Electricity, etc.).</li>
                <li>Check the <strong>Reports</strong> tab to view Profit & Loss statements.</li>
                <li>Reports automatically calculate Revenue minus Expenses and Salaries to show Net Profit.</li>
              </ul>
            </section>
          )}

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
