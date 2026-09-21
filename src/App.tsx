import React, { useState } from 'react';
import { SoftAurora } from './components/animations/SoftAurora';
import { CountUp } from './components/animations/CountUp';
import { ShinyText } from './components/animations/ShinyText';
import { AnimatedContent } from './components/animations/AnimatedContent';
import { DockNav, NavTab } from './components/animations/DockNav';
import { MissYouButton } from './components/features/MissYouButton';
import { LocationRadar } from './components/features/LocationRadar';
import { TodayLook } from './components/features/TodayLook';
import { DailyRating } from './components/features/DailyRating';
import { TrialHub } from './components/features/TrialHub';
import { ScratchCard } from './components/features/ScratchCard';
import { PairingModal } from './components/features/PairingModal';
import { CoupleProvider, useCouple } from './context/CoupleContext';
import { Settings, Heart } from 'lucide-react';

const MainApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('seal');
  const [showPushModal, setShowPushModal] = useState(false);
  const [pushToken, setPushToken] = useState('');
  const [tokenSaved, setTokenSaved] = useState(false);

  const { partnerOnline, myRole, setShowPairingModal } = useCouple();

  const anniversaryDays = 520;

  const handleNotify = async (msg: string) => {
    if (pushToken.trim()) {
      try {
        await fetch('https://www.pushplus.plus/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: pushToken.trim(),
            title: 'I Miss You · 魔法手札提醒',
            content: `${msg} · 时间: ${new Date().toLocaleTimeString()}`,
            template: 'html'
          })
        });
      } catch (err) {
        console.error('Push notification failed', err);
      }
    }
  };

  const handleSaveToken = () => {
    setTokenSaved(true);
    setTimeout(() => {
      setTokenSaved(false);
      setShowPushModal(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen relative pb-28 text-[#2C241E] flex flex-col items-center selection:bg-[#E8DCB8] selection:text-[#520B1C]">
      {/* Hogwarts Candlelight & Parchment Ambient */}
      <SoftAurora />

      {/* Top Header Bar - British Heritage Crest */}
      <header className="w-full max-w-md px-6 pt-7 pb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#8C1D35] border border-[#D4AF37]/50 text-[#F5E8BE] flex items-center justify-center shadow-md">
            <Heart className="w-4 h-4 fill-[#F5E8BE]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-[0.18em] font-cinzel text-[#2C241E]">
              I MISS YOU
            </h1>
            <p className="text-[10px] text-[#8C7658] font-serif tracking-wider">
              CHRONICLE OF TWO SOULS · 双人专属手札
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Synchronized Status & Identity Pill */}
          <button
            onClick={() => setShowPairingModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#FCF9F2]/90 border border-[#D9C89E]/70 shadow-2xs text-[10px] font-medium text-[#524336] hover:bg-[#FAF5EB] transition-all cursor-pointer"
            title="点击配置双人暗号与角色身份"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${partnerOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${partnerOnline ? 'bg-emerald-600' : 'bg-amber-600'}`} />
            </span>
            <span className="font-cinzel font-bold text-[#8C1D35]">{myRole}</span>
            <span className="text-[#8C7658] font-serif">{partnerOnline ? '已同频' : '暗号'}</span>
          </button>

          <button
            onClick={() => setShowPushModal(true)}
            className="p-2.5 rounded-2xl bg-[#FCF9F2]/90 hover:bg-[#FAF5EB] text-[#8C7658] hover:text-[#2C241E] shadow-2xs border border-[#D9C89E]/60 transition-all cursor-pointer"
            title="设置"
          >
            <Settings className="w-4 h-4 text-[#C5A059]" />
          </button>
        </div>
      </header>

      {/* Covenant Milestone Banner */}
      <div className="w-full max-w-md px-4 mb-1">
        <div className="parchment-panel rounded-2xl py-2.5 px-4 flex items-center justify-between border border-[#D4AF37]/35 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚜️</span>
            <span className="text-xs font-serif text-[#524336]">
              岁月相依之契
            </span>
          </div>
          <div className="flex items-baseline gap-1.5 font-cinzel">
            <span className="text-[11px] text-[#8C7658]">DAY</span>
            <CountUp
              to={anniversaryDays}
              duration={1.8}
              className="text-xl font-bold font-mono tracking-tight text-[#8C1D35]"
            />
            <span className="text-xs font-bold text-[#C5A059]">
              <ShinyText text="ALONG" speed={3} />
            </span>
          </div>
        </div>
      </div>

      {/* Main Content with AnimatedContent wrapper */}
      <main className="w-full max-w-md flex-1">
        <AnimatedContent keyId={activeTab} distance={12} duration={0.32}>
          {/* Tab 1: Dedicated Parchment Sealed Letter */}
          {activeTab === 'seal' && (
            <div>
              <MissYouButton onNotify={handleNotify} />
            </div>
          )}

          {/* Tab 2: Dedicated Midnight Celestial Astrolabe & Compass */}
          {activeTab === 'compass' && (
            <div>
              <LocationRadar />
            </div>
          )}

          {/* Tab 3: Magic Portraits & Invisible Ink */}
          {activeTab === 'today' && (
            <div className="space-y-1">
              <TodayLook />
              <ScratchCard />
            </div>
          )}

          {/* Tab 4: Chronicle Rating Scroll */}
          {activeTab === 'rating' && (
            <div>
              <DailyRating />
            </div>
          )}

          {/* Tab 5: Quill Sketch & Soul Trial */}
          {activeTab === 'fun' && (
            <div>
              <TrialHub />
            </div>
          )}
        </AnimatedContent>
      </main>

      {/* Oxford Midnight & Brass Dock Navigation */}
      <DockNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Secret Pairing Modal */}
      <PairingModal />

      {/* Settings Modal */}
      {showPushModal && (
        <div className="fixed inset-0 z-50 bg-[#111A27]/60 backdrop-blur-xs flex items-center justify-center p-4 font-serif">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-[#FCF9F2] shadow-2xl border border-[#D4AF37]/50">
            <h3 className="text-sm font-bold font-cinzel tracking-wider text-[#2C241E] mb-1">
              HERALD CONFIG · 微信通知配置
            </h3>
            <p className="text-xs text-[#7A6750] mb-4 leading-relaxed">
              填写 PushPlus Token，以火漆印章封缄想念时将同步向对方微信投递猫头鹰般的信笺提醒。
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#524336] mb-1 font-cinzel">
                  PushPlus Token
                </label>
                <input
                  type="text"
                  value={pushToken}
                  onChange={(e) => setPushToken(e.target.value)}
                  placeholder="填写Token"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-[#D9C89E] focus:outline-none focus:ring-1 focus:ring-[#C5A059] font-mono bg-[#FAF6EE] text-[#2C241E]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowPushModal(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-serif bg-[#EADBC4]/50 text-[#665440] hover:bg-[#EADBC4] transition-colors border border-[#D9C89E]/60 cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveToken}
                  className="flex-1 py-2 rounded-xl text-xs font-cinzel tracking-wider font-semibold bg-[#8C1D35] text-[#F5EBD9] hover:bg-[#6B1226] shadow-sm transition-colors border border-[#D4AF37]/40 cursor-pointer"
                >
                  {tokenSaved ? 'SAVED' : 'SEAL & SAVE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CoupleProvider>
      <MainApp />
    </CoupleProvider>
  );
};

export default App;
