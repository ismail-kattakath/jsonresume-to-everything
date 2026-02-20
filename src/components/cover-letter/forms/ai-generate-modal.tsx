import AIDocumentGeneratorModal from '@/components/document-builder/shared-forms/ai-document-generator-modal'
import type { ResumeData } from '@/types'

interface AIGenerateCoverLetterModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (content: string) => void
  resumeData: ResumeData
}

const AIGenerateCoverLetterModal: React.FC<AIGenerateCoverLetterModalProps> = (props) => {
  return <AIDocumentGeneratorModal {...props} mode="coverLetter" />
}

export default AIGenerateCoverLetterModal
