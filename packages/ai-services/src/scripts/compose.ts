#!/usr/bin/env tsx
/**
 * Composition script - generate poetry from data
 * Run with: pnpm run compose
 */
import { PoetryService } from '../services/poetry'

async function main() {
  console.log('\n🎵 CONFLUENCE COMPOSITION 🎵\n')
  console.log('Transforming data into verse...\n')

  const poetry = new PoetryService()

  // Example: compose from a pattern
  const poem = await poetry.compose({
    theme: 'The harmony of systems',
    pattern: 'cyclical growth with periodic convergence',
    dataValues: [0.3, 0.45, 0.62, 0.71, 0.68, 0.55, 0.41],
  })

  console.log(poem)
  console.log('\n---\n')

  // Generate a haiku
  console.log('And a haiku:\n')
  const haiku = await poetry.haiku(
    'Data flows like rivers, merging into harmony, patterns emerge whole'
  )
  console.log(haiku)
  console.log()
}

main().catch(console.error)
