import { validateAchievementsTool } from '@/lib/ai/strands/experience-tailoring/tools/validate-achievements.tool'
import { validateTechStackTool } from '@/lib/ai/strands/experience-tailoring/tools/validate-tech-stack.tool'
import { validateDescriptionTool } from '@/lib/ai/strands/experience-tailoring/tools/validate-description.tool'

jest.mock('@strands-agents/sdk', () => ({
  tool: jest.fn().mockImplementation((config) => config),
}))

describe('Experience Tailoring Tools', () => {
  describe('validateAchievementsTool', () => {
    it('should validate exact count matches with valid achievements', () => {
      const original = ['Built feature X', 'Optimized query Y']
      const rewritten = ['Developed scalable feature X.', 'Enhanced performance for query Y.']
      const result = JSON.parse((validateAchievementsTool as any).callback({ original, rewritten }))
      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should fail if count length differs', () => {
      const original = ['Built feature X', 'Optimized query Y']
      const rewritten = ['Developed scalable feature X.'] // missing one
      const result = JSON.parse((validateAchievementsTool as any).callback({ original, rewritten }))
      expect(result.valid).toBe(false)
      expect(result.issues[0]).toContain('Count mismatch')
    })

    it('should fail if achievement is suspiciously short', () => {
      const original = ['Built feature X']
      const rewritten = ['Built X'] // length < 10 chars
      const result = JSON.parse((validateAchievementsTool as any).callback({ original, rewritten }))
      expect(result.valid).toBe(false)
      expect(result.issues[0]).toContain('too short or empty')
    })
  })

  describe('validateTechStackTool', () => {
    it('should pass valid alignment containing the same tech stack', () => {
      const original = ['React', 'Node']
      const proposed = ['React.js', 'Node.js', 'NodeJS']
      const result = JSON.parse((validateTechStackTool as any).callback({ original, proposed }))
      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should fail for hallucinated tech items', () => {
      const original = ['React', 'Node.js']
      const proposed = ['React', 'Angular', 'Vue']
      const result = JSON.parse((validateTechStackTool as any).callback({ original, proposed }))
      expect(result.valid).toBe(false)
      expect(result.issues[0]).toContain('Potentially fabricated tech items')
      expect(result.issues[0]).toContain('Angular, Vue')
    })

    it('should fail if item is too short', () => {
      const original = ['React', 'Node.js']
      const proposed = ['React', 'A']
      const result = JSON.parse((validateTechStackTool as any).callback({ original, proposed }))
      expect(result.valid).toBe(false)
      expect(result.issues[0]).toContain('Potentially fabricated tech')
    })

    it('should fail if proposed tech stack is too large', () => {
      const original = ['React']
      const proposed = ['React.js', 'ReactJS', 'React Library']
      const result = JSON.parse((validateTechStackTool as any).callback({ original, proposed }))
      expect(result.valid).toBe(false)
      expect(result.issues[0]).toContain('Too many items added')
    })
  })

  describe('validateDescriptionTool', () => {
    it('should pass properly rewritten description', () => {
      const original = 'Worked as a dev creating apis.'
      const rewritten =
        'Key contributor to backend web services APIs handling thousands of daily active users, built scalable infrastructure spanning cloud environments.'
      const result = JSON.parse((validateDescriptionTool as any).callback({ original, rewritten }))
      expect(result.valid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should fail if rewritten description is too short', () => {
      const original = 'Worked as a dev creating apis.'
      const rewritten = 'Built APIs' // < 50 chars
      const result = JSON.parse((validateDescriptionTool as any).callback({ original, rewritten }))
      expect(result.valid).toBe(false)
      expect(result.issues[0]).toContain('too short')
    })

    it('should fail if rewritten description is empty', () => {
      const result = JSON.parse((validateDescriptionTool as any).callback({ original: 'abc', rewritten: '  ' }))
      expect(result.valid).toBe(false)
      expect(result.issues[0]).toContain('empty')
    })

    it('should fail if rewritten matches original perfectly', () => {
      const original = 'Led multiple cloud migration efforts spanning global regions.'
      const rewritten = 'Led multiple cloud migration efforts spanning global regions.'
      const result = JSON.parse((validateDescriptionTool as any).callback({ original, rewritten }))
      expect(result.valid).toBe(false)
      expect(result.issues[0]).toContain('identical to original')
    })
  })
})
