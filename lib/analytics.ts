
'use client';

// Mock Analytics Implementation
// In production, replace this with Vercel Analytics or PostHog

type EventName =
    | 'chat_sent'
    | 'crisis_triggered'
    | 'biometric_update'
    | 'tts_started'
    | 'error_boundary_caught';

interface EventProperties {
    [key: string]: any;
}

export const trackEvent = (name: EventName, properties?: EventProperties) => {
    // In dev, log to console
    if (process.env.NODE_ENV === 'development') {
        console.groupCollapsed(`[Analytics] ${name}`);
        console.log(properties);
        console.groupEnd();
    }

    // Example PostHog implementation:
    // posthog.capture(name, properties);
};

export const useAnalytics = () => {
    return { track: trackEvent };
};
