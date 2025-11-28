import { tooltips } from '@/config/tooltips'

describe('Tooltips Configuration', () => {
  describe('Structure', () => {
    it('should have all required categories', () => {
      expect(tooltips).toHaveProperty('navigation')
      expect(tooltips).toHaveProperty('sections')
      expect(tooltips).toHaveProperty('aiSettings')
      expect(tooltips).toHaveProperty('skills')
      expect(tooltips).toHaveProperty('workExperience')
      expect(tooltips).toHaveProperty('personalInfo')
      expect(tooltips).toHaveProperty('importExport')
    })
  })

  describe('Navigation Tooltips', () => {
    it('should have mode switcher tooltip', () => {
      expect(tooltips.navigation.modeSwitcher).toBeTruthy()
      expect(typeof tooltips.navigation.modeSwitcher).toBe('string')
      expect(tooltips.navigation.modeSwitcher.length).toBeGreaterThan(0)
    })

    it('should have print button tooltip', () => {
      expect(tooltips.navigation.printButton).toBeTruthy()
      expect(typeof tooltips.navigation.printButton).toBe('string')
    })

    it('should have ATS check tooltip', () => {
      expect(tooltips.navigation.atsCheck).toBeTruthy()
      expect(typeof tooltips.navigation.atsCheck).toBe('string')
    })

    it('should have logout tooltip', () => {
      expect(tooltips.navigation.logout).toBeTruthy()
      expect(typeof tooltips.navigation.logout).toBe('string')
    })
  })

  describe('Section Tooltips', () => {
    it('should have import/export tooltip', () => {
      expect(tooltips.sections.importExport).toBeTruthy()
      expect(typeof tooltips.sections.importExport).toBe('string')
    })

    it('should have AI settings tooltip', () => {
      expect(tooltips.sections.aiSettings).toBeTruthy()
      expect(typeof tooltips.sections.aiSettings).toBe('string')
    })

    it('should have personal info tooltip', () => {
      expect(tooltips.sections.personalInfo).toBeTruthy()
      expect(typeof tooltips.sections.personalInfo).toBe('string')
    })

    it('should have work experience tooltip', () => {
      expect(tooltips.sections.workExperience).toBeTruthy()
      expect(typeof tooltips.sections.workExperience).toBe('string')
    })

    it('should have skills tooltip', () => {
      expect(tooltips.sections.skills).toBeTruthy()
      expect(typeof tooltips.sections.skills).toBe('string')
    })
  })

  describe('AI Settings Tooltips', () => {
    it('should have valid status tooltip', () => {
      expect(tooltips.aiSettings.validStatus).toBeTruthy()
      expect(typeof tooltips.aiSettings.validStatus).toBe('string')
    })

    it('should have invalid status tooltip', () => {
      expect(tooltips.aiSettings.invalidStatus).toBeTruthy()
      expect(typeof tooltips.aiSettings.invalidStatus).toBe('string')
    })

    it('should have testing status tooltip', () => {
      expect(tooltips.aiSettings.testingStatus).toBeTruthy()
      expect(typeof tooltips.aiSettings.testingStatus).toBe('string')
    })
  })

  describe('Skills Tooltips', () => {
    it('should have add group tooltip', () => {
      expect(tooltips.skills.addGroup).toBeTruthy()
      expect(typeof tooltips.skills.addGroup).toBe('string')
    })

    it('should have rename group tooltip', () => {
      expect(tooltips.skills.renameGroup).toBeTruthy()
      expect(typeof tooltips.skills.renameGroup).toBe('string')
    })

    it('should have delete group tooltip', () => {
      expect(tooltips.skills.deleteGroup).toBeTruthy()
      expect(typeof tooltips.skills.deleteGroup).toBe('string')
    })

    it('should have drag group tooltip', () => {
      expect(tooltips.skills.dragGroup).toBeTruthy()
      expect(typeof tooltips.skills.dragGroup).toBe('string')
    })

    it('should have expand/collapse tooltip', () => {
      expect(tooltips.skills.expandCollapse).toBeTruthy()
      expect(typeof tooltips.skills.expandCollapse).toBe('string')
    })
  })

  describe('Content Quality', () => {
    it('should have concise tooltips (under 100 characters)', () => {
      const allTooltips = Object.values(tooltips).flatMap((category) =>
        Object.values(category)
      )

      allTooltips.forEach((tooltip) => {
        expect(tooltip.length).toBeLessThan(100)
      })
    })

    it('should not have empty tooltips', () => {
      const allTooltips = Object.values(tooltips).flatMap((category) =>
        Object.values(category)
      )

      allTooltips.forEach((tooltip) => {
        expect(tooltip.trim().length).toBeGreaterThan(0)
      })
    })

    it('should not start or end with whitespace', () => {
      const allTooltips = Object.values(tooltips).flatMap((category) =>
        Object.values(category)
      )

      allTooltips.forEach((tooltip) => {
        expect(tooltip).toBe(tooltip.trim())
      })
    })
  })
})
