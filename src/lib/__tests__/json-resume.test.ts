import { convertToJSONResume, convertFromJSONResume } from '@/lib/jsonResume'
import type { ResumeData, JSONResume } from '@/types'

// Mock the modules that jsonResume depends on
jest.mock('@/lib/resumeAdapter', () => ({
  __esModule: true,
  default: {
    name: 'Default User',
    position: 'Developer',
    contactInformation: '555-1234',
    email: 'default@example.com',
    address: '100 Main St, Ottawa, ON K1A 0A1',
    profilePicture: '',
    socialMedia: [],
    summary: 'Default summary',
    education: [],
    workExperience: [],
    skills: [],
    languages: [],
    certifications: [],
  },
}))

jest.mock('@/lib/jsonResumeSchema', () => ({
  validateJSONResume: jest.fn(() => ({ valid: true, errors: [] })),
}))

jest.mock('@/lib/utils/urlHelpers', () => ({
  ensureProtocol: jest.fn((url: string) => {
    if (!url) return url
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `https://${url}`
  }),
}))

const makeResumeData = (overrides: Partial<ResumeData> = {}): ResumeData => ({
  name: 'Jane Doe',
  position: 'Senior Engineer',
  contactInformation: '555-0000',
  email: 'jane@example.com',
  address: '123 Elm St, Ottawa, ON K1P 5M7',
  profilePicture: 'https://example.com/photo.jpg',
  summary: 'Experienced engineer.',
  socialMedia: [
    { socialMedia: 'LinkedIn', link: 'linkedin.com/in/janedoe' },
    { socialMedia: 'Github', link: 'github.com/janedoe' },
    { socialMedia: 'Website', link: 'janedoe.dev' },
  ],
  workExperience: [
    {
      organization: 'Acme Corp',
      position: 'Lead Engineer',
      url: 'acme.com',
      description: 'Built stuff',
      startYear: '2018-01-01',
      endYear: 'Present',
      keyAchievements: [{ text: 'Led team of 5' }, { text: 'Reduced costs by 20%' }],
      technologies: ['TypeScript', 'React'],
    },
    {
      organization: 'Beta Inc',
      position: 'Junior Dev',
      url: '',
      description: 'Learned stuff',
      startYear: '2015-01-01',
      endYear: '2017-12-31',
      keyAchievements: [],
      technologies: [],
    },
  ],
  education: [
    {
      school: 'Tech University',
      url: 'techuniversity.edu',
      studyType: 'Bachelor',
      area: 'Computer Science',
      startYear: '2011',
      endYear: '2015',
    },
    {
      school: 'Online Academy',
      url: '',
      studyType: 'Certificate',
      area: 'Machine Learning',
      startYear: '2020',
      endYear: '2021',
    },
  ],
  skills: [
    { title: 'Frontend', skills: [{ text: 'React' }, { text: 'TypeScript' }] },
    { title: 'Backend', skills: [{ text: 'Node.js' }] },
  ],
  languages: ['English', 'French'],
  certifications: [
    { name: 'AWS Certified', date: '2022-01-01', issuer: 'Amazon', url: 'aws.amazon.com/cert' },
    { name: 'No-URL Cert', date: '2023-01-01', issuer: 'SomeOrg', url: '' },
    { name: 'Whitespace Cert', date: '2023-06-01', issuer: 'SomeOrg', url: '   ' },
  ],
  projects: [
    {
      name: 'My Project',
      description: 'A cool project',
      link: 'github.com/proj',
      keyAchievements: [{ text: 'Shipped v1' }],
      keywords: ['TypeScript'],
      startYear: '2022',
      endYear: '2023',
    },
    {
      name: 'No-Link Project',
      description: 'Another project',
      link: '',
      keyAchievements: [],
      keywords: [],
      startYear: '2021',
      endYear: '2022',
    },
  ],
  ...overrides,
})

describe('convertToJSONResume', () => {
  it('converts a full ResumeData to JSON Resume format', () => {
    const result = convertToJSONResume(makeResumeData())
    expect(result.$schema).toContain('jsonresume/resume-schema')
    expect(result.basics.name).toBe('Jane Doe')
    expect(result.basics.email).toBe('jane@example.com')
    expect(result.basics.label).toBe('Senior Engineer')
    expect(result.basics.summary).toBe('Experienced engineer.')
  })

  it('uses default resumeAdapter when no data is provided', () => {
    const result = convertToJSONResume()
    expect(result.basics.name).toBe('Default User')
  })

  it('parses LinkedIn profile correctly (removes prefix)', () => {
    const result = convertToJSONResume(makeResumeData())
    const linkedin = result.basics.profiles!.find((p) => p.network === 'LinkedIn')
    expect(linkedin?.username).toBe('janedoe')
  })

  it('parses Github profile correctly (removes prefix)', () => {
    const result = convertToJSONResume(makeResumeData())
    const github = result.basics.profiles!.find((p) => p.network === 'Github')
    expect(github?.username).toBe('janedoe')
  })

  it('returns empty username for unknown social media', () => {
    const data = makeResumeData({
      socialMedia: [{ socialMedia: 'Twitter', link: 'twitter.com/jane' }],
    })
    const result = convertToJSONResume(data)
    expect(result.basics.profiles![0]!.username).toBe('')
  })

  it('maps work experience correctly', () => {
    const result = convertToJSONResume(makeResumeData())
    expect(result.work).toHaveLength(2)
    expect(result.work![0]!.name).toBe('Acme Corp')
    expect(result.work![0]!.highlights).toEqual(['Led team of 5', 'Reduced costs by 20%'])
    expect(result.work![0]!.keywords).toEqual(['TypeScript', 'React'])
  })

  it('handles workExperience "Present" endDate', () => {
    const result = convertToJSONResume(makeResumeData())
    expect(result.work![0]!.endDate).toBe('')
  })

  it('handles non-Present endDate in workExperience', () => {
    const result = convertToJSONResume(makeResumeData())
    expect(result.work![1]!.endDate).toBe('2017-12-31')
  })

  it('omits url in work when empty', () => {
    const result = convertToJSONResume(makeResumeData())
    // Beta Inc has empty url -- url should be undefined
    expect(result.work![1]!.url).toBeUndefined()
  })

  it('maps education correctly', () => {
    const result = convertToJSONResume(makeResumeData())
    expect(result.education).toHaveLength(2)
    expect(result.education![0]!.institution).toBe('Tech University')
    expect(result.education![0]!.area).toBe('Computer Science')
  })

  it('omits url in education when empty', () => {
    const result = convertToJSONResume(makeResumeData())
    expect(result.education![1]!.url).toBeUndefined()
  })

  it('maps skills correctly', () => {
    const result = convertToJSONResume(makeResumeData())
    expect(result.skills).toHaveLength(2)
    expect(result.skills![0]!.name).toBe('Frontend')
    expect(result.skills![0]!.keywords).toEqual(['React', 'TypeScript'])
  })

  it('maps languages correctly', () => {
    const result = convertToJSONResume(makeResumeData())
    expect(result.languages).toEqual([
      { language: 'English', fluency: 'Native speaker' },
      { language: 'French', fluency: 'Native speaker' },
    ])
  })

  it('includes cert url when present', () => {
    const result = convertToJSONResume(makeResumeData())
    const cert = result.certificates![0]!
    expect(cert.url).toBeDefined()
  })

  it('omits cert url when empty', () => {
    const result = convertToJSONResume(makeResumeData())
    const noUrlCert = result.certificates![1]!
    expect(noUrlCert.url).toBeUndefined()
  })

  it('omits cert url when whitespace only', () => {
    const result = convertToJSONResume(makeResumeData())
    const wsUrlCert = result.certificates![2]!
    expect(wsUrlCert.url).toBeUndefined()
  })

  it('maps projects correctly', () => {
    const result = convertToJSONResume(makeResumeData())
    expect(result.projects).toHaveLength(2)
    expect(result.projects![0]!.name).toBe('My Project')
    expect(result.projects![0]!.highlights).toEqual(['Shipped v1'])
    expect(result.projects![0]!.keywords).toEqual(['TypeScript'])
  })

  it('omits project url when empty link', () => {
    const result = convertToJSONResume(makeResumeData())
    expect(result.projects![1]!.url).toBeUndefined()
  })

  it('parses address parts correctly', () => {
    const result = convertToJSONResume(makeResumeData())
    expect(result.basics.location!.address).toBe('123 Elm St')
    expect(result.basics.location!.city).toBe('Ottawa')
    expect(result.basics.location!.countryCode).toBe('CA')
  })

  it('handles empty address gracefully', () => {
    const result = convertToJSONResume(makeResumeData({ address: '' }))
    expect(result.basics.location!.address).toBe('')
    expect(result.basics.location!.city).toBe('')
  })

  it('handles undefined projects (empty array)', () => {
    const data = makeResumeData({ projects: undefined })
    const result = convertToJSONResume(data)
    expect(result.projects).toEqual([])
  })

  it('handles undefined certifications (empty array)', () => {
    const data = makeResumeData({ certifications: undefined as unknown as [] })
    const result = convertToJSONResume(data)
    expect(result.certificates).toEqual([])
  })

  it('has correct static top-level structure', () => {
    const result = convertToJSONResume(makeResumeData())
    expect(result.volunteer).toEqual([])
    expect(result.awards).toEqual([])
    expect(result.publications).toEqual([])
    expect(result.interests).toEqual([])
    expect(result.references).toEqual([])
  })
})

describe('convertFromJSONResume', () => {
  const { validateJSONResume } = jest.requireMock('@/lib/jsonResumeSchema')

  const makeJSONResume = (overrides: Partial<JSONResume> = {}): JSONResume => ({
    $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
    basics: {
      name: 'John Smith',
      label: 'Engineer',
      image: 'https://example.com/img.jpg',
      email: 'john@example.com',
      phone: '555-9999',
      summary: 'Great engineer',
      url: 'https://johnsmith.dev',
      location: {
        address: '456 Oak Ave',
        city: 'Toronto',
        region: 'ON',
        postalCode: 'M5V 1A1',
        countryCode: 'CA',
      },
      profiles: [
        { network: 'LinkedIn', username: 'jsmith', url: 'https://linkedin.com/in/jsmith' },
        { network: 'Github', username: 'jsmith', url: 'https://github.com/jsmith' },
      ],
    },
    work: [
      {
        name: 'TechCorp',
        position: 'Engineer',
        url: 'https://techcorp.com',
        startDate: '2019-01-01',
        endDate: '2022-12-31',
        summary: 'Built things',
        highlights: ['Did X', 'Did Y'],
        keywords: ['Go', 'Python'],
      },
    ],
    education: [
      {
        institution: 'State University',
        url: 'https://stateuniversity.edu',
        area: 'CS',
        studyType: 'BSc',
        startDate: '2015',
        endDate: '2019',
      },
    ],
    skills: [{ name: 'Languages', level: 'Expert', keywords: ['Rust', 'Go'] }],
    languages: [{ language: 'English', fluency: 'Native' }],
    certificates: [{ name: 'GCP Pro', date: '2021-01-01', issuer: 'Google', url: 'https://cloud.google.com/cert' }],
    projects: [
      {
        name: 'OSS Project',
        description: 'An open source project',
        highlights: ['First feature'],
        keywords: ['Rust'],
        startDate: '2020',
        endDate: '2021',
        url: 'https://github.com/oss',
      },
    ],
    ...overrides,
  })

  it('converts a full JSON Resume to ResumeData', () => {
    const result = convertFromJSONResume(makeJSONResume())
    expect(result).not.toBeNull()
    expect(result!.name).toBe('John Smith')
    expect(result!.email).toBe('john@example.com')
    expect(result!.position).toBe('Engineer')
  })

  it('returns null when validation fails', () => {
    validateJSONResume.mockReturnValueOnce({ valid: false, errors: ['Missing field'] })
    const result = convertFromJSONResume(makeJSONResume())
    expect(result).toBeNull()
  })

  it('includes website from basics.url at start of socialMedia', () => {
    const result = convertFromJSONResume(makeJSONResume())
    expect(result!.socialMedia![0]!.socialMedia).toBe('Website')
    expect(result!.socialMedia![0]!.link).toBe('johnsmith.dev')
  })

  it('does not add website when no basics.url', () => {
    const jr = makeJSONResume()
    delete (jr.basics as Record<string, unknown>)['url']
    const result = convertFromJSONResume(jr)
    expect(result!.socialMedia!.find((s) => s.socialMedia === 'Website')).toBeUndefined()
  })

  it('converts profiles to socialMedia correctly', () => {
    const result = convertFromJSONResume(makeJSONResume())
    const linkedin = result!.socialMedia!.find((s) => s.socialMedia === 'LinkedIn')
    expect(linkedin?.link).toBe('linkedin.com/in/jsmith')
  })

  it('handles missing profiles gracefully', () => {
    const jr = makeJSONResume()
    ;(jr.basics as Record<string, unknown>)['profiles'] = undefined
    const result = convertFromJSONResume(jr)
    expect(result!.socialMedia!).toBeDefined()
  })

  it('converts work experience correctly', () => {
    const result = convertFromJSONResume(makeJSONResume())
    expect(result!.workExperience!).toHaveLength(1)
    expect(result!.workExperience![0]!.organization).toBe('TechCorp')
    expect(result!.workExperience![0]!.keyAchievements).toEqual([{ text: 'Did X' }, { text: 'Did Y' }])
    expect(result!.workExperience![0]!.technologies).toEqual(['Go', 'Python'])
  })

  it('uses Present for empty endDate in workExperience', () => {
    const jr = makeJSONResume()
    jr.work![0]!.endDate = ''
    const result = convertFromJSONResume(jr)
    expect(result!.workExperience![0]!.endYear).toBe('Present')
  })

  it('handles missing work array', () => {
    const result = convertFromJSONResume(makeJSONResume({ work: undefined }))
    expect(result!.workExperience!).toEqual([])
  })

  it('converts education correctly', () => {
    const result = convertFromJSONResume(makeJSONResume())
    expect(result!.education!).toHaveLength(1)
    expect(result!.education![0]!.school).toBe('State University')
    expect(result!.education![0]!.area).toBe('CS')
  })

  it('handles missing education url', () => {
    const jr = makeJSONResume()
    delete (jr.education![0] as Record<string, unknown>)['url']
    const result = convertFromJSONResume(jr)
    expect(result!.education![0]!.url).toBe('')
  })

  it('converts skills correctly', () => {
    const result = convertFromJSONResume(makeJSONResume())
    expect(result!.skills!).toHaveLength(1)
    expect(result!.skills![0]!.title).toBe('Languages')
    expect(result!.skills![0]!.skills).toEqual([{ text: 'Rust' }, { text: 'Go' }])
  })

  it('returns default skill group when skills is empty', () => {
    const result = convertFromJSONResume(makeJSONResume({ skills: [] }))
    expect(result!.skills!).toEqual([{ title: 'Skills', skills: [] }])
  })

  it('converts language strings correctly', () => {
    const jr = makeJSONResume({ languages: ['French', 'Spanish'] as unknown as JSONResume['languages'] })
    const result = convertFromJSONResume(jr)
    expect(result!.languages).toEqual(['French', 'Spanish'])
  })

  it('converts language objects correctly', () => {
    const result = convertFromJSONResume(makeJSONResume())
    expect(result!.languages).toEqual(['English'])
  })

  it('converts certifications correctly', () => {
    const result = convertFromJSONResume(makeJSONResume())
    expect(result!.certifications!).toHaveLength(1)
    expect(result!.certifications![0]!.name).toBe('GCP Pro')
    expect(result!.certifications![0]!.url).toBe('https://cloud.google.com/cert')
  })

  it('handles missing certificates', () => {
    const result = convertFromJSONResume(makeJSONResume({ certificates: undefined }))
    expect(result!.certifications!).toEqual([])
  })

  it('converts projects correctly', () => {
    const result = convertFromJSONResume(makeJSONResume())
    expect(result!.projects!).toHaveLength(1)
    expect(result!.projects![0]!.name).toBe('OSS Project')
    expect(result!.projects![0]!.keyAchievements).toEqual([{ text: 'First feature' }])
  })

  it('handles missing projects', () => {
    const result = convertFromJSONResume(makeJSONResume({ projects: undefined }))
    expect(result!.projects!).toBeUndefined()
  })

  it('handles missing project keywords and highlights', () => {
    const jr = makeJSONResume()
    delete (jr.projects![0] as Record<string, unknown>)['keywords']
    delete (jr.projects![0] as Record<string, unknown>)['highlights']
    const result = convertFromJSONResume(jr)
    expect(result!.projects?.[0]?.keywords).toEqual([])
    expect(result!.projects?.[0]?.keyAchievements).toEqual([])
  })

  it('constructs address from location parts', () => {
    const result = convertFromJSONResume(makeJSONResume())
    expect(result!.address).toContain('456 Oak Ave')
    expect(result!.address).toContain('Toronto')
  })

  it('handles empty location gracefully', () => {
    const jr = makeJSONResume()
    ;(jr.basics as Record<string, unknown>)['location'] = {}
    const result = convertFromJSONResume(jr)
    expect(result!.address).toBe('')
  })

  it('handles missing basics gracefully', () => {
    const jr = makeJSONResume()
    ;(jr as Record<string, unknown>)['basics'] = {}
    const result = convertFromJSONResume(jr)
    expect(result!.name).toBe('')
    expect(result!.email).toBe('')
  })

  it('returns null when an exception is thrown', () => {
    validateJSONResume.mockImplementationOnce(() => {
      throw new Error('Unexpected error')
    })
    const result = convertFromJSONResume(makeJSONResume())
    expect(result).toBeNull()
  })
})
