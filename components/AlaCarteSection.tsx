import React from 'react';
import SectionHeader from './SectionHeader';
import { AlaCarteCategory } from '../types';
import { Image, Video, FileText, Box, User, Film } from 'lucide-react';
import Editable from './Editable';

const categories: AlaCarteCategory[] = [
  {
    title: '이미지 / 그래픽',
    items: [
      { name: '제품/음식 고퀄리티 연출컷', price: 50000, note: '(1장)' },
      { name: '모델 연출컷 (가상 모델)', price: 50000, note: '(1장)' },
      { name: '패키지(박스) 목업 합성', price: 50000, note: '(1장)' },
    ]
  },
  {
    title: '영상 / 텍스트',
    items: [
      { name: '상세페이지용 GIF (움짤)', price: 60000, note: '(3~5초)' },
      { name: '숏폼(릴스/쇼츠) 영상', price: 200000, note: '(기획/편집 포함, 20~30초 내외)' },
      { name: '블로그 원고 작성', price: 50000, note: '(이미지 포함)' },
    ]
  }
];

const AlaCarteSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-24 bg-white" id="alacarte">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          id="section-alacarte"
          number="03"
          title="단품 메뉴 (A La Carte)"
          subtitle="필요한 항목만 골라서 진행하실 수 있습니다."
        />

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* Images Column */}
          <div className="rounded-3xl ring-1 ring-gray-200 bg-white p-6 sm:p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <Image className="w-6 h-6" />
              </div>
              <Editable id="alacarte-image-title" tagName="h3" className="text-xl font-bold text-gray-900" text="이미지 / 그래픽" />
            </div>
            <ul className="space-y-6">
              {categories[0].items.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3 w-full">
                    {idx === 0 && <Box className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    {idx === 1 && <User className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    {idx === 2 && <Image className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    <div className="flex-1">
                      <Editable id={`alacarte-img-item-${idx}-name`} tagName="p" className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors" text={item.name} />
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end min-w-[80px]">
                    <div className="flex items-baseline">
                      <Editable id={`alacarte-img-item-${idx}-price`} tagName="p" className="text-sm font-bold text-gray-900" text={new Intl.NumberFormat('ko-KR').format(item.price)} />
                      <span className="text-xs text-gray-900 ml-0.5">원</span>
                    </div>
                    {item.note && <Editable id={`alacarte-img-item-${idx}-note`} tagName="p" className="text-xs text-gray-500" text={item.note} />}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Video/Text Column */}
          <div className="rounded-3xl ring-1 ring-gray-200 bg-white p-6 sm:p-8 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
                <Video className="w-6 h-6" />
              </div>
              <Editable id="alacarte-video-title" tagName="h3" className="text-xl font-bold text-gray-900" text="영상 / 텍스트" />
            </div>
            <ul className="space-y-6">
              {categories[1].items.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center group">
                  <div className="flex items-center gap-3 w-full">
                    {idx === 0 && <Image className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    {idx === 1 && <Film className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    {idx === 2 && <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    <div className="flex-1">
                      <Editable id={`alacarte-vid-item-${idx}-name`} tagName="p" className="text-sm font-medium text-gray-900 group-hover:text-pink-600 transition-colors" text={item.name} />
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end min-w-[80px]">
                    <div className="flex items-baseline">
                      <Editable id={`alacarte-vid-item-${idx}-price`} tagName="p" className="text-sm font-bold text-gray-900" text={new Intl.NumberFormat('ko-KR').format(item.price)} />
                      <span className="text-xs text-gray-900 ml-0.5">원</span>
                    </div>
                    {item.note && <Editable id={`alacarte-vid-item-${idx}-note`} tagName="p" className="text-xs text-gray-500" text={item.note} />}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlaCarteSection;