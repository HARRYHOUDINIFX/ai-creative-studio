import React from 'react';
import SectionHeader from './SectionHeader';
import PricingCard from './PricingCard';
import { PackageItem } from '../types';

const packages: PackageItem[] = [
  {
    id: 'A',
    title: 'A. 상세페이지 심폐소생 팩',
    price: 290000,
    originalPrice: 340000,
    type: 'package',
    description: [
      '<strong class="text-gray-900">이미지 3종 + GIF 1종</strong>',
      '제품 연출컷 2장 (메인용)',
      '컨셉/패키지 연출컷 1장',
      '상세페이지용 움짤(GIF) 1건'
    ],
    recommendation: '기존 상세페이지의\n구매 전환율을 높이고 싶은 분'
  },
  {
    id: 'B',
    title: 'B. 런칭 올인원 팩',
    price: 850000,
    originalPrice: 1150000,
    isHot: true,
    type: 'package',
    description: [
      '<strong class="text-gray-900">이미지 5종 + GIF 3종 + 숏폼 영상 + 블로그</strong>',
      '고퀄리티 연출컷 3장',
      '모델 연출컷 2장 (초상권 해결)',
      '숏폼 영상(20~30초 내외) 1건 + GIF 변환 2건',
      '<span class="text-primary-600 font-bold">(서비스)</span> 블로그 홍보글 1건'
    ],
    recommendation: '신제품 출시,\n와디즈 펀딩,\n브랜딩이 필요한 분'
  }
];

const PackageSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-24 bg-white" id="packages">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          id="section-packages"
          number="01"
          title="BEST 패키지 (런칭/리뉴얼 특화)"
          subtitle="가장 많이 찾는 구성입니다. 💡 낱개 주문 대비 30% 이상 할인된 금액입니다."
        />
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 items-center sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2 lg:gap-x-8">
          {packages.map((pkg) => (
            <PricingCard key={pkg.id} item={pkg} cardId={`package-${pkg.id}`} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PackageSection;