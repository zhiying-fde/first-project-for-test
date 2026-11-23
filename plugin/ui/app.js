import { catalog, exampleFor, codeFor } from './catalog.js'
import { DemoExecutor } from './executor.js'
const $ = id => document.getElementById(id)
const sdk = window.aigvPlugin
const executor = new DemoExecutor(sdk)
let selected = catalog[0], group = '全部能力', busy = false
const json = value => JSON.stringify(value, null, 2)
function refreshRecords() {
  $('context').textContent = json(executor.context)
  $('history').textContent = json(executor.history)
  renderList()
}
function renderList() {
  const query = $('search').value.trim().toLowerCase()
  const rows = catalog.filter(row => (group === '全部能力' || row.group === group) && (row.id + row.title + row.note).toLowerCase().includes(query))
  $('count').textContent = rows.length + ' / ' + catalog.length + ' 项'
  $('methods').replaceChildren(...rows.map(row => {
    const button = document.createElement('button')
    button.className = row === selected ? 'active' : ''
    const receipt = executor.history.findLast(item => item.method === row.id)
    const title = document.createElement('strong'); title.textContent = row.title
    const name = document.createElement('code'); name.textContent = row.id
    const state = document.createElement('small'); state.textContent = receipt ? ({ passed: '✓ 已返回', failed: '调用失败', running: '执行中' }[receipt.status]) : '未执行'
    button.append(title, name, state); button.onclick = () => { if (!busy) select(row) }
    return button
  }))
}
function updateCode() {
  try { $('code').textContent = codeFor(selected, JSON.parse($('input').value)) }
  catch (error) { $('code').textContent = '// ' + error.message }
}
function select(row) {
  selected = row
  $('category').textContent = row.group; $('methodTitle').textContent = row.title
  $('methodName').textContent = 'sdk.' + row.id; $('permission').textContent = row.permission || '无需额外权限'
  $('note').textContent = row.note || '使用当前宿主与账号执行，实际返回展示在下方。'
  $('input').value = json(exampleFor(row, executor.context)); $('consent').checked = false
  $('consentRow').hidden = !row.paid
  $('estimate').hidden = !/^generation\.(text|image|video)$/.test(row.id)
  $('quote').textContent = ''; $('status').textContent = ''; $('result').textContent = '尚未执行此项演示。'
  updateCode(); renderList()
}
async function perform(action) {
  if (busy) return
  busy = true; $('execute').disabled = true; $('estimate').disabled = true; $('status').textContent = '正在调用宿主…'
  try { const result = await action(); $('result').textContent = json(result); $('status').textContent = '宿主已返回；异步任务请继续查询状态。'; return result }
  catch (error) { $('status').textContent = error.message; $('result').textContent = json({ code: error.code, message: error.message, requestId: error.requestId }) }
  finally { busy = false; $('execute').disabled = !sdk; $('estimate').disabled = false; refreshRecords() }
}
$('search').oninput = renderList
for (const name of ['全部能力', ...new Set(catalog.map(row => row.group))]) {
  const button = document.createElement('button'); button.textContent = name
  button.onclick = () => { group = name; $('groupTitle').textContent = name; renderList() }
  $('groups').append(button)
}
$('example').onclick = () => select(selected)
$('input').oninput = () => { $('quote').textContent = ''; updateCode() }
$('estimate').onclick = () => perform(async () => { const value = await executor.estimate(selected.id, JSON.parse($('input').value)); $('quote').textContent = '平台预估 ' + value.estimated_credits + ' 积分'; return value })
$('execute').onclick = () => perform(() => executor.run(selected.id, JSON.parse($('input').value), $('consent').checked))
$('copy').onclick = () => perform(async () => { await navigator.clipboard.writeText($('result').textContent); return { copied: true } })
// A plugin-local controller also enables reproducible native acceptance through the same public SDK.
window.sdkDemo = { catalog, executor, select: id => select(catalog.find(row => row.id === id)), example: id => exampleFor(catalog.find(row => row.id === id), executor.context), run: (...args) => executor.run(...args).finally(refreshRecords), estimate: (...args) => executor.estimate(...args) }
select(selected)
if (!sdk) { $('hostState').textContent = '请在智影桌面端加载此插件'; $('execute').disabled = true }
else sdk.describe().then(result => { $('hostState').textContent = '宿主已连接 · SDK ' + (result.sdkVersion || '1.1'); $('result').textContent = json(result) }).catch(error => { $('hostState').textContent = error.message })
