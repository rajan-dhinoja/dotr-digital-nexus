import { createContext, useContext, useState, ReactNode } from 'react';
import type { PageSection } from '@/hooks/usePageSections';

interface ClipboardSection {
  section_type: string;
  title: string | null;
  subtitle: string | null;
  content: PageSection['content'];
  is_active: boolean;
  sourcePageType: string;
}

interface SectionClipboardContextType {
  copiedSection: ClipboardSection | null;
  copySection: (section: PageSection) => void;
  clearClipboard: () => void;
}

const SectionClipboardContext = createContext<SectionClipboardContextType | undefined>(undefined);

export function SectionClipboardProvider({ children }: { children: ReactNode }) {
  const [copiedSection, setCopiedSection] = useState<ClipboardSection | null>(null);

  const copySection = (section: PageSection) => {
    setCopiedSection({
      section_type: section.section_type,
      title: section.title,
      subtitle: section.subtitle,
      content: section.content,
      is_active: section.is_active,
      sourcePageType: section.page_type,
    });
  };

  const clearClipboard = () => {
    setCopiedSection(null);
  };

  return (
    <SectionClipboardContext.Provider value={{ copiedSection, copySection, clearClipboard }}>
      {children}
    </SectionClipboardContext.Provider>
  );
}

export function useSectionClipboard() {
  const context = useContext(SectionClipboardContext);
  if (!context) {
    throw new Error('useSectionClipboard must be used within a SectionClipboardProvider');
  }
  return context;
}
