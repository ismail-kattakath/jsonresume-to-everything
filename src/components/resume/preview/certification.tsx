import { useAISettings } from '@/lib/contexts/ai-settings-context'
import { Highlight } from '@/components/ui/highlight'

const Certification = ({
  title,
  certifications,
}: {
  title: string
  certifications: Array<string | { name: string; issuer?: string }>
}) => {
  const { settings } = useAISettings()
  return (
    certifications.length > 0 && (
      <div>
        <h2 className="section-title mb-1 border-b-2 border-dashed border-gray-300">{title}</h2>
        <ul className="content mt-1 list-disc ps-3.5">
          {certifications.map((certification: string | { name: string; issuer?: string }, index: number) => (
            <li key={index}>
              <Highlight
                text={typeof certification === 'string' ? certification : certification.name}
                keywords={settings.skillsToHighlight}
              />
              {typeof certification !== 'string' && certification.issuer && (
                <span>
                  {' '}
                  - <Highlight text={certification.issuer} keywords={settings.skillsToHighlight} />
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    )
  )
}

export default Certification
