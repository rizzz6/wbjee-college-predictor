"use client";

import { useState } from "react";
import { Quote } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PoemLine {
  ben?: string;
  hin?: string;
  eng?: string;
  highlight?: boolean;
  break?: boolean;
}

const poemLines: PoemLine[] = [
  // Opening line
  {
    ben: "তারা ভয় পায়",
    hin: "वे डरते हैं",
    eng: "They fear"
  },
  { break: true },

  // Stanza 1: 3 lines
  {
    ben: "কিসের ভয় পায় তারা?",
    hin: "किस चीज़ से डरते हैं वे",
    eng: "What is it they fear?"
  },
  {
    ben: "সমস্ত ধন-দৌলত",
    hin: "तमाम धन-दौलत",
    eng: "Despite all the wealth,"
  },
  {
    ben: "গোলা-বারুদ, পুলিশ-ফৌজ থাকা সত্ত্বেও?",
    hin: "गोला-बारूद, पुलिस-फ़ौज के बावजूद?",
    eng: "gunpowder, police, and armies?"
  },
  { break: true },

  // Stanza 2: 1 line
  {
    ben: "তারা ভয় পায়",
    hin: "वे डरते हैं",
    eng: "They fear"
  },
  { break: true },

  // Stanza 3: 3 lines
  {
    ben: "যে একদিন",
    hin: "कि एक दिन",
    eng: "that one day"
  },
  {
    ben: "নিরস্ত্র আর গরিব মানুষ",
    hin: "निहत्थे और ग़रीब लोग",
    eng: "the unarmed and the poor"
  },
  {
    ben: "তাদের ভয় পাওয়া বন্ধ করে দেবে।",
    hin: "उनसे डरना बंद कर देंगे।",
    eng: "will simply stop fearing them.",
    highlight: true
  }
];

export default function FooterAazadi() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="text-xs text-gray-500 dark:text-gray-500 font-mono hover:text-red-600 dark:hover:text-red-500 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded px-1"
          aria-label="Open Aazadi Easter Egg"
        >
          #AAZADI
        </button>
      </DialogTrigger>

      <DialogContent className="bg-zinc-950 border border-zinc-800 max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide selection:bg-red-900 selection:text-red-50 pb-12">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <Quote className="w-6 h-6 text-red-500 mt-1 flex-shrink-0" />
            <div className="flex flex-col">
              <DialogTitle
                className="text-2xl font-bold text-white leading-tight"
                style={{ fontFamily: "var(--font-noto-bengali)" }}
              >
                তারা ভয় পায়
              </DialogTitle>
              <p
                className="text-sm text-zinc-500 mt-1"
                style={{ fontFamily: "var(--font-noto-devanagari)" }}
              >
                ( वे डरते हैं )
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {poemLines.map((line, index) => {
            if (line.break) {
              return (
                <motion.div
                  key={`break-${index}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.15
                  }}
                  className="h-4"
                />
              );
            }

            return (
              <motion.div
                key={`line-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className={`space-y-2 border-l-2 pl-4 ${line.highlight
                  ? "border-red-500/50"
                  : "border-zinc-800"
                  }`}
              >
                {/* Bengali - Large, bright Serif font (Primary focus) */}
                <p
                  className={`text-2xl ${line.highlight
                    ? "text-red-500 font-bold drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                    : "text-gray-100"
                    }`}
                  style={{ fontFamily: "var(--font-noto-bengali)" }}
                >
                  {line.ben}
                </p>

                {/* Hindi - Medium, dimmed Sans-serif (Original) */}
                <p
                  className={`text-lg ${line.highlight
                    ? "text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]"
                    : "text-gray-400"
                    }`}
                  style={{ fontFamily: "var(--font-noto-devanagari)" }}
                >
                  {line.hin}
                </p>

                {/* English - Tiny, faded Monospace Italic (Translation) */}
                <p
                  className={`text-xs font-mono italic ${line.highlight
                    ? "text-red-300/40"
                    : "text-zinc-700"
                    }`}
                >
                  {line.eng}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Credit */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: poemLines.length * 0.15 }}
          className="flex justify-center mt-10"
        >
          <div className="text-[10px] md:text-xs text-zinc-600 tracking-[0.3em] uppercase border-t border-zinc-900 pt-6 border-opacity-50 text-center">
            Gorakh Pandey
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
