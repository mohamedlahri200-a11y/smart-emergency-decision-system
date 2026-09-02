// src/components/landing/AIEmergencyEmblem.tsx
import React from "react";

interface Props {
    size?: number;
}

/**
 * Emblème sur mesure fusionnant la croix médicale des urgences et un
 * réseau de neurones (symbole de l'intelligence artificielle) en une
 * seule composition cohérente — remplace l'empilement de deux icônes
 * génériques séparées sur la landing page.
 */
const AIEmergencyEmblem: React.FC<Props> = ({ size = 160 }) => {
    return (
        <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="emblemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1976D2" />
                    <stop offset="100%" stopColor="#0D47A1" />
                </linearGradient>
            </defs>

            <rect x="8" y="8" width="184" height="184" rx="42" fill="url(#emblemGradient)" />

            <g stroke="#7FD8CC" strokeWidth="2.5" opacity="0.85">
                <line x1="52" y1="52" x2="100" y2="100" />
                <line x1="148" y1="52" x2="100" y2="100" />
                <line x1="52" y1="148" x2="100" y2="100" />
                <line x1="148" y1="148" x2="100" y2="100" />
                <line x1="100" y1="34" x2="100" y2="100" />
                <line x1="100" y1="166" x2="100" y2="100" />
            </g>

            <g fill="#FFFFFF">
                <rect x="82" y="58" width="36" height="84" rx="8" />
                <rect x="58" y="82" width="84" height="36" rx="8" />
            </g>

            <g fill="#26D3B3">
                <circle cx="52" cy="52" r="9" />
                <circle cx="148" cy="52" r="9" />
                <circle cx="52" cy="148" r="9" />
                <circle cx="148" cy="148" r="9" />
                <circle cx="100" cy="34" r="7" />
                <circle cx="100" cy="166" r="7" />
            </g>

            <circle cx="100" cy="100" r="10" fill="#26D3B3" stroke="#0D47A1" strokeWidth="3" />
        </svg>
    );
};

export default AIEmergencyEmblem;