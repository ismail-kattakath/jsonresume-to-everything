import { useAISettings } from '@/lib/contexts/ai-settings-context'
import { Highlight } from '@/components/ui/highlight'

interface LanguageProps {
  title: string
  languages: string[]
}

const Language = ({ title, languages }: LanguageProps) => {
  const { settings } = useAISettings()

  if (languages.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="section-title mb-1 border-b-2 border-dashed border-gray-300">{title}</h2>
      <p className="content">
        <Highlight text={languages.join(', ')} keywords={settings.skillsToHighlight} />
      </p>
    </div>
  )
}

export default Language
