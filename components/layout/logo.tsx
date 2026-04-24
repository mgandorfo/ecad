import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { icon: 24, text: "text-base", sub: "text-[9px]" },
  md: { icon: 32, text: "text-xl", sub: "text-[10px]" },
  lg: { icon: 48, text: "text-3xl", sub: "text-xs" },
};

export function Logo({ className, showTagline = false, size = "md" }: LogoProps) {
  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        {/* fill via CSS var — funciona em SVG inline */}
        <rect width="32" height="32" rx="7" fill="var(--color-primary)" />
        <rect x="8" y="8" width="12" height="2.5" rx="1" fill="white" />
        <rect x="8" y="14.75" width="9" height="2.5" rx="1" fill="white" />
        <rect x="8" y="21.5" width="12" height="2.5" rx="1" fill="white" />
        <rect x="8" y="8" width="2.5" height="16" rx="1" fill="white" />
        <circle cx="23" cy="23" r="3" fill="rgba(255,255,255,0.15)" />
        <circle cx="23" cy="23" r="1.5" fill="white" />
      </svg>

      <div className="flex flex-col leading-none">
        <span className={cn("font-bold tracking-tight text-foreground", s.text)}>
          E-CAD
        </span>
        {showTagline && (
          <span className={cn("text-muted-foreground font-normal tracking-wide uppercase mt-0.5", s.sub)}>
            Gestão de Atendimentos
          </span>
        )}
      </div>
    </div>
  );
}
