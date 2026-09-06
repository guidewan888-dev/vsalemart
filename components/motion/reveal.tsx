"use client";

import * as m from "motion/react-m";

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return <m.div className={className} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .4, delay, ease: [.22, 1, .36, 1] }}>{children}</m.div>;
}
