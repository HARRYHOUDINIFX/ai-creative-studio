import React from 'react';
import { Sparkles, Camera, Zap } from 'lucide-react';
import Editable from './Editable';

const Hero: React.FC = () => {
  return (
    <div className="relative bg-slate-900 py-12 sm:py-24 lg:py-32">
      {/* Background decoration - confined to this container but allowed to clip internally */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-500 rounded-full blur-3xl mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-500 rounded-full blur-3xl mix-blend-multiply"></div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center z-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 flex justify-center">
            <span className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-primary-100 ring-1 ring-white/20 hover:ring-white/30 transition-all cursor-default flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <Editable
                id="hero-badge"
                tagName="span"
                text="Visual Boost"
                className="text-[14px] text-[#e0e7ff] font-normal"
              />
            </span>
          </div>

          <div className="mb-6">
            <Editable
              id="hero-main-title"
              tagName="h1"
              className="text-[22px] sm:text-[40px] text-white font-bold text-center leading-[1.3] break-keep"
              html='모델, 스튜디오, 수십 명의 스태프...<div>촬영 견적의 거품은 기술로 걷어냈습니다.</div>'
            />
          </div>

          <div className="mt-6">
            <Editable
              id="hero-subtitle"
              tagName="p"
              className="text-lg leading-8 text-gray-300"
              text='"1/3 가격으로 대기업 퀄리티를 경험하세요."'
            />
          </div>

          <div className="mt-8 sm:mt-10 flex items-center justify-center">
            <div className="flex flex-row gap-3 sm:gap-4 text-sm text-gray-400 justify-center">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 ring-1 ring-white/10">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-primary-400" />
                </div>
                <Editable id="hero-feature-1" tagName="span" text="고퀄리티 연출컷" className="whitespace-nowrap" />
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="p-1.5 sm:p-2 rounded-lg bg-white/5 ring-1 ring-white/10">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                </div>
                <Editable id="hero-feature-2" tagName="span" text="빠른 제작 프로세스" className="whitespace-nowrap" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;