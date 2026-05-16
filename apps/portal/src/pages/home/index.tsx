import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Logos } from "./components/Logos";
import { Features } from "./components/Features";
import { Spotlights } from "./components/Spotlights";
import { UseCases } from "./components/UseCases";
import { Deployment } from "./components/Deployment";
import { Pricing } from "./components/Pricing";
import { Testimonials } from "./components/Testimonials";
import { CTA } from "./components/CTA";
import { Footer } from "./components/Footer";


function Index() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />
            <main>
                <Hero />
                <Logos />
                <Features />
                <Spotlights />
                <UseCases />
                <Deployment />
                <Pricing />
                <Testimonials />
                <CTA />
            </main>
            <Footer />
        </div>
    );
}


export default Index;