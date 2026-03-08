import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import TrustSection from '@/components/sections/TrustSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import DemoSection from '@/components/sections/DemoSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import SmartFeaturesSection from '@/components/sections/SmartFeaturesSection';
import DashboardSection from '@/components/sections/DashboardSection';
import StatsSection from '@/components/sections/StatsSection';
import CTASection from '@/components/sections/CTASection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TrustSection />
        <div className="section-divider" />
        <FeaturesSection />
        <HowItWorksSection />
        <div className="section-divider" />
        <DemoSection />
        <SmartFeaturesSection />
        <div className="section-divider" />
        <DashboardSection />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
