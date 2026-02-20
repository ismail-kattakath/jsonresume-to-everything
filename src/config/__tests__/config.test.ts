// @ts-nocheck
import { generateSiteMetadata } from '@/config/metadata'
import { SITE_URL } from '@/config/site'
import { navItems } from '@/config/navigation'
import { BACKGROUND_IMAGE_PATH, BACKGROUND_IMAGE_FILE_PATH } from '@/config/background'

describe('Config - Site', () => {
  it('should export SITE_URL constant', () => {
    expect(SITE_URL).toBe('https://ismail.kattakath.com')
  })

  it('should be a valid URL', () => {
    expect(() => new URL(SITE_URL)).not.toThrow()
  })
})

describe('Config - Navigation', () => {
  it('should export navigation items', () => {
    expect(navItems).toBeDefined()
    expect(Array.isArray(navItems)).toBe(true)
  })

  it('should have correct structure for nav items', () => {
    navItems.forEach((item) => {
      expect(item).toHaveProperty('name')
      expect(typeof item.name).toBe('string')
      // Item should have either href or submenu
      if (item.href) {
        expect(typeof item.href).toBe('string')
      } else if (item.submenu) {
        expect(Array.isArray(item.submenu)).toBe(true)
        item.submenu.forEach((subItem) => {
          expect(subItem).toHaveProperty('name')
          expect(subItem).toHaveProperty('href')
          expect(typeof subItem.name).toBe('string')
          expect(typeof subItem.href).toBe('string')
        })
      } else {
        fail('Nav item must have either href or submenu')
      }
    })
  })

  it('should include expected navigation items', () => {
    const expectedItems = ['About', 'Skills', 'Experience', 'Contact', 'Resume']
    const navNames = navItems.map((item) => item.name)

    expectedItems.forEach((expectedName) => {
      expect(navNames).toContain(expectedName)
    })
  })

  it('should have valid href values', () => {
    navItems.forEach((item) => {
      if (item.href) {
        // Should be either an anchor link or a path
        expect(item.href.startsWith('#') || item.href.startsWith('/')).toBe(true)
      }
      if (item.submenu) {
        item.submenu.forEach((subItem) => {
          expect(subItem.href.startsWith('#') || subItem.href.startsWith('/')).toBe(true)
        })
      }
    })
  })
})

describe('Config - Background', () => {
  it('should export background image paths', () => {
    expect(BACKGROUND_IMAGE_PATH).toBe('/images/background.jpg')
    expect(BACKGROUND_IMAGE_FILE_PATH).toBe('public/images/background.jpg')
  })

  it('should have correct path formats', () => {
    expect(BACKGROUND_IMAGE_PATH.startsWith('/')).toBe(true)
    expect(BACKGROUND_IMAGE_FILE_PATH.startsWith('public/')).toBe(true)
  })
})

describe('Config - Metadata', () => {
  it('should generate metadata object', () => {
    const metadata = generateSiteMetadata()
    expect(metadata).toBeDefined()
    expect(metadata).toHaveProperty('title')
    expect(metadata).toHaveProperty('description')
    expect(metadata).toHaveProperty('keywords')
  })

  it('should have metadataBase as URL object', () => {
    const metadata = generateSiteMetadata()
    expect(metadata.metadataBase).toBeInstanceOf(URL)
    expect(metadata.metadataBase?.toString()).toBe(`${SITE_URL}/`)
  })

  it('should generate title with template', () => {
    const metadata = generateSiteMetadata()
    expect(metadata.title).toHaveProperty('default')
    expect(metadata.title).toHaveProperty('template')
    expect(typeof metadata.title).toBe('object')
  })

  it('should generate description within valid length', () => {
    const metadata = generateSiteMetadata()
    const description = metadata.description as string

    // Should be between 55-200 characters for SEO
    expect(description.length).toBeGreaterThan(0)
    expect(description.length).toBeLessThanOrEqual(200)
  })

  it('should generate keywords string', () => {
    const metadata = generateSiteMetadata()
    expect(typeof metadata.keywords).toBe('string')
    expect(metadata.keywords).toBeTruthy()
  })

  it('should have authors array', () => {
    const metadata = generateSiteMetadata()
    expect(Array.isArray(metadata.authors)).toBe(true)
    expect(metadata.authors?.length).toBeGreaterThan(0)
  })

  it('should generate OpenGraph metadata', () => {
    const metadata = generateSiteMetadata()
    expect(metadata.openGraph).toBeDefined()
    expect(metadata.openGraph?.title).toBeTruthy()
    expect(metadata.openGraph?.description).toBeTruthy()
    expect(metadata.openGraph?.url).toBe(SITE_URL)
    expect(metadata.openGraph?.type).toBe('website')
    expect(metadata.openGraph?.locale).toBe('en_US')
  })

  it('should generate Twitter metadata', () => {
    const metadata = generateSiteMetadata()
    expect(metadata.twitter).toBeDefined()
    expect(metadata.twitter?.card).toBe('summary_large_image')
    expect(metadata.twitter?.title).toBeTruthy()
    expect(metadata.twitter?.description).toBeTruthy()
  })

  it('should generate robots metadata', () => {
    const metadata = generateSiteMetadata()
    expect(metadata.robots).toBeDefined()
    expect(metadata.robots?.index).toBe(true)
    expect(metadata.robots?.follow).toBe(true)
    expect(metadata.robots?.googleBot).toBeDefined()
  })

  it('should set googleBot metadata correctly', () => {
    const metadata = generateSiteMetadata()
    expect(metadata.robots?.googleBot?.index).toBe(true)
    expect(metadata.robots?.googleBot?.follow).toBe(true)
    expect(metadata.robots?.googleBot?.['max-video-preview']).toBe(-1)
    expect(metadata.robots?.googleBot?.['max-image-preview']).toBe('large')
    expect(metadata.robots?.googleBot?.['max-snippet']).toBe(-1)
  })
})
