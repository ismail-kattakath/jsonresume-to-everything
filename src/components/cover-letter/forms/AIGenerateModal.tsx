import AIGenerateModal from "@/components/document-builder/shared-forms/AIGenerateModal";
import type { ResumeData } from "@/types";

interface AIGenerateCoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (content: string) => void;
  resumeData: ResumeData;
}

const AIGenerateCoverLetterModal: React.FC<AIGenerateCoverLetterModalProps> = (
  props
) => {
  return <AIGenerateModal {...props} mode="coverLetter" />;
};

export default AIGenerateCoverLetterModal;
