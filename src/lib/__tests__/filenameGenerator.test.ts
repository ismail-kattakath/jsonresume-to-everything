import {
  toPascalCase,
  generateFilename,
  generatePDFFilename,
  generateJSONFilename,
} from '../filenameGenerator'

describe('toPascalCase', () => {
  it('should convert simple strings to PascalCase', () => {
    expect(toPascalCase('hello world')).toBe('HelloWorld')
    expect(toPascalCase('senior developer')).toBe('SeniorDeveloper')
  })

  it('should remove special characters and convert to PascalCase', () => {
    expect(toPascalCase('senior-software-engineer')).toBe(
      'Seniorsoftwareengineer'
    )
    expect(toPascalCase('full-stack developer!')).toBe('FullstackDeveloper')
    expect(toPascalCase('C++ Developer')).toBe('CDeveloper')
    expect(toPascalCase('john@doe.com')).toBe('Johndoecom')
  })

  it('should handle multiple spaces', () => {
    expect(toPascalCase('hello   world')).toBe('HelloWorld')
    expect(toPascalCase('  senior   software   engineer  ')).toBe(
      'SeniorSoftwareEngineer'
    )
  })

  it('should handle empty strings', () => {
    expect(toPascalCase('')).toBe('')
    expect(toPascalCase('   ')).toBe('')
  })

  it('should handle strings with only special characters', () => {
    expect(toPascalCase('!@#$%')).toBe('')
    expect(toPascalCase('---')).toBe('')
  })

  it('should handle mixed case input', () => {
    expect(toPascalCase('HELLO WORLD')).toBe('HelloWorld')
    expect(toPascalCase('HeLLo WoRLd')).toBe('HelloWorld')
  })

  it('should handle non-string inputs', () => {
    expect(toPascalCase(null as unknown as string)).toBe('')
    expect(toPascalCase(undefined as unknown as string)).toBe('')
  })

  it('should handle real-world examples', () => {
    expect(toPascalCase('Senior Software Engineer')).toBe(
      'SeniorSoftwareEngineer'
    )
    expect(toPascalCase('Full-Stack Developer')).toBe('FullstackDeveloper')
    expect(toPascalCase('John Doe')).toBe('JohnDoe')
    expect(toPascalCase("O'Brien")).toBe('Obrien')
    expect(toPascalCase('María García')).toBe('MaraGarca')
  })
})

describe('generateFilename', () => {
  it('should generate filename with position, name, and document type', () => {
    const result = generateFilename({
      name: 'John Doe',
      position: 'Senior Software Engineer',
      documentType: 'Resume',
    })
    expect(result).toBe('SeniorSoftwareEngineer-JohnDoe-Resume')
  })

  it('should generate filename without date by default', () => {
    const result = generateFilename({
      name: 'Jane Smith',
      position: 'Product Manager',
      documentType: 'CoverLetter',
    })
    expect(result).toBe('ProductManager-JaneSmith-CoverLetter')
  })

  it('should generate filename with date when includeDate is true', () => {
    const result = generateFilename({
      name: 'John Doe',
      position: 'Senior Developer',
      documentType: 'Resume.json',
      includeDate: true,
    })
    // Should match format: YYYYMM-Position-Name-Resume.json
    expect(result).toMatch(/^\d{6}-SeniorDeveloper-JohnDoe-Resume\.json$/)
  })

  it('should handle empty position gracefully', () => {
    const result = generateFilename({
      name: 'John Doe',
      position: '',
      documentType: 'Resume',
    })
    expect(result).toBe('JohnDoe-Resume')
  })

  it('should handle empty name gracefully', () => {
    const result = generateFilename({
      name: '',
      position: 'Senior Developer',
      documentType: 'Resume',
    })
    expect(result).toBe('SeniorDeveloper-Resume')
  })

  it('should handle special characters in names and positions', () => {
    const result = generateFilename({
      name: "Mary O'Brien-Smith",
      position: 'Senior C++ Developer',
      documentType: 'Resume',
    })
    expect(result).toBe('SeniorCDeveloper-MaryObriensmith-Resume')
  })

  it('should handle all document types', () => {
    const resume = generateFilename({
      name: 'John Doe',
      position: 'Developer',
      documentType: 'Resume',
    })
    const coverLetter = generateFilename({
      name: 'John Doe',
      position: 'Developer',
      documentType: 'CoverLetter',
    })
    const json = generateFilename({
      name: 'John Doe',
      position: 'Developer',
      documentType: 'Resume.json',
    })

    expect(resume).toBe('Developer-JohnDoe-Resume')
    expect(coverLetter).toBe('Developer-JohnDoe-CoverLetter')
    expect(json).toBe('Developer-JohnDoe-Resume.json')
  })
})

describe('generatePDFFilename', () => {
  it('should generate PDF filename with Resume as default document type', () => {
    const result = generatePDFFilename('John Doe', 'Senior Developer')
    expect(result).toBe('SeniorDeveloper-JohnDoe-Resume')
  })

  it('should generate PDF filename for Resume', () => {
    const result = generatePDFFilename(
      'John Doe',
      'Senior Developer',
      'Resume'
    )
    expect(result).toBe('SeniorDeveloper-JohnDoe-Resume')
  })

  it('should generate PDF filename for CoverLetter', () => {
    const result = generatePDFFilename(
      'Jane Smith',
      'Product Manager',
      'CoverLetter'
    )
    expect(result).toBe('ProductManager-JaneSmith-CoverLetter')
  })

  it('should handle special characters in PDF filenames', () => {
    const result = generatePDFFilename(
      'María García',
      'Full-Stack Developer',
      'Resume'
    )
    expect(result).toBe('FullstackDeveloper-MaraGarca-Resume')
  })

  it('should handle empty strings in PDF filenames', () => {
    const result = generatePDFFilename('', '', 'Resume')
    expect(result).toBe('Resume')
  })
})

describe('generateJSONFilename', () => {
  it('should generate JSON filename with date prefix', () => {
    const result = generateJSONFilename('John Doe', 'Senior Developer')
    // Should match format: YYYYMM-Position-Name-Resume.json
    expect(result).toMatch(
      /^\d{6}-SeniorDeveloper-JohnDoe-Resume\.json$/
    )
  })

  it('should include current year and month in filename', () => {
    const now = new Date()
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    const result = generateJSONFilename('Jane Smith', 'Product Manager')
    expect(result).toContain(yearMonth)
    expect(result).toContain('ProductManager')
    expect(result).toContain('JaneSmith')
  })

  it('should handle special characters in JSON filenames', () => {
    const result = generateJSONFilename(
      'Mary O\'Brien',
      'Senior C++ Developer'
    )
    expect(result).toMatch(/^\d{6}-SeniorCDeveloper-MaryObrien-Resume\.json$/)
  })

  it('should always include Resume.json suffix', () => {
    const result = generateJSONFilename('John Doe', 'Developer')
    expect(result).toMatch(/Resume\.json$/)
  })

  it('should handle empty strings in JSON filenames', () => {
    const result = generateJSONFilename('', '')
    expect(result).toMatch(/^\d{6}-Resume\.json$/)
  })
})

describe('Integration tests', () => {
  it('should maintain consistency across all filename generators', () => {
    const name = 'John Doe'
    const position = 'Senior Software Engineer'

    const pdfResume = generatePDFFilename(name, position, 'Resume')
    const pdfCoverLetter = generatePDFFilename(name, position, 'CoverLetter')
    const json = generateJSONFilename(name, position)

    // All should use the same PascalCase conversion
    expect(pdfResume).toContain('SeniorSoftwareEngineer')
    expect(pdfResume).toContain('JohnDoe')
    expect(pdfCoverLetter).toContain('SeniorSoftwareEngineer')
    expect(pdfCoverLetter).toContain('JohnDoe')
    expect(json).toContain('SeniorSoftwareEngineer')
    expect(json).toContain('JohnDoe')

    // PDF filenames should not have date
    expect(pdfResume).not.toMatch(/^\d{6}/)
    expect(pdfCoverLetter).not.toMatch(/^\d{6}/)

    // JSON filename should have date
    expect(json).toMatch(/^\d{6}/)
  })

  it('should handle real-world complex names and positions', () => {
    const testCases = [
      {
        name: 'María José García-López',
        position: 'Senior Full-Stack Engineer (React/Node.js)',
        expectedName: 'MaraJosGarcalpez',
        expectedPosition: 'SeniorFullstackEngineerReactnodejs',
      },
      {
        name: "O'Connor-Smith Jr.",
        position: 'VP of Engineering & Technology',
        expectedName: 'OconnorsmithJr',
        expectedPosition: 'VpOfEngineeringTechnology',
      },
      {
        name: 'Jean-Pierre Dubois',
        position: 'Lead DevOps/SRE Engineer',
        expectedName: 'JeanpierreDubois',
        expectedPosition: 'LeadDevopssreEngineer',
      },
    ]

    testCases.forEach(({ name, position, expectedName, expectedPosition }) => {
      const pdfFilename = generatePDFFilename(name, position, 'Resume')
      expect(pdfFilename).toContain(expectedPosition)
      expect(pdfFilename).toContain(expectedName)
      expect(pdfFilename).toBe(`${expectedPosition}-${expectedName}-Resume`)
    })
  })

  it('should generate valid filenames without problematic characters', () => {
    const name = 'Test@User#123'
    const position = 'Software/Engineer & Developer'

    const pdf = generatePDFFilename(name, position, 'Resume')
    const json = generateJSONFilename(name, position)

    // Should not contain special characters that are problematic in filenames
    const problematicChars = /[@#\/\\:*?"<>|]/
    expect(pdf).not.toMatch(problematicChars)
    expect(json).not.toMatch(problematicChars)
  })
})
