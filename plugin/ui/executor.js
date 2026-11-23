import { catalog, argumentsFor } from './catalog.js'

export class DemoExecutor {
  constructor(sdk) { this.sdk = sdk; this.context = {}; this.history = []; this.quote = null }
  async estimate(method, input) {
    const kind = method.split('.')[1]
    if (!['text', 'image', 'video'].includes(kind)) throw new Error('此方法无同入口的通用预估，请核对平台收费说明。')
    const { request_id, ...payload } = input
    const result = await this.sdk.credits.estimate({ kind, ...payload })
    if (!Number.isFinite(result.estimated_credits)) throw new Error('平台未返回有效预估。')
    this.quote = { method, signature: JSON.stringify(input), result }
    return result
  }
  async run(method, input = {}, confirmed = false) {
    const entry = catalog.find(row => row.id === method)
    if (!entry) throw new Error('此方法不在当前SDK演示清单中。')
    if (entry.paid && !confirmed) throw new Error('请确认此操作的实际费用或副作用后再执行。')
    if (/^generation\.(text|image|video)$/.test(method) && (this.quote?.method !== method || this.quote.signature !== JSON.stringify(input))) throw new Error('请先预估当前输入，参数修改后需重新预估。')
    const args = argumentsFor(entry, input), parts = method.split('.'), name = parts.pop()
    const owner = parts.reduce((target, key) => target?.[key], this.sdk)
    if (typeof owner?.[name] !== 'function') throw new Error('当前宿主未提供此SDK方法。')
    const receipt = { method, startedAt: new Date().toISOString(), status: 'running' }
    this.history.push(receipt)
    // The original request identity stays in the editor after an unknown submit; never replay it.
    if (input.request_id) this.context.requestId = input.request_id
    try {
      const result = await owner[name](...args)
      receipt.status = 'passed'; receipt.finishedAt = new Date().toISOString()
      this.capture(method, result); return result
    } catch (error) {
      receipt.status = 'failed'; receipt.error = { code: error.code, message: error.message, requestId: error.requestId }
      throw error
    }
  }
  capture(method, value) {
    const c = this.context
    if (method === 'files.pick' && value.files?.length) { c.fileId = value.files[0].id; c.files = value.files }
    if (value.runId) { c.runId = value.runId; c.outputs = value.outputs || [] }
    if (value.task_id && (method.startsWith('generation.') || method.startsWith('tasks.'))) c.taskId = value.task_id
    if (value.request_id) c.requestId = value.request_id
    if (value.job_id) c.jobId = value.job_id
    if (method === 'materials.upload' && value.task_id) c.uploadTaskId = value.task_id
    const material = value.material || value
    if (method.startsWith('materials.') && material.id && material.type) c.materialId = material.id
    if (method === 'materials.contentUrl' && value.url) c.contentUrl = value.url
    if (method === 'materials.folders.create') c.folderId = value.id || value.folder?.id
    if (method === 'tools.list' && value.capabilities?.length) c.capabilityId = (value.capabilities.find(row => row.id === 'platform.estimate') || value.capabilities[0]).id
    if (method === 'models.list') {
      c.models = value.models
      for (const [kind, mode] of [['text','text_generation'],['image','text_to_image'],['video','text_to_video']]) {
        const found = value.models.find(row => row.kind === kind && row.modes?.includes(mode))
        if (found) c[kind + 'Model'] = found.id
      }
    }
  }
}
