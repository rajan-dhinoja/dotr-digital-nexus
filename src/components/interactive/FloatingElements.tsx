import { cn } from "@/lib/utils";

interface FloatingElementsProps {
  className?: string;
}

export const FloatingElements = ({ className }: FloatingElementsProps) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Gradient orbs */}
      <div 
        className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "0s" }}
      />
      <div 
        className="absolute top-1/2 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "1s" }}
      />
      <div 
        className="absolute -bottom-20 left-1/3 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />
      
      {/* Geometric shapes */}
      <div 
        className="absolute top-20 right-[20%] w-4 h-4 border-2 border-primary/20 rotate-45 animate-spin-slow"
      />
      <div 
        className="absolute top-[40%] left-[15%] w-6 h-6 border-2 border-accent/20 rounded-full animate-bounce-subtle"
      />
      <div 
        className="absolute bottom-[30%] right-[10%] w-3 h-3 bg-primary/20 rounded-full animate-float"
        style={{ animationDelay: "0.5s" }}
      />
      <div 
        className="absolute top-[60%] left-[10%] w-8 h-8 border border-primary/10 rounded-lg rotate-12 animate-float"
        style={{ animationDelay: "1.5s" }}
      />
    </div>
  );
};
