#!/usr/bin/env node

/**
 * Script to generate bcrypt password hash for edit page protection
 *
 * Usage:
 *   node scripts/generate-password-hash.js
 *   node scripts/generate-password-hash.js "your-password-here"
 */

import bcrypt from 'bcryptjs'
import readline from 'readline'

const SALT_ROUNDS = 10

async function generateHash(password) {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS)
    console.log('\n✅ Password hash generated successfully!\n')
    console.log('━'.repeat(80))
    console.log('Hash:', hash)
    console.log('━'.repeat(80))
    console.log('\n📝 Next steps:\n')
    console.log('1. Go to your GitHub repository settings')
    console.log('2. Navigate to: Settings → Secrets and variables → Actions')
    console.log('3. Click "New repository secret"')
    console.log('4. Name: NEXT_PUBLIC_EDIT_PASSWORD_HASH')
    console.log('5. Value: Paste the hash above')
    console.log('6. Click "Add secret"\n')
    console.log('⚠️  WARNING: Keep this hash secret! Anyone with it can generate valid passwords.\n')
    return hash
  } catch (error) {
    console.error('❌ Error generating hash:', error)
    process.exit(1)
  }
}

async function promptForPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question('Enter password to hash (or press Ctrl+C to cancel): ', (password) => {
      rl.close()
      if (!password || password.trim().length === 0) {
        console.error('❌ Password cannot be empty')
        process.exit(1)
      }
      if (password.length < 8) {
        console.warn('\n⚠️  WARNING: Password is shorter than 8 characters. Consider using a longer password.\n')
      }
      resolve(password)
    })
  })
}

async function main() {
  console.log('🔐 Password Hash Generator for Edit Page Protection\n')

  // Check if password provided as argument
  const password = process.argv[2]

  if (password) {
    if (password.length < 8) {
      console.warn('⚠️  WARNING: Password is shorter than 8 characters. Consider using a longer password.\n')
    }
    await generateHash(password)
  } else {
    // Prompt for password
    const enteredPassword = await promptForPassword()
    await generateHash(enteredPassword)
  }
}

main()
