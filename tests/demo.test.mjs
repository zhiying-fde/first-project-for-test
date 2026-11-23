import test from 'node:test'
import assert from 'node:assert/strict'
import { catalog, argumentsFor } from '../plugin/ui/catalog.js'
import { DemoExecutor } from '../plugin/ui/executor.js'
test('demo preserves positional arguments and rejects unresolved resource IDs', () => {
  const row = catalog.find(row => row.id === 'files.read')
  assert.deepEqual(argumentsFor(row, { reference: 'owned-reference', offset: 3, length: 8 }), ['owned-reference', 3, 8])
  assert.throws(() => argumentsFor(row, row.example), /占位符/)
})
test('paid generation needs matching quote and consent; errors are not replayed', async () => {
  let calls = 0
  const executor = new DemoExecutor({ credits: { estimate: async () => ({ estimated_credits: 2 }) }, generation: { text: async () => { calls++; throw new Error('unknown submit') } } })
  const input = { request_id: 'real-request-id', model: 'catalog-model', prompt: 'hello' }
  await assert.rejects(executor.run('generation.text', input), /确认/)
  await assert.rejects(executor.run('generation.text', input, true), /预估/)
  await executor.estimate('generation.text', input)
  await assert.rejects(executor.run('generation.text', { ...input, prompt: 'changed' }, true), /预估/)
  await assert.rejects(executor.run('generation.text', input, true), /unknown submit/)
  assert.equal(calls, 1); assert.equal(executor.context.requestId, input.request_id)
  assert.equal(executor.history[0].status, 'failed')
})
