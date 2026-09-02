import {
    Header,
    HeroSection,
    AboutSection,
    FeaturesSection,
    MetiersSection,
    AISection,
    StatisticsSection,
    ContactSection,
    Footer
} from "../components/landing";

export default function LandingPage() {
    return (
        <>
            <Header />

            <main>

                <HeroSection />

                <AboutSection />

                <FeaturesSection />

                <MetiersSection />

                <AISection />

                <StatisticsSection />

                <ContactSection />

            </main>

            <Footer />
        </>
    );
}