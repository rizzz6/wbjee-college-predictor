'use client';

import { useEffect, useState } from 'react';
import {
    X, Printer, AlertTriangle, Sparkles, Skull, Building2,
    Crown, Trophy, CheckCircle, Landmark, ShieldAlert,
    IndianRupee, GraduationCap, AlertCircle
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

// --- LOOT TABLE & CONFIGURATION ---

type Rarity = 'ModTier' | 'SSR' | 'SR' | 'Glitch' | 'Rare' | 'Cursed' | 'Common';

interface LootItem {
    college: string;
    branch: string;
    msg: string;
    type: 'govt' | 'private';
}

interface RarityTier {
    id: Rarity;
    label: string;
    color: string; // Tailwind color class for text/badges
    bgColor: string; // Tailwind color class for backgrounds
    icon: any;
    probability: number; // 0-100 percentage
    items: LootItem[];
    rankRange: [number, number];
}

const LOOT_TABLE: RarityTier[] = [
    {
        id: 'ModTier',
        label: 'r/wbjee MOD (0.1%)',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
        icon: Crown,
        probability: 0.1,
        rankRange: [0, 0],
        items: [
            { college: "r/wbjee Community", branch: "Moderator", msg: "Touch grass is now mandatory.", type: 'govt' },
            { college: "r/wbjee Community", branch: "Chief Meme Officer", msg: "Your salary: upvotes.", type: 'govt' },
            { college: "r/wbjee Community", branch: "Prediction Bot Admin", msg: "You predict colleges now.", type: 'govt' }
        ]
    },
    {
        id: 'SSR',
        label: 'LEGENDARY (0.9%)',
        color: 'text-amber-500',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        icon: Sparkles,
        probability: 0.9,
        rankRange: [1, 100],
        items: [
            { college: "Jadavpur University", branch: "Computer Science & Engg", msg: "Don't wake up. This is a dream.", type: 'govt' },
            { college: "Jadavpur University", branch: "Politics & Revolution Engg", msg: "Hok Kolorob! (Classes Optional).", type: 'govt' },
            { college: "Jadavpur University", branch: "Canteen Food Testing", msg: "Milan Da's Canteen is the real campus.", type: 'govt' }
        ]
    },
    {
        id: 'SR',
        label: 'EPIC (3%)',
        color: 'text-purple-600',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        icon: Sparkles,
        probability: 3,
        rankRange: [101, 1000],
        items: [
            { college: "Jadavpur University", branch: "Printing Engineering", msg: "The reason this website exists.", type: 'govt' },
            { college: "Jadavpur University", branch: "Power Engineering", msg: "Unlimited Power! (But mostly circuits).", type: 'govt' },
            { college: "Jadavpur University", branch: "Construction Engineering", msg: "Bob the Builder Quota.", type: 'govt' },
            { college: "Calcutta University", branch: "Polymer Science", msg: "Is it plastic? Is it rubber? Who knows.", type: 'govt' }
        ]
    },
    {
        id: 'Glitch',
        label: 'GLITCH (5%)',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100/50 dark:bg-yellow-900/20',
        icon: AlertTriangle,
        probability: 5,
        rankRange: [404, 404],
        items: [
            { college: "IIT Kharagpur", branch: "Computer Science", msg: "Wrong exam, right dream.", type: 'govt' },
            { college: "NIT Durgapur", branch: "Metallurgy", msg: "JEE Main leaderboard activated.", type: 'govt' },
            { college: "IIEST Shibpur", branch: "Civil Engineering", msg: "BESU legacy lives on.", type: 'govt' },
            { college: "Presidency University", branch: "Physics Honors", msg: "CUET exam says hello.", type: 'govt' }
        ]
    },
    {
        id: 'Rare',
        label: 'RARE (10%)',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        icon: Building2,
        probability: 10,
        rankRange: [1001, 5000],
        items: [
            { college: "GCELT (Leather Tech)", branch: "Luxury Handbag Design", msg: "Gucci & Prada are waiting.", type: 'govt' },
            { college: "GCELT (Leather Tech)", branch: "Tannery Aroma Therapy", msg: "You get used to the smell.", type: 'govt' },
            { college: "GCETTS (Berhampore)", branch: "Fashion Week Backend", msg: "Raymond: The Complete Man.", type: 'govt' },
            { college: "GCETTS (Berhampore)", branch: "Thread Counting", msg: "100% Cotton, 0% Placement.", type: 'govt' },
            { college: "KGEC (Kalyani)", branch: "Almost JU Studies", msg: "So close to Kolkata, yet so far.", type: 'govt' },
            { college: "KGEC (Kalyani)", branch: "Mess Food Survival", msg: "The hostel dal is 99% water.", type: 'govt' },
            { college: "JGEC (Jalpaiguri)", branch: "Momo & Thukpa Tech", msg: "Placement in Darjeeling.", type: 'govt' },
            { college: "JGEC (Jalpaiguri)", branch: "Leopard Defense", msg: "Don't walk alone at night.", type: 'govt' },
            { college: "CGEC (Cooch Behar)", branch: "Royal Palace Guarding", msg: "The Palace is nice, the rest is...", type: 'govt' },
            { college: "CGEC (Cooch Behar)", branch: "Flood Management", msg: "Bring a boat.", type: 'govt' }
        ]
    },
    {
        id: 'Cursed',
        label: 'CURSED (12%)',
        color: 'text-red-600',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        icon: Skull,
        probability: 12,
        rankRange: [20000, 50000],
        items: [
            { college: "IEM (Salt Lake)", branch: "Uniform Management", msg: "Tuck your shirt in.", type: 'private' },
            { college: "IEM (Salt Lake)", branch: "Haircut Inspection", msg: "Too stylish. Get out.", type: 'private' },
            { college: "UEM (New Town)", branch: "Assignment Factory", msg: "Sleep is for the weak.", type: 'private' },
            { college: "UEM (New Town)", branch: "No Holiday Tech", msg: "Durga Puja is just a rumor here.", type: 'private' },
            { college: "St. Thomas (STCET)", branch: "School Assembly Engg", msg: "Stand in line for prayer.", type: 'private' },
            { college: "St. Thomas (STCET)", branch: "Gate Locking Tech", msg: "Once you enter, you never leave.", type: 'private' },
            { college: "MCKVIE (Liluah)", branch: "Traffic Jam Studies", msg: "Stuck at Don Bosco crossing.", type: 'private' },
            { college: "MCKVIE (Liluah)", branch: "Auto-Rickshaw Bargaining", msg: "Liluah Toto union leader.", type: 'private' }
        ]
    },
    {
        id: 'Common',
        label: 'COMMON (69%)',
        color: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        icon: Building2,
        probability: 69,
        rankRange: [50001, 100000],
        items: [
            // MAKAUT (Govt)
            { college: "MAKAUT (The Boss)", branch: "MAR Points Collection", msg: "Plant a tree or fail.", type: 'govt' },
            { college: "MAKAUT (The Boss)", branch: "Portal 404 Engg", msg: "Server is under maintenance.", type: 'govt' },
            { college: "MAKAUT (The Boss)", branch: "Supplementary Exam Funding", msg: "Thank you for your donation.", type: 'govt' },
            { college: "Meghnad Saha Institute", branch: "Budget Physics Lab", msg: "DIY equipment recommended.", type: 'govt' },
            { college: "Aliah University", branch: "Minority Quota Management", msg: "Madrasa to engineering pipeline.", type: 'govt' },

            // JIS Ecosystem (Private)
            { college: "JIS Group", branch: "Hoarding & Banner Mgmt", msg: "We are everywhere.", type: 'private' },
            { college: "JIS Group", branch: "YouTube Ad Production", msg: "Skip Ad in 5 seconds...", type: 'private' },
            { college: "JIS College of Engineering", branch: "Kalyani Local Train Studies", msg: "Sealdah connection expertise.", type: 'private' },

            // Brainware/Adamas (Private - Barasat)
            { college: "Brainware University", branch: "Chowmatha Crossing Mgmt", msg: "Barasat's finest.", type: 'private' },
            { college: "Brainware University", branch: "Full Page Ad Design", msg: "Placement: 1000% (on paper).", type: 'private' },
            { college: "Adamas University", branch: "Picnic Spot Management", msg: "Is this a college or a resort?", type: 'private' },
            { college: "Adamas University", branch: "Rich Kid Studies", msg: "My dad owns the company.", type: 'private' },

            // Techno Ecosystem (Private)
            { college: "Techno Main", branch: "Elevator Queue Engg", msg: "Stairs are faster.", type: 'private' },
            { college: "Techno Main", branch: "Glass Building Cleaning", msg: "It's shiny but hot.", type: 'private' },
            { college: "Techno India (EM-4)", branch: "Metro Station Navigation", msg: "Kasba to class in 1 hour.", type: 'private' },
            { college: "Techno Engineering (Hooghly)", branch: "Bridge Toll Engg", msg: "Vivekananda Setu daily tax.", type: 'private' },
            { college: "Techno International (Batanagar)", branch: "Factory Noise Studies", msg: "Lectures with smoke stacks.", type: 'private' },
            { college: "Techno Engineering (Banipur)", branch: "North Bengal Express Studies", msg: "Siliguri dreams, Kolkata fees.", type: 'private' },

            // Heritage/Haldia (Private)
            { college: "Heritage (HIT-K)", branch: "Canteen Studies", msg: "Attendance optional, food mandatory.", type: 'private' },
            { college: "Heritage (HIT-K)", branch: "Film Shooting Support", msg: "Is that a movie star?", type: 'private' },
            { college: "Haldia (HIT)", branch: "Chemical Inhalation", msg: "Smells like 'industry'.", type: 'private' },
            { college: "Haldia (HIT)", branch: "Core Placement Myth", msg: "Waiting for IOCL.", type: 'private' },

            // South/North Kolkata (Private)
            { college: "RCC Institute", branch: "South Kolkata Traffic Mgmt", msg: "Rashbehari to class = 2 hours.", type: 'private' },
            { college: "Narula Institute", branch: "Lake Town Adda Studies", msg: "Chai > Classes.", type: 'private' },
            { college: "Swami Vivekananda Institute", branch: "Thakurpukur Survival", msg: "Beyond Behala lies salvation.", type: 'private' },
            { college: "GNIT (Sodepur)", branch: "Dum Dum Airport Noise Mgmt", msg: "Aircraft > Lectures.", type: 'private' },

            // New Town/EM Bypass (Private)
            { college: "Future Institute", branch: "EM Bypass Survival Tech", msg: "Road rage as lab subject.", type: 'private' },
            { college: "Sister Nivedita University", branch: "Diary Submission Engg", msg: "Handwritten, 50 pages daily.", type: 'private' },
            { college: "Camellia Institute", branch: "New Town Startup Simulation", msg: "We're a 'tech hub' now.", type: 'private' },

            // Howrah/Others (Private)
            { college: "Bengal Institute of Technology", branch: "Howrah Station Commute", msg: "Board the Bandel local daily.", type: 'private' },
            { college: "Netaji Subhash Engineering", branch: "Morning Assembly Mgmt", msg: "7 AM sharp or CGPA -1.", type: 'private' },
            { college: "NSHM Knowledge Campus", branch: "Billboard Flexing", msg: "Campus > Content.", type: 'private' },
            { college: "MIT (Murshidabad)", branch: "Not Massachusetts", msg: "We have MIT at home.", type: 'private' }
        ]
    }
];

const RESULT_TRIGGER = ['r', 'e', 's', 'u', 'l', 't'];

// Tier-specific Meme Ranks
const MEME_RANKS = {
    // For ModTier - Meta ranks (exclusive, no numbers)
    MOD_TIER: ["MOD", "ADMIN", "FOUNDER", "∞"],

    // For SSR/SR (Elite Colleges) - "Nice" or "Elite" numbers
    GOD_TIER: ["1", "69", "420", "007", "1337", "100", "786", "3000"],

    // For Rare (Mid-tier Govt) - Internet Classics
    MID_TIER: ["42069", "69420", "80085", "404", "500", "9001", "12345"],

    // For Common (Private/Ads) - High numbers with humor
    COMMON_TIER: ["99999", "127001", "1000000", "2147483647"],

    // For Cursed - Actually bad realistic ranks
    CURSED_TIER: ["299999", "450000", "600000", "850000", "999999", "1200000"],

    // For Glitch - System errors and tech codes
    GLITCH_TIER: ["NaN", "-1", "null", "undefined", "SegFault", "SyntaxError", "Infinity", "Error 418", "404", "WRONG_EXAM"]
};

const COUNSELING_ROUNDS = [
    "Final (Desperate)",
    "Last Chance",
    "Backup Plan",
    "Safety Net",
    "Mop-Up (Scam)",
    "Spot Round (Miracle)",
    "Extended Round",
    "Special Supplementary"
];

const SEAT_TYPES = [
    "Last Resort",
    "Consolation Prize",
    "Plan Z",
    "Better Than Nothing",
    "Donation (Hidden)",
    "Management Quota",
    "NRI Sponsored",
    "Sympathy Allocation"
];

const CATEGORIES = [
    "General (Anxiety)",
    "OBC (Optimistically Believing in Career)",
    "SC (Still Confused)",
    "EWS (Extremely Worried Student)",
    "PWD (Praying We'll Do fine)",
    "TFW (Tuition Fee Waiver? Never heard.)",
    "General-Women (Genuinely Worried)"
];

const QUOTAS = [
    "Emotional Support",
    "Participation Trophy",
    "Attendance Award",
    "Sympathy Seat",
    "Pity Quota",
    "Last Bench Reserved",
    "Backup Option",
    "Consolation Round"
];

// ModTier-specific values (meta/community themed)
const MODTIER_ROUNDS = [
    "Founding Round",
    "Community Election",
    "Unanimous Vote",
    "Emergency Appointment"
];

const MODTIER_SEAT_TYPES = [
    "Moderator Seat",
    "Admin Access",
    "Community Leader",
    "Volunteer Position"
];

const MODTIER_CATEGORIES = [
    "Active Contributor",
    "Meme Lord",
    "Helper Extraordinaire",
    "Community Pillar"
];

const MODTIER_QUOTAS = [
    "Dedication Quota",
    "Community Service",
    "Karma Points",
    "Upvote Reserve"
];

// --- HELPER COMPONENT: LETTER CONTENT ---
// This component renders the actual letter. It is used twice: once for the screen, once for the printer.
interface LetterContentProps {
    result: any;
    timestamp: string;
    stampConfig: any;
    isPrintMode?: boolean;
    isRolling?: boolean;
}

const LetterContent = ({ result, timestamp, stampConfig, isPrintMode = false, isRolling = false }: LetterContentProps) => {
    const TierIcon = result.tier.icon;

    // Determine wrapper styles based on tier and mode
    const getWrapperStyles = () => {
        if (isPrintMode) return 'w-full h-screen p-8 bg-white text-black font-mono'; // Ink-saving print mode

        const base = "p-6 text-center space-y-5 relative border-4 transition-all duration-300 rounded-sm";

        // Check if rank indicates a glitch (for Glitch tier styling)
        const isGlitchRank = ['NaN', 'SegFault', 'Error 418', 'SyntaxError', 'undefined', 'null', '404', 'WRONG_EXAM'].includes(result.rank);

        if (isGlitchRank) {
            // Simplified glitch styling - no pulse for accessibility
            return `${base} border-black border-dashed font-mono bg-gray-50 dark:bg-slate-800`;
        }

        switch (result.tier.id) {
            case 'SSR':
                return `${base} border-yellow-500 bg-white dark:bg-slate-900 shadow-[0_0_30px_rgba(234,179,8,0.3)]`;
            case 'Cursed':
                return `${base} border-red-700 bg-white dark:bg-slate-900 shadow-[inset_0_0_40px_rgba(220,38,38,0.1)]`;
            default: // Common, SR, Rare
                return `${base} border-black bg-white dark:bg-slate-900 shadow-md`;
        }
    };

    // Respect user's motion preferences
    const shouldReduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return (
        <div className={`${getWrapperStyles()} ${!isRolling && !isPrintMode && !shouldReduceMotion ? 'animate-[shake_0.5s_ease-in-out_1]' : ''}`}>
            {/* Print Mode Header (Simpler, cleaner for paper) */}
            {isPrintMode && (
                <div className="border-b-2 border-black pb-4 mb-6 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 flex items-center justify-center">
                            <img src="/assets/images/wbjee-logo.svg" alt="WBJEE Logo" className="w-full h-full object-contain" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-xl font-bold uppercase tracking-wider">WBJEE Board</h1>
                            <p className="text-xs font-mono">AQ-13/1, Sector-V, Salt Lake City, Kolkata-700091</p>
                        </div>
                    </div>
                    <div className="text-right font-mono text-xs">
                        <p>Memo: {result.rank}/ALLOT/2026</p>
                        <p>Date: {timestamp}</p>
                    </div>
                </div>
            )}

            {/* Screen Mode Header (Original Design) */}
            {!isPrintMode && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 border-b border-slate-200 dark:border-slate-700 -mx-6 -mt-6 mb-5">
                    <div className="flex items-center gap-3">
                        <img src="/assets/images/wbjee-logo.svg" alt="WBJEE Logo" className="w-14 h-14 object-contain" />
                        <div className="flex-1 text-left">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight">West Bengal Joint Entrance Examinations Board</h3>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">AQ-13/1, Sector-V, Salt Lake City, Kolkata-700091</p>
                            <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                                Generated: {timestamp} IST | Server: WBJEE-NIC-04
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Info Section Container */}
            <div className="relative mt-6 mb-8">
                <div className="flex justify-between items-start">
                    {/* Left Side: College Details & Badge */}
                    <div className="text-left pr-16 relative z-10 w-3/4">
                        <h2 className={`text-2xl font-bold leading-tight mb-2 ${isPrintMode ? 'text-black' : 'text-slate-900 dark:text-white'}`}>
                            {result.item.college}
                        </h2>
                        <p className={`text-lg font-medium mb-4 ${isPrintMode ? 'text-black' : (result.tier.id === 'Cursed' ? 'text-red-700 dark:text-red-200' : 'text-slate-600 dark:text-slate-300')}`}>
                            {result.item.branch}
                        </p>

                    </div>

                    {/* Right Side: Rubber Stamp */}
                    <div className={`absolute top-0 -right-2 border-4 px-4 py-2 transform -rotate-12 pointer-events-none z-0 
                        ${isPrintMode
                            ? 'border-black text-black opacity-80'
                            : `${stampConfig.color.replace('text-', 'border-')} ${stampConfig.color} ${stampConfig.bg} 
                               ${isRolling || shouldReduceMotion
                                ? 'scale-100 opacity-80'
                                : 'scale-100 opacity-80 transition-all duration-200 ease-in'
                            }`
                        }
                    `}>
                        <p className="font-bold text-lg uppercase tracking-wider whitespace-nowrap" style={{ fontFamily: '"Impact", sans-serif' }}>
                            {stampConfig.text}
                        </p>
                    </div>
                </div>
            </div>

            {/* Details Table */}
            <div className={`mt-6 rounded-lg border overflow-hidden text-sm text-left
                ${isPrintMode ? 'border-black bg-white' : 'bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700'}
            `}>
                <div className={`grid grid-cols-2 divide-x border-b
                     ${isPrintMode ? 'divide-black border-black' : 'divide-slate-200 dark:divide-slate-700 border-slate-200 dark:border-slate-700'}
                `}>
                    <div className="p-3">
                        <p className={`text-xs uppercase tracking-wider mb-0.5 ${isPrintMode ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Reference No</p>
                        <p className={`font-mono font-medium truncate ${isPrintMode ? 'text-black' : 'text-slate-900 dark:text-slate-100'}`}>WBJEE/26/{result.rank}</p>
                    </div>
                    <div className="p-3">
                        <p className={`text-xs uppercase tracking-wider mb-0.5 ${isPrintMode ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Rank (GMR)</p>
                        <p className={`font-mono font-bold ${isPrintMode ? 'text-black' : 'text-slate-900 dark:text-slate-100'}`}>{result.rank}</p>
                    </div>
                </div>
                <div className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <span className={`${isPrintMode ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Category</span>
                        <span className={`font-medium ${isPrintMode ? 'text-black' : 'text-slate-900 dark:text-slate-100'}`}>{result.category}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className={`${isPrintMode ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Round</span>
                        <span className={`font-medium ${isPrintMode ? 'text-black' : 'text-amber-600 dark:text-amber-400'}`}>{result.round}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className={`${isPrintMode ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Seat Type</span>
                        <span className={`font-medium ${isPrintMode ? 'text-black' : 'text-blue-600 dark:text-blue-400'}`}>{result.seatType}</span>
                    </div>
                    <div className={`flex justify-between items-center pt-2 border-t mt-2
                        ${isPrintMode ? 'border-dashed border-black' : 'border-slate-200 dark:border-slate-700'}
                    `}>
                        <span className={`font-medium ${isPrintMode ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Quota</span>
                        <span className={`font-bold ${isPrintMode ? 'text-black' : 'text-emerald-600 dark:text-emerald-400'}`}>{result.quota}</span>
                    </div>
                </div>
            </div>

            {/* Fun Quote & Badge */}
            <div className="flex justify-between items-center mt-6 px-2 gap-4">
                <p className={`text-xs italic font-medium text-left ${isPrintMode ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>
                    &quot;{result.item.msg}&quot;
                </p>

                {/* Rarity Badge - Moved Here */}
                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0
                      ${isPrintMode ? 'border border-black text-black' : `${result.tier.color} ${result.tier.bgColor}`}
                 `}>
                    <TierIcon className="w-3 h-3" />
                    {result.tier.label}
                </div>
            </div>

            {/* Print Mode Footer */}
            {isPrintMode && (
                <div className="mt-12 flex justify-between items-end pt-8 border-t-2 border-black">
                    <div className="text-xs font-mono">
                        <p>System Generated Document</p>
                        <p>No Signature Required (Or Deserved)</p>
                    </div>
                    <div className="text-center">
                        <div className="h-10 w-32 border-b border-black mb-1 relative">
                            <p className="absolute bottom-1 w-full text-center font-handwriting text-lg italic">u/rizzz6</p>
                        </div>
                        <p className="text-xs font-bold uppercase">Mod of r/wbjee</p>
                    </div>
                </div>
            )}

            {/* Screen Mode Signature */}
            {!isPrintMode && (
                <div className="pt-2 mt-4">
                    <div className="flex flex-col items-center">
                        <div className="h-8 w-32 relative mb-1">
                            <div className="absolute inset-0 flex items-end justify-center">
                                <p className={`font-handwriting italic ${result.tier.id === 'Cursed' ? 'text-red-900/80 dark:text-red-200/80' : 'text-slate-500'}`}>u/rizzz6</p>
                            </div>
                        </div>
                        <p className={`text-[10px] uppercase tracking-widest font-semibold ${result.tier.id === 'Cursed' ? 'text-red-800/70 dark:text-red-300/70' : 'text-slate-400 dark:text-slate-500'}`}>
                            Mod of r/wbjee
                        </p>
                        <p className={`text-[9px] ${result.tier.id === 'Cursed' ? 'text-red-800/50 dark:text-red-300/50' : 'text-slate-400 dark:text-slate-600'}`}>
                            Authorized Signatory
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ResultHack() {
    const [, setKeySequence] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isRolling, setIsRolling] = useState(false);
    const [displayResult, setDisplayResult] = useState<{
        tier: RarityTier;
        item: LootItem;
        rank: string;
        round: string;
        seatType: string;
        category: string;
        quota: string;
    } | null>(null);

    // Config state to hold the rolled result
    const [result, setResult] = useState<{
        tier: RarityTier;
        item: LootItem;
        rank: string;
        round: string;
        seatType: string;
        category: string;
        quota: string;
    } | null>(null);

    // Roll the Gacha
    const rollGacha = () => {
        if (isRolling) return; // Prevent multiple triggers

        let selectedTier: RarityTier;
        let selectedItem: LootItem;

        // Randomly select tier based on probability
        const rand = Math.random() * 100;
        let cumulative = 0;
        selectedTier = LOOT_TABLE[LOOT_TABLE.length - 1]; // Default to common

        for (const tier of LOOT_TABLE) {
            cumulative += tier.probability;
            if (rand <= cumulative) {
                selectedTier = tier;
                break;
            }
        }

        // Pick random item from tier
        selectedItem = selectedTier.items[Math.floor(Math.random() * selectedTier.items.length)];

        // Select meme rank based on tier
        let rank: string;
        let rankPool: string[];
        switch (selectedTier.id) {
            case 'ModTier':
                rankPool = MEME_RANKS.MOD_TIER;
                break;
            case 'SSR':
            case 'SR':
                rankPool = MEME_RANKS.GOD_TIER;
                break;
            case 'Glitch':
                rankPool = MEME_RANKS.GLITCH_TIER;
                break;
            case 'Rare':
                rankPool = MEME_RANKS.MID_TIER;
                break;
            case 'Common':
                rankPool = MEME_RANKS.COMMON_TIER;
                break;
            case 'Cursed':
                rankPool = MEME_RANKS.CURSED_TIER;
                break;
            default:
                rankPool = MEME_RANKS.COMMON_TIER;
        }
        rank = rankPool[Math.floor(Math.random() * rankPool.length)];

        // Use ModTier-specific values if ModTier, otherwise use regular values
        const finalResult = {
            tier: selectedTier,
            item: selectedItem,
            rank,
            round: selectedTier.id === 'ModTier'
                ? MODTIER_ROUNDS[Math.floor(Math.random() * MODTIER_ROUNDS.length)]
                : COUNSELING_ROUNDS[Math.floor(Math.random() * COUNSELING_ROUNDS.length)],
            seatType: selectedTier.id === 'ModTier'
                ? MODTIER_SEAT_TYPES[Math.floor(Math.random() * MODTIER_SEAT_TYPES.length)]
                : SEAT_TYPES[Math.floor(Math.random() * SEAT_TYPES.length)],
            category: selectedTier.id === 'ModTier'
                ? MODTIER_CATEGORIES[Math.floor(Math.random() * MODTIER_CATEGORIES.length)]
                : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
            quota: selectedTier.id === 'ModTier'
                ? MODTIER_QUOTAS[Math.floor(Math.random() * MODTIER_QUOTAS.length)]
                : QUOTAS[Math.floor(Math.random() * QUOTAS.length)]
        };

        // Start Animation
        setResult(finalResult);
        setIsOpen(true);
        setIsRolling(true);

        const interval = setInterval(() => {
            // Pick random item for text variety
            const randomSourceTier = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
            const randomItem = randomSourceTier.items[Math.floor(Math.random() * randomSourceTier.items.length)];

            // Use Common tier for neutral styling during roll to prevent background flashing
            const neutralTier = LOOT_TABLE.find(t => t.id === 'Common')!;

            setDisplayResult({
                tier: neutralTier,
                item: { ...randomItem, msg: "Spinning..." },
                rank: "CALCULATING...",
                round: "PROCESSING...",
                seatType: "...",
                category: "...",
                quota: "..."
            });
        }, 100);

        setTimeout(() => {
            clearInterval(interval);
            setIsRolling(false);
            setDisplayResult(null);
            triggerConfetti(finalResult.tier.id);
        }, 2500);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                document.activeElement?.tagName === 'INPUT' ||
                document.activeElement?.tagName === 'TEXTAREA' ||
                document.activeElement?.getAttribute('contenteditable') === 'true'
            ) return;

            const key = e.key.toLowerCase();

            setKeySequence((prev) => {
                const newSeq = [...prev, key];

                // Check for 'result' trigger
                if (newSeq.slice(-RESULT_TRIGGER.length).join('') === RESULT_TRIGGER.join('')) {
                    rollGacha();
                    return [];
                }

                return newSeq.slice(-10); // Keep buffer small
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const triggerConfetti = (tierId: Rarity) => {
        // Respect user's motion preferences
        const shouldReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (shouldReduceMotion) return;

        // Tier-specific configuration
        const config: Record<Rarity, { colors: string[]; count: number; duration: number }> = {
            ModTier: { colors: ['#FFD700', '#FFA500', '#FFFF00'], count: 100, duration: 5 },
            SSR: { colors: ['#FCD34D', '#F59E0B', '#FFA500'], count: 75, duration: 4 },
            SR: { colors: ['#10B981', '#059669', '#34D399'], count: 60, duration: 3.5 },
            Glitch: { colors: ['#FACC15', '#EF4444', '#000000'], count: 50, duration: 3 },
            Rare: { colors: ['#9333EA', '#A855F7', '#C084FC'], count: 50, duration: 3 },
            Cursed: { colors: ['#DC2626', '#991B1B', '#7F1D1D'], count: 40, duration: 2.5 },
            Common: { colors: ['#3B82F6', '#60A5FA', '#93C5FD'], count: 30, duration: 2 }
        };

        const { colors, count, duration } = config[tierId] || config.Common;

        // ModTier screen flash
        if (tierId === 'ModTier') {
            const flash = document.createElement('div');
            Object.assign(flash.style, {
                position: 'fixed',
                inset: '0',
                backgroundColor: 'white',
                opacity: '0',
                zIndex: '9998',
                pointerEvents: 'none'
            });
            document.body.appendChild(flash);

            flash.animate([
                { opacity: '0' },
                { opacity: '0.6' },
                { opacity: '0' }
            ], { duration: 400, easing: 'ease-in-out' });

            setTimeout(() => flash.remove(), 400);
        }

        // Confetti particles
        for (let i = 0; i < count; i++) {
            const confetti = document.createElement('div');
            Object.assign(confetti.style, {
                position: 'fixed',
                width: '10px',
                height: '10px',
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                left: Math.random() * 100 + '%',
                top: '-10px',
                opacity: '1',
                transform: 'rotate(' + Math.random() * 360 + 'deg)',
                zIndex: '9999',
                pointerEvents: 'none'
            });
            document.body.appendChild(confetti);

            const xMovement = (Math.random() - 0.5) * 200;

            confetti.animate([
                { transform: `translate(0, 0) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${xMovement}px, 100vh) rotate(${Math.random() * 720}deg)`, opacity: 0 }
            ], {
                duration: duration * 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });

            setTimeout(() => confetti.remove(), duration * 1000);
        }
    };

    if (!isOpen || !result) return null;

    // Generate current timestamp
    const timestamp = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Asia/Kolkata'
    });

    // Determine what to show (Rolling vs Final)
    const currentDisplay = isRolling && displayResult ? displayResult : result;

    // Get stamp text and color based on tier and type (category-aware)
    const getStampConfig = () => {
        const tier = currentDisplay.tier.id;
        const type = currentDisplay.item.type;

        if (tier === 'ModTier') {
            return { text: 'MOD STATUS', color: 'text-yellow-500 border-yellow-500', bg: 'bg-yellow-50' };
        }
        if (tier === 'Glitch') {
            return { text: 'EXAM ERROR', color: 'text-yellow-600 border-yellow-600', bg: 'bg-yellow-50' };
        }
        if (tier === 'SSR') {
            return { text: 'DREAM UNLOCKED', color: 'text-amber-500 border-amber-500', bg: 'bg-amber-50' };
        }
        if (tier === 'SR') {
            return { text: 'MERIT BASED', color: 'text-green-600 border-green-600', bg: 'bg-green-50' };
        }
        if (tier === 'Rare') {
            return { text: 'MAMATA DI FUNDED', color: 'text-purple-600 border-purple-600', bg: 'bg-purple-50' };
        }
        if (tier === 'Cursed') {
            return { text: 'STRICT WATCH', color: 'text-red-600 border-red-600', bg: 'bg-red-50' };
        }
        if (tier === 'Common') {
            if (type === 'private') {
                return { text: 'FEES PENDING', color: 'text-blue-600 border-blue-600', bg: 'bg-blue-50' };
            } else {
                return { text: 'LEGACY ADMIT', color: 'text-teal-600 border-teal-600', bg: 'bg-teal-50' };
            }
        }
        return { text: 'SYSTEM ERROR', color: 'text-slate-900 border-slate-900', bg: 'bg-slate-100' };
    };

    const stampConfig = getStampConfig();

    return (
        <>
            {/* Screen Mode Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className={`max-w-md p-0 overflow-hidden bg-white dark:bg-slate-900 border shadow-2xl print:hidden ${currentDisplay.tier.id === 'Cursed' && !isRolling ? 'animate-[shake_0.5s_ease-in-out]' : ''
                    } ${currentDisplay.tier.id === 'ModTier' && !isRolling ? 'border-yellow-500 shadow-yellow-500/70 ring-2 ring-yellow-400/50'
                        : currentDisplay.tier.id === 'SSR' && !isRolling ? 'border-amber-400 shadow-amber-500/50'
                            : currentDisplay.tier.id === 'SR' && !isRolling ? 'border-purple-400 shadow-purple-500/50'
                                : 'border-slate-200 dark:border-slate-800'
                    }`} style={{ fontFamily: '"Space Mono", "Courier New", monospace' }}>
                    <DialogTitle className="sr-only">
                        WBJEE Seat Allotment Letter
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Your seat allotment result for WBJEE counseling
                    </DialogDescription>

                    <LetterContent
                        result={currentDisplay}
                        timestamp={timestamp}
                        stampConfig={stampConfig}
                        isRolling={isRolling}
                    />

                    {/* Action Buttons (Screen Only) */}
                    <div className="grid grid-cols-2 gap-3 p-6 pt-0">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-md text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <Printer className="w-4 h-4" />
                            Print
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm"
                        >
                            Accept & Freeze
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Hidden Twin for Printing */}
            <div id="print-only-container" className="hidden print:block font-mono bg-white text-black">
                <LetterContent
                    result={result}
                    timestamp={timestamp}
                    stampConfig={stampConfig}
                    isPrintMode={true}
                />
            </div>

        </>
    );
}
