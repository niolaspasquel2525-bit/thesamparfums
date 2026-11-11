export function Logo({ size = 40 }: { size?: number }) {
  return (
    <img
      src="/logo-thesamparfums.jpg"
      alt="The Sam Parfums"
      className="inline-block aspect-square shrink-0 rounded-full object-cover"
      style={{ width: size, height: size }}
    />
  );
}

export function Wordmark({ size = 40 }: { size?: number }) {
  return (
    <span className="flex items-center gap-3">
      <Logo size={size} />
      <span className="label-caps hidden text-foreground sm:inline">The Sam Parfums</span>
    </span>
  );
}
