import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import TrustSection from '@/components/sections/TrustSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import HowItWorksSection from '@/components/sections/HowItWorksSection';
import DemoSection from '@/components/sections/DemoSection';
import StatsSection from '@/components/sections/StatsSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import SmartFeaturesSection from '@/components/sections/SmartFeaturesSection';
import DashboardSection from '@/components/sections/DashboardSection';
import FAQSection from '@/components/sections/FAQSection';
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
        <div className="section-divider" />
        <HowItWorksSection />
        <DemoSection />
        <StatsSection />
        <div className="section-divider" />
        <TestimonialsSection />
        <div className="section-divider" />
        <SmartFeaturesSection />
        <DashboardSection />
        <div className="section-divider" />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
