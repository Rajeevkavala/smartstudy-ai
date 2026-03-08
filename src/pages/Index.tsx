import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import StatsSection from '@/components/sections/StatsSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import DemoSection from '@/components/sections/DemoSection';
import SmartFeaturesSection from '@/components/sections/SmartFeaturesSection';
import CTASection from '@/components/sections/CTASection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <HowItWorksSection />
        <FeaturesSection />
        <DemoSection />
        <SmartFeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
