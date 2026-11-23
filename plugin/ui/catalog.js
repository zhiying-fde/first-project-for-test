/** Public SDK 1.1 method inventory. Names/signatures are checked against createPluginSdk. */
const item = (id, group, title, permission, example, parameters = null, note = '', paid = false) => ({ id, group, title, permission, example, parameters, note, paid })
const id = key => '$' + key
export const catalog = [
  item('describe', '基础与配置', '宿主能力清单', '', {}, [], '先确认当前实例实际获准的操作。'),
  item('identity.summary', '基础与配置', '当前账号摘要', 'identity.summary', {}, []),
  item('config.read', '基础与配置', '读取插件配置', 'config.read', {}, []),
  item('config.write', '基础与配置', '保存清单标题', 'config.write', { prefix: 'SDK 演示清单' }),
  item('files.pick', '文件与脚本', '原生选择输入文件', 'files.pick', {}, [], '只返回当前实例的授权引用，不暴露本机路径。'),
  item('files.read', '文件与脚本', '读取授权文件片段', 'files.read', { reference: id('fileId'), offset: 0, length: 128 }, ['reference', 'offset', 'length'], '先选择文件；最多读取64KiB。'),
  item('files.write', '文件与脚本', '保存脚本产物', 'files.write', { runId: id('runId'), name: 'summary.txt' }, ['runId', 'name'], '先运行process并等待完成，保存由原生对话框完成。'),
  item('scripts.start', '文件与脚本', '运行包内脚本', 'scripts.run', { scriptId: 'process', references: [] }, null, 'process生成清单；fixtures生成测试图片和音频；slow用于停止演示。'),
  item('scripts.status', '文件与脚本', '查询脚本状态', 'scripts.run', { runId: id('runId') }, ['runId']),
  item('scripts.logs', '文件与脚本', '分页读取脚本日志', 'scripts.run', { runId: id('runId'), cursor: 0 }, ['runId', 'cursor']),
  item('scripts.cancel', '文件与脚本', '停止脚本运行', 'scripts.run', { runId: id('runId') }, ['runId'], '仅对本插件真实在途运行使用。'),
  item('models.list', '模型与积分', '动态模型目录', 'models.read', {}, null, '可选kind=text/image/video；只使用返回的模型ID。'),
  item('credits.read', '模型与积分', '当前积分余额', 'credits.read', { refresh: false }),
  item('credits.history', '模型与积分', '积分流水', 'credits.read', { days: 1 }),
  item('credits.estimate', '模型与积分', '公共生成预估', 'credits.read', { kind: 'video', model: id('videoModel'), prompt: 'SDK基础视频演示', duration: 5, aspect_ratio: '16:9', resolution: '720P', mode: 'text_to_video', audio: false }),
  item('credits.estimateTask', '模型与积分', '既有任务规格预估', 'credits.read', { task_type: 'video_generation', model: id('videoModel'), duration: 5, resolution: '720P', ratio: '16:9' }),
  item('credits.estimateTokens', '模型与积分', '视频Token预估', 'credits.read', { task_type: 'video_generation', model: id('videoModel'), duration: 5, resolution: '720P', ratio: '16:9' }, null, '需要当前账号的视频Token面板权限。'),
  item('generation.text', '生成与向量', '文本生成', 'cloud.generate', { request_id: id('newRequestId'), model: id('textModel'), prompt: '请只回复：SDK联通成功。', max_tokens: 32 }, null, '先预估；request_id用于查询和幂等，不自动重发。', true),
  item('generation.image', '生成与向量', '图片生成', 'cloud.generate', { request_id: id('newRequestId'), model: id('imageModel'), prompt: '白色背景上的一个蓝色圆形，简洁图形，无文字。', resolution: '1K', aspect_ratio: '1:1', quality: 'low', count: 1 }, null, '成功受理后查询真实任务，不能把受理当作产物完成。', true),
  item('generation.video', '生成与向量', '视频生成', 'cloud.generate', { request_id: id('newRequestId'), model: id('videoModel'), prompt: '白色背景的蓝色小球缓慢滚动，固定镜头。', duration: 5, aspect_ratio: '16:9', resolution: '720P', mode: 'text_to_video', audio: false, references: [] }, null, '参数可编辑；以模型目录和平台校验为准。', true),
  item('generation.embeddings', '生成与向量', '文本向量化', 'cloud.embeddings', { model: 'default-embedding', input: 'SDK向量联通演示', dimensions: 1024, encoding_format: 'float' }, null, '沿现有模型代理与Runtime数据库绑定，不自行传凭据。', true),
  item('cloud.invoke', '生成与向量', '兼容聊天代理', 'cloud.chat', { operation: 'chat', input: { model: 'default-chat', max_tokens: 32, messages: [{ role: 'user', content: '请只回复：SDK联通成功。' }] } }, null, '旧chat接口，不能混入公共生成字段。', true),
  item('tasks.list', '任务与产物', '列出本人公共任务', 'cloud.tasks', { limit: 20 }),
  item('tasks.get', '任务与产物', '读取生成任务', 'cloud.tasks', { taskId: id('taskId') }, ['taskId']),
  item('tasks.poll', '任务与产物', '查询任务最新快照', 'cloud.tasks', { taskId: id('taskId') }, ['taskId']),
  item('tasks.request', '任务与产物', '按请求编号找任务', 'cloud.tasks', { requestId: id('requestId') }, ['requestId'], '提交结果未知时用原编号查询，不重发有费用请求。'),
  item('tasks.download', '任务与产物', '取得任务下载内容', 'cloud.tasks', { taskId: id('taskId') }, ['taskId'], '返回平台确认的结果地址或文本，不猜测地址。'),
  item('tasks.save', '任务与产物', '原生保存生成结果', 'cloud.tasks', { taskId: id('taskId') }, ['taskId'], '任务成功并产生持久产物后执行。'),
  item('tasks.cancel', '任务与产物', '取消本人生成任务', 'cloud.tasks', { taskId: id('taskId') }, ['taskId'], '先检查cancel_supported；取消等待不等于成功取消。'),
  item('materials.list', '素材与目录', '搜索与分页列出素材', 'materials.read', { page: 1, page_size: 20, keyword: '' }),
  item('materials.get', '素材与目录', '读取素材详情', 'materials.read', { materialId: id('materialId') }, ['materialId']),
  item('materials.contentUrl', '素材与目录', '取得素材读取地址', 'materials.read', { materialId: id('materialId'), variant: 'media' }, ['materialId', 'variant']),
  item('materials.upload', '素材与目录', '上传授权文件', 'materials.upload', { reference: id('fileId'), options: { async_process: true, library: true, organize: false } }, ['reference', 'options'], '先files.pick；上传真实引用，不传路径或Base64。'),
  item('materials.uploadOutput', '素材与目录', '上传脚本产物', 'materials.upload', { runId: id('runId'), name: 'sample.png', options: { async_process: false, library: true, organize: false } }, ['runId', 'name', 'options'], '先运行fixtures脚本并确认sample.png产物。'),
  item('materials.importUrl', '素材与目录', '导入公网素材直链', 'materials.write', { url: id('contentUrl'), name: 'SDK演示导入', organize: false }, null, '只导入有权使用的公网素材，拒绝任意页面URL。'),
  item('materials.uploadStatus', '素材与目录', '查询异步上传任务', 'materials.read', { taskId: id('uploadTaskId') }, ['taskId']),
  item('materials.retryUpload', '素材与目录', '重试失败上传', 'materials.write', { taskId: id('uploadTaskId') }, ['taskId'], '必须是本人已有失败任务；不会创建新上传。'),
  item('materials.update', '素材与目录', '修改测试素材信息', 'materials.write', { materialId: id('materialId'), patch: { name: 'SDK演示素材', tags: ['SDK演示'] } }, ['materialId', 'patch']),
  item('materials.remove', '素材与目录', '删除测试素材', 'materials.write', { materialId: id('materialId') }, ['materialId'], '会改变素材状态，仅选择可处置测试素材。'),
  item('materials.organize', '素材与目录', '按规则整理测试素材', 'materials.write', { materialId: id('materialId'), options: {} }, ['materialId', 'options'], '按现有规则更新素材分类与系统标签，会修改素材。', true),
  item('materials.saveResult', '素材与目录', '生成结果保存到素材库', 'materials.write', { task_id: id('taskId') }),
  item('materials.folders.list', '素材与目录', '列出可见文件夹', 'materials.read', {}, []),
  item('materials.folders.create', '素材与目录', '创建个人测试目录', 'materials.write', { name: 'SDK演示目录', parent_id: 'personal' }),
  item('materials.folders.rename', '素材与目录', '重命名测试目录', 'materials.write', { folderId: id('folderId'), patch: { name: 'SDK演示目录-已重命名' } }, ['folderId', 'patch']),
  item('materials.folders.move', '素材与目录', '移动测试素材到目录', 'materials.write', { materialId: id('materialId'), options: { folder_id: id('folderId') } }, ['materialId', 'options']),
  item('tools.list', '工具箱', '发现工具及Schema', 'tools.read', {}),
  item('tools.get', '工具箱', '读取工具具体输入输出', 'tools.read', { capabilityId: id('capabilityId') }, ['capabilityId']),
  item('tools.call', '工具箱', '按动态Schema调用工具', 'tools.invoke', { capabilityId: 'platform.estimate', input: { operation: 'estimate', payload: { task_type: 'image_generation', model: id('imageModel'), resolution: '1K', image_count: 1 } } }, ['capabilityId', 'input'], '先tools.get核对当前工具input_schema，再编辑input。', true),
  item('tools.status', '工具箱', '查询工具任务', 'tools.read', { jobId: id('jobId') }, ['jobId'])
]
export function exampleFor(entry, context = {}) {
  const replacements = { ...context, newRequestId: crypto.randomUUID() }
  return JSON.parse(JSON.stringify(entry.example), (_, value) => typeof value === 'string' && value.startsWith('$') ? replacements[value.slice(1)] ?? value : value)
}
export function argumentsFor(entry, input) {
  if (JSON.stringify(input).includes('"$')) throw new Error('示例仍含资源占位符，请先完成前置步骤或填写真实ID。')
  return entry.parameters ? entry.parameters.map(key => input[key]) : [input]
}
export function codeFor(entry, input) {
  const args = argumentsFor(entry, input).map(value => JSON.stringify(value, null, 2)).join(', ')
  return 'const result = await sdk.' + entry.id + '(' + args + ');\nconsole.log(result);'
}
