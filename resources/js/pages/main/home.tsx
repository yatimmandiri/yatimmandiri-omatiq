import { AboutSection } from '@/components/sections/home/about-section';
import { BenefitSection } from '@/components/sections/home/benefit-section';
import { CTASection } from '@/components/sections/home/cta-section';
import { HeroSection } from '@/components/sections/home/hero-section';
import { ProgramSection } from '@/components/sections/home/program-section';
import { StatSection } from '@/components/sections/home/stat-section';
import { TestimonialSection } from '@/components/sections/home/testimonial-section';

export default function HomePage() {
    return (
        <div>
            <HeroSection />
            <AboutSection />
            <BenefitSection />
            <ProgramSection />
            <StatSection />
            <TestimonialSection />
            <CTASection />
        </div>
    );
}
