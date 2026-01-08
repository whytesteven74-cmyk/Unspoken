import React from 'react';
import { Phone, MessageSquare, AlertTriangle, ExternalLink } from 'lucide-react';

interface CrisisResource {
    name: string;
    contact: string;
}

interface CrisisOverlayProps {
    isOpen: boolean;
    onClose: () => void; // Optional: In strict mode, maybe we don't allow closing easily?
    resources?: CrisisResource[];
    message?: string;
}

export function CrisisOverlay({
    isOpen,
    onClose,
    resources = [
        { name: "Suicide & Crisis Lifeline", contact: "988" },
        { name: "Crisis Text Line", contact: "Text HOME to 741741" }
    ],
    message = "You seem to be going through a difficult time. Please connect with support immediately."
}: CrisisOverlayProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border-t-8 border-red-500 animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="p-6 bg-red-50 text-center">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Support is Available</h2>
                    <p className="mt-2 text-gray-600">{message}</p>
                </div>

                {/* Action Buttons */}
                <div className="p-6 space-y-4">
                    {resources.map((res, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div>
                                <p className="font-semibold text-gray-900">{res.name}</p>
                                <p className="text-sm text-gray-500">Available 24/7</p>
                            </div>
                            <a
                                href={`tel:${res.contact}`}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                <Phone className="w-4 h-4" />
                                <span>{res.contact}</span>
                            </a>
                        </div>
                    ))}

                    <a
                        href="https://988lifeline.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                        <span>Visit 988lifeline.org</span>
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 text-center">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-sm underline"
                    >
                        I am safe now, return to chat
                    </button>
                </div>
            </div>
        </div>
    );
}
