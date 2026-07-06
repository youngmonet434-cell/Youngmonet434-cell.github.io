import { Wallet, Shield, Trophy, Sparkles, HelpCircle } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../translations';

interface WalletViewProps {
  currentLang: Language;
}

export default function WalletView({ currentLang }: WalletViewProps) {
  const t = translations[currentLang];

  return (
    <div className="max-w-md w-full mx-auto space-y-6" id="wallet-root">
      {/* Premium Luxury Wallet Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-neutral-950 to-zinc-900 border border-gold-300/20 rounded-2xl p-6 shadow-2xl gold-glow" id="premium-wallet-card">
        {/* Abstract Gold Background Mesh */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gold-400/5 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl -ml-10 -mb-10" />

        <div className="flex justify-between items-start" id="wallet-card-header">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-gold-300/60 uppercase">ymonet metal card</span>
            <h3 className="text-xl font-display font-semibold text-white tracking-wide mt-1">
              {t.walletTitle}
            </h3>
          </div>
          <Wallet className="w-6 h-6 text-gold-300 animate-pulse" />
        </div>

        {/* Card Chip Simulation */}
        <div className="w-10 h-7 bg-gradient-to-r from-gold-300/40 to-gold-400/20 rounded-md border border-gold-300/30 mt-6" id="card-chip-sim" />

        {/* Simulated Balance */}
        <div className="mt-8" id="wallet-balance-display">
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest block">Token Balance (V1 Sandbox)</span>
          <div className="flex items-baseline gap-2 mt-1" id="wallet-balance-row">
            <span className="text-3xl font-display font-bold text-white tracking-tight">0.00</span>
            <span className="text-gold-300 font-mono text-sm font-semibold tracking-wider">YMON</span>
          </div>
        </div>

        {/* Card Footer details */}
        <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-8" id="wallet-card-footer">
          <div id="card-owner-name">
            <span className="text-[9px] font-mono text-gray-600 uppercase block">Account Holder</span>
            <span className="text-xs font-mono text-gray-300 tracking-wider">SANDBOX TESTER</span>
          </div>
          <div className="text-right" id="card-status-flag">
            <span className="text-[9px] font-mono text-gray-600 uppercase block">Security Status</span>
            <span className="text-xs font-mono text-emerald-400 font-medium tracking-wide flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>ACTIVE</span>
            </span>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-dark-card border border-gold-300/5 rounded-xl p-5 text-center space-y-4" id="wallet-coming-soon-banner">
        <div className="w-10 h-10 bg-gold-500/10 rounded-full flex items-center justify-center mx-auto text-gold-300" id="coming-soon-icon">
          <Sparkles className="w-5 h-5" />
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider">{t.comingSoon}</h4>
          <p className="text-xs text-gray-400 leading-relaxed mt-2">
            {t.walletDesc}
          </p>
        </div>

        <div className="bg-dark-bg p-3.5 rounded-lg border border-white/5 text-left space-y-2 text-xs text-gray-500" id="wallet-rules-box">
          <div className="flex gap-2 items-start" id="rule-zero-fees">
            <Trophy className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
            <span><strong className="text-gray-300">Zero Fees Platform:</strong> V1 focuses purely on high-fidelity, clean media performance, with no premium locks or hidden subscriptions.</span>
          </div>
          <div className="flex gap-2 items-start" id="rule-anti-ad">
            <HelpCircle className="w-3.5 h-3.5 text-gold-400 shrink-0 mt-0.5" />
            <span><strong className="text-gray-300">No Ads:</strong> Enjoy direct, live client connection feeds without video breaks or commercial frames.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
