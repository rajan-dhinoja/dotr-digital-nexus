import { cn } from "@/lib/utils";

interface FloatingElementsProps {
  className?: string;
  variant?: 'default' | 'subtle' | 'vibrant';
}

export const FloatingElements = ({ className, variant = 'default' }: FloatingElementsProps) => {
  const opacity = variant === 'subtle' ? 'opacity-50' : variant === 'vibrant' ? 'opacity-100' : 'opacity-75';
  
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", opacity, className)}>
      {/* Gradient orbs with improved animations */}
      <div 
        className="absolute top-1/4 -left-20 w-72 h-72 bg-gradient-to-br from-primary/15 to-primary/5 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "0s", animationDuration: "6s" }}
      />
      <div 
        className="absolute top-1/2 -right-20 w-96 h-96 bg-gradient-to-br from-accent/15 to-accent/5 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s", animationDuration: "8s" }}
      />
      <div 
        className="absolute -bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-float"
        style={{ animationDelay: "4s", animationDuration: "7s" }}
      />
      
      {/* Additional atmospheric element */}
      <div 
        className="absolute top-[60%] left-[60%] w-64 h-64 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl animate-float"
        style={{ animationDelay: "3s", animationDuration: "9s" }}
      />
      
      {/* Geometric shapes with smoother animations */}
      <div 
        className="absolute top-20 right-[20%] w-4 h-4 border-2 border-primary/30 rotate-45"
        style={{ animation: "spin-slow 30s linear infinite" }}
      />
      <div 
        className="absolute top-[40%] left-[15%] w-6 h-6 border-2 border-accent/30 rounded-full animate-bounce-subtle"
        style={{ animationDelay: "0.5s" }}
      />
      <div 
        className="absolute bottom-[30%] right-[10%] w-3 h-3 bg-primary/30 rounded-full animate-float"
        style={{ animationDelay: "1s", animationDuration: "5s" }}
      />
      <div 
        className="absolute top-[60%] left-[10%] w-8 h-8 border border-primary/20 rounded-lg rotate-12 animate-float"
        style={{ animationDelay: "2.5s", animationDuration: "6s" }}
      />
      <div 
        className="absolute bottom-[20%] left-[30%] w-2 h-2 bg-accent/40 rounded-full animate-pulse"
        style={{ animationDelay: "0.5s" }}
      />
      <div 
        className="absolute top-[30%] right-[30%] w-5 h-5 border border-accent/20 rotate-45 animate-float"
        style={{ animationDelay: "1.5s", animationDuration: "7s" }}
      />
      
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary)/0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary)/0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
    </div>
  );
};
