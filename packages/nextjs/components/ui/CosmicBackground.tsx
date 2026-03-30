/**
 * Cosmic Background Component
 * Animated gradient background for the futuristic design
 */

export function CosmicBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Animated background layers */}
      <div className="cosmic-bg" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

/**
 * Glass Card Component
 */
export function GlassCard({
  children,
  className = "",
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div className={`glass-card ${hover ? "transition-all duration-300" : ""} ${className}`}>
      {children}
    </div>
  );
}

/**
 * Stat Card Component
 */
export function StatCard({
  label,
  value,
  icon,
  trend,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
}) {
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-4">
        <span className="text-sm text-[var(--text-muted)] uppercase tracking-wider">
          {label}
        </span>
        {icon && <span className="text-[var(--neon-cyan)]">{icon}</span>}
      </div>
      <div className="stat-card-value">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      {trend && (
        <div
          className={`mt-2 text-sm ${
            trend.positive ? "text-[var(--neon-green)]" : "text-[var(--neon-pink)]"
          }`}
        >
          {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
        </div>
      )}
    </div>
  );
}

/**
 * Neon Button Component
 */
export function NeonButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  [key: string]: unknown;
}) {
  const variants = {
    primary: "btn-neon",
    secondary: "btn-glass btn-glass-primary",
    danger: "btn-glass btn-glass-danger",
    ghost: "btn-glass",
  };

  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

/**
 * Glass Input Component
 */
export function GlassInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  // For number inputs, ensure text color is visible
  const isNumber = props.type === "number";
  const style = isNumber ? { 
    color: '#f8fafc',
    background: 'rgba(15, 23, 41, 0.6)',
    WebkitTextFillColor: '#f8fafc',
    opacity: 1
  } : undefined;
  
  return (
    <input
      className="input-glass w-full"
      style={style}
      {...props}
    />
  );
}

/**
 * Badge Component
 */
export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "active" | "inactive" | "frozen";
}) {
  const variants = {
    default: "badge-neon bg-[var(--glass-bg)] border border-[var(--border-subtle)]",
    active: "badge-neon badge-active",
    inactive: "badge-neon badge-inactive",
    frozen: "badge-neon badge-frozen",
  };

  return (
    <span className={variants[variant]}>
      {children}
    </span>
  );
}

/**
 * Section Title Component
 */
export function SectionTitle({
  children,
  neonColor = "cyan",
}: {
  children: React.ReactNode;
  neonColor?: "cyan" | "purple" | "pink" | "green" | "orange";
}) {
  const colors = {
    cyan: "neon-cyan",
    purple: "neon-purple",
    pink: "neon-pink",
    green: "neon-green",
    orange: "neon-orange",
  };

  return (
    <h2 className={`text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3`}>
      <span className={`w-1 h-8 rounded-full bg-[var(--${colors[neonColor]})]`} />
      {children}
    </h2>
  );
}

/**
 * Page Header Component
 */
export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        <span className="text-[var(--neon-cyan)] neon-text">{title}</span>
      </h1>
      {description && (
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}