"use client";

import { ScanFace, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <motion.button type="button" onClick={toggleTheme} whileTap={{ scale: 0.92 }} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} className="grid size-10 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:text-[var(--text)]">
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </motion.button>
  );
}

export function SkinOrb({ active = false, compact = false }: { active?: boolean; compact?: boolean }) {
  return (
    <div className={`relative grid shrink-0 place-items-center ${compact ? "size-20" : "size-[min(72vw,330px)] sm:size-[350px]"}`} aria-hidden="true">
      {!compact && <motion.div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(80,129,246,.25),rgba(145,124,249,.1)_55%,transparent_72%)] blur-xl" animate={{ scale: active ? [0.88, 1.08, 0.88] : [0.95, 1.04, 0.95], opacity: active ? [0.55, 0.92, 0.55] : [0.45, 0.76, 0.45] }} transition={{ duration: active ? 1.8 : 4, repeat: Infinity, ease: "easeInOut" }} />}
      {!compact && <motion.div className="absolute inset-[7%] rounded-full border border-[#819cff]/45" animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} />}
      {!compact && <motion.div className="absolute inset-0 rounded-full border border-dashed border-[#aa9aff]/35" animate={{ rotate: -360 }} transition={{ duration: 45, repeat: Infinity, ease: "linear" }} />}
      {!compact && <div className="absolute inset-[15%] rounded-full border border-[#91d9ff]/35" />}
      <motion.div className={`relative grid ${compact ? "size-[70%]" : "size-[67%]"} place-items-center overflow-hidden rounded-full border border-white/75 bg-[radial-gradient(circle_at_34%_25%,#f2fdff_0%,#b5e6ff_17%,#7696ff_43%,#6357dc_72%,#343292_100%)] shadow-[inset_-18px_-22px_48px_rgba(34,30,106,.38),inset_12px_10px_30px_rgba(255,255,255,.7),0_0_44px_rgba(101,131,255,.4)]`} animate={{ scale: active ? [0.96, 1.03, 0.96] : [0.985, 1.015, 0.985] }} transition={{ duration: active ? 1.6 : 4.5, repeat: Infinity, ease: "easeInOut" }}>
        <motion.div className="absolute -inset-1/3 bg-[conic-gradient(from_20deg,transparent,rgba(255,255,255,.42),transparent_38%,rgba(167,224,255,.4),transparent_76%)]" animate={{ rotate: 360 }} transition={{ duration: 17, repeat: Infinity, ease: "linear" }} />
        <span className="relative z-10 grid size-12 place-items-center rounded-full border border-white/45 bg-white/15 text-white shadow-[0_0_24px_rgba(255,255,255,.25)] backdrop-blur-sm sm:size-14"><ScanFace size={compact ? 25 : 30} strokeWidth={1.4} /></span>
      </motion.div>
      {!compact && ["15% 25%", "82% 19%", "87% 69%", "18% 78%", "50% 6%"].map((position, index) => {
        const [left, top] = position.split(" ");
        return <motion.span key={position} className="absolute z-20 size-1.5 rounded-full bg-[#91e5ff] shadow-[0_0_12px_3px_rgba(96,208,255,.55)]" style={{ left, top }} animate={{ y: [0, -7, 0], opacity: [0.35, 1, 0.35] }} transition={{ duration: 2.6 + index * 0.25, delay: index * 0.22, repeat: Infinity, ease: "easeInOut" }} />;
      })}
    </div>
  );
}