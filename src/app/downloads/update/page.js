'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Download, 
  CheckCircle2, 
  Key, 
  Laptop, 
  ChevronRight, 
  Info, 
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DownloadsPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadClick = () => {
    setDownloading(true);
    // Simulate recovery back to idle after a few seconds
    setTimeout(() => {
      setDownloading(false);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans antialiased relative overflow-hidden">
      
      {/* Background Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]" />

      {/* Main Container */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-16 flex flex-col justify-center">
        
        {/* Header Branding */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-bold uppercase tracking-wider shadow-sm animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
            Official Release
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
            WhatsApp Blaster Pro
          </h1>
          <p className="text-slate-400 max-w-lg mx-auto text-base">
            Professional multi-account WhatsApp marketing & customer engagement desktop client.
          </p>
        </div>

        {/* Central Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-stretch">
          
          {/* Main Download Card */}
          <Card className="bg-slate-950 border-slate-800 text-slate-100 md:col-span-3 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
            
            <div className="space-y-6">
              <div>
                <CardTitle className="text-2xl font-black text-white flex items-center gap-2">
                  <Laptop className="w-6 h-6 text-emerald-400" />
                  Windows Client
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs mt-1">
                  Compatible with Windows 10 & 11 (64-bit)
                </CardDescription>
              </div>

              {/* Version Info Table */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Latest Version</span>
                  <span className="font-mono font-bold text-emerald-400">v0.0.1</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/60 pt-2.5">
                  <span className="text-slate-400 font-medium">Release Date</span>
                  <span className="text-slate-300 font-semibold">June 2026</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/60 pt-2.5">
                  <span className="text-slate-400 font-medium">Features</span>
                  <span className="text-slate-300 font-semibold">In-app Auto Updates</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <a 
                href="https://github.com/Htechcode2002/whatsapp_lisence_checker/releases/download/v0.0.1/WhatsApp.Blaster.Pro.Setup.0.0.1.exe" 
                download
                onClick={handleDownloadClick}
                className="block w-full"
              >
                <Button 
                  size="lg" 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-slate-950 font-bold transition-all shadow-lg shadow-emerald-500/20 py-6 rounded-2xl text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-5 h-5" />
                  {downloading ? 'Downloading Setup...' : 'Download Installer (.exe)'}
                </Button>
              </a>

              <div className="flex items-start gap-2 bg-slate-900/30 border border-slate-800/40 rounded-xl p-3 text-xs text-slate-400">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  Requires an active subscription or license key. The desktop app will prompt you for validation upon launching.
                </p>
              </div>
            </div>
          </Card>

          {/* Side Features / Verification List */}
          <div className="md:col-span-2 flex flex-col justify-between gap-6">
            
            {/* Features Highlight */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 space-y-6">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider text-slate-400">
                Core Features
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-200">Multi-Account Blasting</h4>
                    <p className="text-xs text-slate-400">Sequential sender rotation to bypass filters.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                    <Smartphone className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-200">Physical Phone (ADB)</h4>
                    <p className="text-xs text-slate-400">Send directly from actual Android devices.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/20">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-200">Live Customer Chat</h4>
                    <p className="text-xs text-slate-400">Interact with customers in real-time.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Quick License Checker Link */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between gap-4">
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  License Center
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Need to check key validation or manage hardware bindings?
                </p>
              </div>
              <Link href="/">
                <Button variant="outline" size="sm" className="w-full bg-slate-900 border-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-850 hover:text-white rounded-xl py-5 flex items-center justify-center gap-1 cursor-pointer">
                  Go to License Console
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

          </div>

        </div>

        {/* Installation Steps / Guide Section */}
        <div className="mt-16 bg-slate-950/40 border border-slate-800/60 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🚀 How to Get Started
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-emerald-400 font-black text-2xl font-mono">01.</div>
              <h4 className="font-bold text-slate-200 text-sm">Download Installer</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Click the download button above to retrieve the `.exe` setup package on your Windows machine.
              </p>
            </div>
            
            <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
              <div className="text-emerald-400 font-black text-2xl font-mono">02.</div>
              <h4 className="font-bold text-slate-200 text-sm">Run Setup</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open the downloaded file and follow the onscreen setup instructions to install the application.
              </p>
            </div>

            <div className="space-y-2 border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
              <div className="text-emerald-400 font-black text-2xl font-mono">03.</div>
              <h4 className="font-bold text-slate-200 text-sm">Activate & Blasting</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your **License Key** on startup. The app will verify it and activate your device immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-xs text-slate-500 font-medium">
          © {new Date().getFullYear()} WhatsApp Blaster Pro. All rights reserved. Managed under HTechCode.
        </div>

      </div>

    </div>
  );
}
