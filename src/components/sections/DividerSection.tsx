interface DividerSectionProps {
  title?: string;
  subtitle?: string;
  content?: {
    style?: "line" | "dots" | "gradient" | "wave";
    color?: string;
    width?: "full" | "medium" | "narrow";
    spacing?: "small" | "medium" | "large";
  };
}

export const DividerSection = ({ content }: DividerSectionProps) => {
  const style = content?.style || "line";
  const width = content?.width || "full";
  const spacing = content?.spacing || "medium";

  const widthClasses = {
    full: "w-full",
    medium: "w-2/3",
    narrow: "w-1/3",
  };

  const spacingClasses = {
    small: "py-4",
    medium: "py-8",
    large: "py-16",
  };

  const renderDivider = () => {
    switch (style) {
      case "dots":
        return (
          <div className="flex justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="w-2 h-2 rounded-full bg-primary/60" />
            <span className="w-2 h-2 rounded-full bg-primary/30" />
          </div>
        );
      case "gradient":
        return (
          <div className="h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        );
      case "wave":
        return (
          <svg viewBox="0 0 1200 20" className="w-full h-5 fill-primary/20">
            <path d="M0,10 Q150,0 300,10 T600,10 T900,10 T1200,10 L1200,20 L0,20 Z" />
          </svg>
        );
      default:
        return <div className="h-px bg-border" />;
    }
  };

  return (
    <div className={`${spacingClasses[spacing]}`}>
      <div className={`mx-auto ${widthClasses[width]}`}>
        {renderDivider()}
      </div>
    </div>
  );
};
