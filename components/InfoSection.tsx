import React from 'react';
import { Calculator, Clock, CreditCard, PenTool, RefreshCw, Copyright } from 'lucide-react';
import Editable from './Editable';
import PrivacyModal from './PrivacyModal';
import TermsModal from './TermsModal';
import { useState } from 'react';

const InfoSection: React.FC = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <footer className="bg-slate-900 text-slate-300 pt-10 pb-32 sm:pt-20 sm:pb-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 mb-16">
          {/* Process */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-400" />
              <Editable id="info-process-title" tagName="span" text="작업 프로세스" />
            </h3>
            <ul className="space-y-6">
              <li className="relative pl-0 pb-1">
                <Editable id="info-step1-title" tagName="h4" className="font-semibold text-white" text="상담 및 기획" />
                <Editable id="info-step1-desc" tagName="p" className="text-sm text-slate-400 mt-1" text="원하시는 레퍼런스(참고 이미지)를 공유해주시면 정확도가 올라갑니다." />
              </li>
              <li className="relative pl-0 pb-1">
                <Editable id="info-step2-title" tagName="h4" className="font-semibold text-white" text="결제 및 증빙" />
                <Editable id="info-step2-desc" tagName="p" className="text-sm text-slate-400 mt-1" html='VAT 포함 금액입니다. 간이과세자로 세금계산서 불가, <span class="text-primary-300 font-bold">[지출증빙용 현금영수증]</span>을 발행해 드립니다.' />
              </li>
              <li className="relative pl-0">
                <Editable id="info-step3-title" tagName="h4" className="font-semibold text-white" text="시안 전달" />
                <Editable id="info-step3-desc" tagName="p" className="text-sm text-slate-400 mt-1" text="영업일 기준 3~5일 이내 1차 시안을 전달드립니다." />
              </li>
            </ul>


            {/* Bank Info Moved Here */}
            <div className="mt-12 pt-8 border-t border-slate-800">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                <Editable id="info-bank-title" tagName="span" text="계좌 안내" />
              </h4>
              <div className="bg-slate-800/80 p-6 rounded-xl inline-block pr-12 ring-1 ring-white/5">
                <div className="flex flex-col gap-1 text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-12">예금주</span>
                    <Editable id="info-bank-owner" tagName="span" className="font-medium text-white" text="장순용" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 w-12">신한은행</span>
                    <Editable id="info-bank-account" tagName="span" className="font-mono text-lg text-blue-200 font-bold tracking-wide" text="110-207-816249" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Policies */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-slate-800/50 rounded-2xl p-6 ring-1 ring-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-orange-400" />
                <Editable id="info-revision-title" tagName="span" text="수정 및 AS 규정" />
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="text-orange-400">•</span>
                  <Editable id="info-revision-1" tagName="span" text="텍스트 수정 및 간단한 보정은 최대 3회까지 무료" />
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400">•</span>
                  <Editable id="info-revision-2" tagName="span" html="<strong>4회차 수정부터</strong>는 추가 요금(기존 요금의 70%) 부과" />
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400">•</span>
                  <Editable id="info-revision-3" tagName="span" text="'전면 재제작' 요청 시 기존 요금의 80% 비용 발생" />
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400">•</span>
                  <Editable id="info-revision-4" tagName="span" html="만족스러운 결과물을 위해 원하시는 컨셉이나 레퍼런스가 있다면 작업 시작 전에 꼭 공유해 주세요!<br/>사전에 방향을 전달받지 못한 경우 에디터의 기획으로 제작되며, 이로 인한 전체 컨셉 변경 요청은 수정 횟수가 차감되거나 추가 비용이 발생할 수 있습니다." />
                </li>
              </ul>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-6 ring-1 ring-white/5">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Copyright className="w-5 h-5 text-green-400" />
                <Editable id="info-copyright-title" tagName="span" text="저작권 안내" />
              </h3>
              <Editable
                id="info-copyright-desc"
                tagName="p"
                className="text-sm text-slate-300"
                html='제공된 결과물은 상업적으로 자유롭게 이용 가능합니다. <br/><span class="text-slate-500 text-xs">(단, 당사 포트폴리오로 활용될 수 있습니다)</span>'
              />
            </div>
          </div>
        </div>





        {/* Removed border-t border-slate-800 to delete the line */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Editable id="info-copyright" tagName="p" className="text-sm text-slate-500" text="© 2025 Visual Boost. All rights reserved." />
            <button
              onClick={() => setShowPrivacy(true)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline"
            >
              개인정보처리방침
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={() => setShowTerms(true)}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors underline"
            >
              이용약관
            </button>
          </div>
          <div className="flex gap-4">
            <span className="text-xs text-slate-600 border border-slate-700 px-2 py-1 rounded">
              <Editable id="info-badge-1" tagName="span" text="VAT 포함 가격" />
            </span>
            <span className="text-xs text-slate-600 border border-slate-700 px-2 py-1 rounded">
              <Editable id="info-badge-2" tagName="span" text="현금영수증 발행 가능" />
            </span>
          </div>
        </div>

      </div>


      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </footer >
  );
};

export default InfoSection;