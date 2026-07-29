'use client';

import { BookOpen, Key, ShieldCheck, HardDrive, Download } from 'lucide-react';

export default function AdminGuidePage() {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <BookOpen className="text-yellow-500 w-8 h-8" /> 
          Admin SOP Guide
        </h1>
        <p className="text-gray-400 mt-1">Standard Operating Procedures for managing clients and deploying TSMS software.</p>
      </div>

      <div className="space-y-6">
        
        {/* Step 1 */}
        <section className="bg-[#1e1e1e] border border-[#333333] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-500/10 p-3 rounded-lg">
              <Key className="text-yellow-500 w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Step 1: Register the Client</h2>
          </div>
          <ul className="list-disc pl-5 text-gray-300 space-y-2">
            <li>Go to the <strong>Clients</strong> tab and click <em>Add Client</em>.</li>
            <li>Enter their Business Name, Email, and the <strong>Domain Name</strong> (e.g., their-salon.com).</li>
            <li>Select the Plan they purchased and the Duration (e.g., 1 Month, 6 Months).</li>
            <li>Enter the agreed Sale Price (PKR) and click <em>Save</em>.</li>
            <li>The system will automatically generate a highly secure <strong>License Key</strong>. Copy this key.</li>
          </ul>
        </section>

        {/* Step 2 */}
        <section className="bg-[#1e1e1e] border border-[#333333] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-500/10 p-3 rounded-lg">
              <Download className="text-yellow-500 w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Step 2: Generate Legal Documents</h2>
          </div>
          <ul className="list-disc pl-5 text-gray-300 space-y-2">
            <li>In the Clients table, click the <strong>Docs</strong> button next to the new client.</li>
            <li>This opens the Welcome Agreement Card with the Tecveq logo, price, and terms.</li>
            <li>Click <strong>Download PDF</strong> to save it as a PDF for WhatsApp.</li>
            <li>Click the <strong>Guide</strong> button to download their customized Software User Guide.</li>
            <li>Send both PDFs to the client.</li>
          </ul>
        </section>

        {/* Step 3 */}
        <section className="bg-[#1e1e1e] border border-[#333333] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-500/10 p-3 rounded-lg">
              <ShieldCheck className="text-yellow-500 w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Step 3: Secure the Codebase</h2>
          </div>
          <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-4 text-sm text-blue-200">
            <strong>GOOD NEWS:</strong> Even if you DO NOT encrypt the code, your software is STILL safe! The built-in <em>Telemetry Tracker</em> will silently report any unauthorized domains to your <strong>Piracy Logs</strong>, and you can remotely <strong>WIPE</strong> their server with one click. However, encryption adds a second layer of security.
          </div>
          <ul className="list-disc pl-5 text-gray-300 space-y-2">
            <li>Copy your original <code className="bg-black px-1 py-0.5 rounded text-yellow-500">TSMS/Backend</code> and Frontend folders for this client.</li>
            <li>Open the <code className="bg-black px-1 py-0.5 rounded text-yellow-500">.env</code> file in the client's Backend folder and add their License Key: <br/> <code className="bg-black px-2 py-1 rounded block mt-2 text-green-400">LICENSE_KEY="TSMS-XXXXXX-XXXXXX"</code></li>
            <li><strong>(Optional)</strong> Zip the client's Backend folder and run it through <strong>IonCube Encoder</strong> with <em>Domain Lock</em> enabled.</li>
          </ul>
        </section>

        {/* Step 4 */}
        <section className="bg-[#1e1e1e] border border-[#333333] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-yellow-500/10 p-3 rounded-lg">
              <HardDrive className="text-yellow-500 w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">Step 4: Deploy & Manage</h2>
          </div>
          <ul className="list-disc pl-5 text-gray-300 space-y-2">
            <li><strong>Backend Deployment:</strong> Upload the Backend folder to their cPanel. Create a database, update the <code className="bg-black px-1 py-0.5 rounded text-yellow-500">.env</code> file with the DB credentials, and run <code className="bg-black px-1 py-0.5 rounded text-yellow-500">php artisan migrate</code>.</li>
            <li><strong>Frontend Deployment:</strong> Build the Frontend locally (<code className="bg-black px-1 py-0.5 rounded text-yellow-500">npm run build</code>) and upload the <code className="bg-black px-1 py-0.5 rounded text-yellow-500">.next</code> build folder to their hosting.</li>
            <li><strong>Package Features:</strong> The client's Frontend will automatically hide/show modules (like Inventory or Salary) based on the Plan you assigned them. These features are also automatically listed in their Welcome Card!</li>
            <li className="mt-4 pt-4 border-t border-[#333333]"><strong>Unpaid Bills:</strong> If a client stops paying their monthly bill, simply click the <strong>Suspend</strong> button in your Clients table. Their software will instantly be locked out.</li>
            <li><strong>Piracy:</strong> In cases of piracy or theft, use the Red <strong>WIPE</strong> button to remotely delete their installation entirely.</li>
            <li>Check the <strong>Piracy Logs</strong> tab daily to monitor illegal installations worldwide.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
