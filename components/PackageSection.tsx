import React from 'react';
import SectionHeader from './SectionHeader';
import PricingCard from './PricingCard';
import { PackageItem } from '../types';

import { PACKAGES as packages } from '../data/packageData';

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