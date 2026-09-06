export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  void delay;
  return <div className={className}>{children}</div>;
}
