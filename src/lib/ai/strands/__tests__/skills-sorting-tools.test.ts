import { validateSkillsJsonTool } from '@/lib/ai/strands/skills-sorting/tools/validate-skills-json.tool'

jest.mock('@strands-agents/sdk', () => ({
  tool: jest.fn().mockImplementation((config) => config),
}))

describe('validateSkillsJsonTool', () => {
  it('should pass valid skills sort result shape', () => {
    const validResult = {
      groupOrder: ['Frontend', 'Backend'],
      skillOrder: {
        Frontend: ['React'],
        Backend: ['Node'],
      },
    }
    const result = JSON.parse((validateSkillsJsonTool as any).callback({ json_string: JSON.stringify(validResult) }))
    expect(result.valid).toBe(true)
    expect(result.issues).toHaveLength(0)
  })

  it('should fail if invalid JSON is passed', () => {
    const result = JSON.parse((validateSkillsJsonTool as any).callback({ json_string: '{foo: "bar"}' }))
    expect(result.valid).toBe(false)
    expect(result.issues[0]).toContain('Output is not valid JSON')
  })

  it('should fail if groupOrder is missing', () => {
    const invalidResult = {
      skillOrder: { Frontend: ['React'] },
    }
    const result = JSON.parse((validateSkillsJsonTool as any).callback({ json_string: JSON.stringify(invalidResult) }))
    expect(result.valid).toBe(false)
    expect(result.issues[0]).toContain('Missing or invalid groupOrder field')
  })

  it('should fail if skillOrder is missing', () => {
    const invalidResult = {
      groupOrder: ['Frontend'],
    }
    const result = JSON.parse((validateSkillsJsonTool as any).callback({ json_string: JSON.stringify(invalidResult) }))
    expect(result.valid).toBe(false)
    expect(result.issues[0]).toContain('Missing or invalid skillOrder field')
  })
})
