import AIGenerateModal from "@/components/document-builder/shared-forms/AIGenerateModal";
import type { ResumeData } from "@/types";

interface AIGenerateSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (content: string) => void;
  resumeData: ResumeData;
}

const AIGenerateSummaryModal: React.FC<AIGenerateSummaryModalProps> = (
  props
) => {
  return <AIGenerateModal {...props} mode="summary" />;
};

export default AIGenerateSummaryModal;
