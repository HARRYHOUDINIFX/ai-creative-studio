import React from 'react';
import Hero from '../components/Hero';
import PackageSection from '../components/PackageSection';
import MembershipSection from '../components/MembershipSection';
import AlaCarteSection from '../components/AlaCarteSection';
import InfoSection from '../components/InfoSection';

const PricingPage: React.FC = () => {
    return (
        <>
            <Hero />
            <main>
                <PackageSection />
                <MembershipSection />
                <AlaCarteSection />
            </main>
            <InfoSection />
        </>
    );
};

export default PricingPage;
