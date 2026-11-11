export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-gold/60 sm:w-24" />
      <span className="text-[0.5rem] text-gold">◆</span>
      <span className="h-px w-16 bg-gold/60 sm:w-24" />
    </div>
  );
}
