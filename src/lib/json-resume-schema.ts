/**
 * JSON Resume Schema Validator
 * Uses the official JSON Resume schema v1.0.0
 * Schema source: https://jsonresume.org/schema/
 */

import Ajv from 'ajv'
import addFormats from 'ajv-formats'

// Official JSON Resume Schema v1.0.0
// Source: https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json
const jsonResumeSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'Resume Schema',
  type: 'object',
  additionalProperties: true,
  properties: {
    basics: {
      type: 'object',
      additionalProperties: true,
      properties: {
        name: { type: 'string' },
        label: { type: 'string' },
        image: { type: 'string' },
        email: { type: 'string', format: 'email' },
        phone: { type: 'string' },
        url: { type: 'string', format: 'uri' },
        summary: { type: 'string' },
        location: {
          type: 'object',
          additionalProperties: true,
          properties: {
            address: { type: 'string' },
            postalCode: { type: 'string' },
            city: { type: 'string' },
            countryCode: { type: 'string' },
            region: { type: 'string' },
          },
        },
        profiles: {
          type: 'array',
          additionalItems: true,
          items: {
            type: 'object',
            additionalProperties: true,
            properties: {
              network: { type: 'string' },
              username: { type: 'string' },
              url: { type: 'string' },
            },
          },
        },
      },
    },
    work: {
      type: 'array',
      additionalItems: true,
      items: {
        type: 'object',
        additionalProperties: true,
        properties: {
          name: { type: 'string' },
          position: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          summary: { type: 'string' },
          highlights: { type: 'array', items: { type: 'string' } },
          keywords: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    volunteer: {
      type: 'array',
      additionalItems: true,
      items: {
        type: 'object',
        additionalProperties: true,
        properties: {
          organization: { type: 'string' },
          position: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          summary: { type: 'string' },
          highlights: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    education: {
      type: 'array',
      additionalItems: true,
      items: {
        type: 'object',
        additionalProperties: true,
        properties: {
          institution: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          area: { type: 'string' },
          studyType: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          score: { type: 'string' },
          courses: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    awards: {
      type: 'array',
      additionalItems: true,
      items: {
        type: 'object',
        additionalProperties: true,
        properties: {
          title: { type: 'string' },
          date: { type: 'string' },
          awarder: { type: 'string' },
          summary: { type: 'string' },
        },
      },
    },
    certificates: {
      type: 'array',
      additionalItems: true,
      items: {
        type: 'object',
        additionalProperties: true,
        properties: {
          name: { type: 'string' },
          date: { type: 'string' },
          issuer: { type: 'string' },
          url: { type: 'string', format: 'uri' },
        },
      },
    },
    publications: {
      type: 'array',
      additionalItems: true,
      items: {
        type: 'object',
        additionalProperties: true,
        properties: {
          name: { type: 'string' },
          publisher: { type: 'string' },
          releaseDate: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          summary: { type: 'string' },
        },
      },
    },
    skills: {
      type: 'array',
      additionalItems: true,
      items: {
        type: 'object',
        additionalProperties: true,
        properties: {
          name: { type: 'string' },
          level: { type: 'string' },
          keywords: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    languages: {
      type: 'array',
      additionalItems: true,
      items: {
        type: 'object',
        additionalProperties: true,
        properties: {
          language: { type: 'string' },
          fluency: { type: 'string' },
        },
      },
    },
    interests: {
      type: 'array',
      additionalItems: true,
      items: {
        type: 'object',
        additionalProperties: true,
        properties: {
          name: { type: 'string' },
          keywords: { type: 'array', items: { type: 'string' } },
        },
      },
    },
    references: {
      type: 'array',
      additionalItems: true,
      items: {
        type: 'object',
        additionalProperties: true,
        properties: {
          name: { type: 'string' },
          reference: { type: 'string' },
        },
      },
    },
    projects: {
      type: 'array',
      additionalItems: true,
      items: {
        type: 'object',
        additionalProperties: true,
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          highlights: { type: 'array', items: { type: 'string' } },
          keywords: { type: 'array', items: { type: 'string' } },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          url: { type: 'string', format: 'uri' },
          roles: { type: 'array', items: { type: 'string' } },
          entity: { type: 'string' },
          type: { type: 'string' },
        },
      },
    },
    meta: {
      type: 'object',
      additionalProperties: true,
      properties: {
        canonical: { type: 'string', format: 'uri' },
        version: { type: 'string' },
        lastModified: { type: 'string' },
      },
    },
  },
}

// Create AJV instance with formats support
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false, // Allow additional properties
})
addFormats(ajv)

// Compile the schema once
const validateSchema = ajv.compile(jsonResumeSchema)

/**
 * Validates data against JSON Resume schema v1.0.0
 * Returns validation result with detailed errors
 */
export function validateJSONResume(data: unknown): {
  valid: boolean
  errors: string[]
} {
  const valid = validateSchema(data)

  if (!valid && validateSchema.errors) {
    const errors = validateSchema.errors.map((error) => {
      const path = error.instancePath || 'root'
      const message = error.message || 'validation failed'
      return `${path}: ${message}`
    })
    return { valid: false, errors }
  }

  return { valid: true, errors: [] }
}
