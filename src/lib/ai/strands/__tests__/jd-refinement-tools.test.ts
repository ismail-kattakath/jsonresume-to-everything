import { validateJDFormatTool } from '../jd-refinement/tools/validate-format.tool'

jest.mock('@strands-agents/sdk', () => ({
    tool: jest.fn().mockImplementation((config) => config),
}))

describe('validateJDFormatTool', () => {
    it('should return valid true for properly formatted JD', () => {
        const goodJD = `
# position-title
Software Engineer

# core-responsibilities
- Write code
- Fix bugs

# desired-qualifications
- BS in CS
- 2+ years experience

# required-skills
- React
- TypeScript
`
        const result = JSON.parse((validateJDFormatTool as any).callback({ jd_text: goodJD }))
        expect(result.valid).toBe(true)
        expect(result.issues).toHaveLength(0)
    })

    it('should complain if markdown bold formatting is used', () => {
        const jd = `
# position-title
**Software Engineer**

# core-responsibilities
- Write code

# desired-qualifications
- BS in CS

# required-skills
- React
`
        const result = JSON.parse((validateJDFormatTool as any).callback({ jd_text: jd }))
        expect(result.valid).toBe(false)
        expect(result.issues).toContain('Contains disallowed bold markdown (**)')
    })

    it('should enforce max 5 items for list sections', () => {
        const jd = `
# position-title
Dev

# core-responsibilities
- 1
- 2
- 3
- 4
- 5
- 6

# desired-qualifications
- 1

# required-skills
- React
`
        const result = JSON.parse((validateJDFormatTool as any).callback({ jd_text: jd }))
        expect(result.valid).toBe(false)
        expect(result.issues[0]).toContain('core-responsibilities has 6 items (max 5)')
    })

    it('should flag missing sections', () => {
        const jd = `
# position-title
Dev

# required-skills
- React
`
        const result = JSON.parse((validateJDFormatTool as any).callback({ jd_text: jd }))
        expect(result.valid).toBe(false)
        expect(result.issues).toEqual(expect.arrayContaining([
            "Missing required section: # core-responsibilities",
            "Missing required section: # desired-qualifications"
        ]))
    })
})
