import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Mock fs and console
jest.mock('fs')
let mockLog, mockWarn, mockError, mockExit

describe('downloadResume', () => {
  let downloadResume

  beforeAll(async () => {
    const module = await import('../download-resume-json.mjs')
    downloadResume = module.downloadResume
  })

  beforeEach(() => {
    jest.clearAllMocks()
    delete process.env.RESUME_JSON_GIST

    mockLog = jest.spyOn(console, 'log').mockImplementation(() => {})
    mockWarn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    mockError = jest.spyOn(console, 'error').mockImplementation(() => {})
    mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
  })

  afterEach(() => {
    mockLog.mockRestore()
    mockWarn.mockRestore()
    mockError.mockRestore()
    mockExit.mockRestore()
  })

  it('should skip download if RESUME_JSON_GIST is missing', async () => {
    fs.existsSync.mockReturnValue(true)
    await downloadResume()
    expect(mockWarn).toHaveBeenCalledWith(expect.stringContaining('RESUME_JSON_GIST is not defined'))
    expect(mockLog).not.toHaveBeenCalledWith(expect.stringContaining('Downloading resume'))
  })

  it('should log error if RESUME_JSON_GIST is missing and file does not exist', async () => {
    fs.existsSync.mockReturnValue(false)
    await downloadResume()
    expect(mockError).toHaveBeenCalledWith(expect.stringContaining('src/data/resume.json does not exist'))
  })

  it('should download and save resume if RESUME_JSON_GIST is present', async () => {
    process.env.RESUME_JSON_GIST = 'https://example.com/resume.json'
    const mockData = { name: 'Test' }

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockData),
    })

    fs.existsSync.mockReturnValue(true)

    await downloadResume()

    expect(mockLog).toHaveBeenCalledWith(
      expect.stringContaining('Downloading resume from https://example.com/resume.json')
    )
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('resume.json'),
      JSON.stringify(mockData, null, 2)
    )
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('Successfully downloaded'))
  })

  it('should handle fetch errors', async () => {
    process.env.RESUME_JSON_GIST = 'https://example.com/resume.json'

    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
    })

    await downloadResume()

    expect(mockError).toHaveBeenCalledWith(
      expect.stringContaining('Error downloading resume:'),
      expect.stringContaining('Failed to fetch resume: Not Found')
    )
    expect(mockExit).toHaveBeenCalledWith(1)
  })
})
