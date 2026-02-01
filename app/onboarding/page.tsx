import { CalibrationWizard } from '@/components/onboarding/calibration-wizard';
import { BRAND } from '@/lib/brand';

export default function OnboardingPage() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4"
            style={{ backgroundColor: BRAND.colors.background.dark }}>

            <div className="max-w-2xl w-full">
                <header className="mb-12 text-center space-y-4">
                    <h1 className="text-4xl font-bold tracking-tighter text-white"
                        style={{ fontFamily: BRAND.fonts.heading }}>
                        Unspoken
                    </h1>
                    <p className="text-xl text-white/60 font-light">
                        {BRAND.tagline}
                    </p>
                </header>

                <main className="relative z-10">
                    <CalibrationWizard />
                </main>

                {/* Background Ambient Glow */}
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-900/20 rounded-full blur-[120px] pointer-events-none" />
            </div>
        </div>
    );
}
