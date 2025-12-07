import React from 'react';
import SectionHeader from './SectionHeader';
import PricingCard from './PricingCard';
import { PackageItem } from '../types';

const memberships: PackageItem[] = [
  {
    id: 'standard',
    title: 'STANDARD',
    subtitle: '블로그 집중형',
    price: 600000,
    type: 'membership',
    description: [
      '블로그 포스팅 월 4회 (주 1회)',
      '포스팅용 연출 이미지 매주 생성',
      '키워드 상위노출 전략 적용'
    ],
    recommendation: '꾸준한 브랜드\n노출이 필요한 경우'
  },
  {
    id: 'premium',
    title: 'PREMIUM',
    subtitle: '영상+SNS 확산형',
    price: 1200000,
    isHot: true,
    type: 'membership',
    description: [
      '블로그 포스팅 월 4회',
      '<strong class="text-gray-900">인스타 릴스/쇼츠 제작 월 2회</strong>',
      '인스타용 감성 이미지 월 8장 제공',
      '시즌별(명절 등) 컨셉 이미지 교체'
    ],
    recommendation: '매출 상승 목표 시\n가장 효과적'
  }
];

const MembershipSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50" id="membership">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          id="section-membership"
          number="02"
          title="월간 멤버십 (정기 관리)"
          subtitle="💡 마케터 채용 비용의 50% 수준으로\n콘텐츠 기획+제작+업로드를 해결해 드립니다."
        />
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 items-center sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2 lg:gap-x-8">
          {memberships.map((pkg) => (
            <PricingCard key={pkg.id} item={pkg} cardId={`membership-${pkg.id}`} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MembershipSection;