const CrimsonAbstract = ({ className = '', flip = false }) => (
    <svg
        viewBox="0 0 800 1200"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ transform: flip ? 'scaleX(-1)' : undefined }}
        preserveAspectRatio="xMidYMid slice"
    >
        <defs>
            <linearGradient id="crossGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#DC143C" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#8B0000" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="pulseGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#B22222" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#DC143C" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#B22222" stopOpacity="0.6" />
            </linearGradient>
        </defs>

        <rect width="800" height="1200" fill="white" />

        {/* Soft background glow */}
        <ellipse cx="400" cy="520" rx="300" ry="360" fill="#B22222" opacity="0.04" />

        {/* ─── Medical Cross (center) ─── */}
        <g opacity="0.85">
            <rect x="350" y="360" width="100" height="280" rx="16" fill="url(#crossGrad)" />
            <rect x="260" y="450" width="280" height="100" rx="16" fill="url(#crossGrad)" />
        </g>

        {/* ─── Heartbeat / Pulse Line ─── */}
        <polyline
            points="80,740 200,740 240,740 280,680 320,800 360,700 400,760 440,740 560,740 720,740"
            fill="none"
            stroke="url(#pulseGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />

        {/* ─── DNA Helix Curves (upper area) ─── */}
        <g opacity="0.3">
            {/* Left strand */}
            <path
                d="M180,100 C250,170 350,170 400,240 C450,310 350,310 280,380"
                fill="none" stroke="#B22222" strokeWidth="4" strokeLinecap="round"
            />
            {/* Right strand */}
            <path
                d="M280,100 C350,170 250,170 200,240 C150,310 250,310 320,380"
                fill="none" stroke="#DC143C" strokeWidth="4" strokeLinecap="round"
            />
            {/* Rungs */}
            <line x1="210" y1="140" x2="260" y2="140" stroke="#B22222" strokeWidth="2.5" opacity="0.5" />
            <line x1="230" y1="200" x2="280" y2="200" stroke="#B22222" strokeWidth="2.5" opacity="0.5" />
            <line x1="260" y1="260" x2="310" y2="260" stroke="#B22222" strokeWidth="2.5" opacity="0.5" />
            <line x1="240" y1="320" x2="290" y2="320" stroke="#B22222" strokeWidth="2.5" opacity="0.5" />
        </g>

        {/* ─── Molecular Circles (scattered) ─── */}
        <g opacity="0.2">
            {/* Top-right cluster */}
            <circle cx="600" cy="200" r="28" fill="none" stroke="#B22222" strokeWidth="3" />
            <circle cx="650" cy="260" r="20" fill="none" stroke="#B22222" strokeWidth="2.5" />
            <line x1="618" y1="222" x2="638" y2="246" stroke="#B22222" strokeWidth="2" />

            {/* Bottom-left cluster */}
            <circle cx="180" cy="900" r="24" fill="none" stroke="#DC143C" strokeWidth="3" />
            <circle cx="240" cy="950" r="16" fill="none" stroke="#DC143C" strokeWidth="2.5" />
            <line x1="198" y1="918" x2="228" y2="940" stroke="#DC143C" strokeWidth="2" />

            {/* Floating atoms */}
            <circle cx="620" cy="860" r="5" fill="#B22222" />
            <circle cx="160" cy="480" r="4" fill="#DC143C" />
            <circle cx="640" cy="500" r="6" fill="#B22222" />
        </g>

        {/* ─── Stethoscope-inspired curve (bottom) ─── */}
        <path
            d="M340,1000 C340,940 400,920 430,950 C460,980 460,1020 430,1040 C400,1060 350,1050 340,1000Z"
            fill="none" stroke="#B22222" strokeWidth="3.5" opacity="0.25"
        />
        <path
            d="M340,1000 C300,1000 260,980 220,1000"
            fill="none" stroke="#B22222" strokeWidth="3" strokeLinecap="round" opacity="0.2"
        />

        {/* ─── Subtle capsule shapes ─── */}
        <g opacity="0.15">
            <rect x="560" y="380" width="28" height="60" rx="14" fill="#B22222" transform="rotate(-25 574 410)" />
            <rect x="600" y="640" width="24" height="52" rx="12" fill="#DC143C" transform="rotate(15 612 666)" />
        </g>

        {/* Abstract soft ring behind cross */}
        <circle cx="400" cy="500" r="200" fill="none" stroke="#B22222" strokeWidth="1.5" opacity="0.1" />
        <circle cx="400" cy="500" r="240" fill="none" stroke="#B22222" strokeWidth="1" opacity="0.06" />
    </svg>
);

export default CrimsonAbstract;
