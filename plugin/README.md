# 演示插件

在智影桌面端安装后打开「演示插件」。左侧按职责分组列出 SDK 1.1 的全部 49 个公开方法；选择方法，查看前置条件、权限、可编辑 JSON 和 JavaScript 示例，点击执行查看真实宿主返回。普通浏览器只展示清单，不能调用宿主。

目录及插件 ID `aigv.material-processor` 保持兼容。`config.prefix`、`scripts.process` 的清单产物保持原行为。示例不是自动批量调用程序，打开页面不会发起收费生成。

## 基础演示顺序

1. `describe`、`identity.summary`、`config.read/write` 确认宿主与配置。
2. `files.pick/read` 授权测试文件；`scripts.start` 运行 `process`，用 `status/logs` 查看结果，`files.write` 保存 `summary.txt`。运行 `slow` 后可演示 `scripts.cancel`。
3. `models.list` 获取实际模型 ID，再查看积分余额、流水与预估。执行模型目录后点击「填入基础示例」可带入模型 ID。
4. 文本、图片、视频生成均先预估当前参数，再确认执行。记录 `request_id/task_id`；使用 `tasks.request/get/poll` 查询。`poll` 是一次快照查询，不是等待整个生成完成。任务成功后使用 `download/save`；仅支持取消的在途任务使用 `cancel`。
5. `scripts.start` 运行 `fixtures` 会生成自有的 `sample.png`、`sample.wav`。完成后用 `materials.uploadOutput` 上传；`materials.upload` 使用已选择文件的授权引用。异步上传用 `uploadStatus` 查询，只有失败且可恢复的任务才能 `retryUpload`，不能把成功上传的重试拒绝视为接口不通。
6. 用新建测试素材验证 `get/contentUrl/update/organize`、目录创建/改名/移动、公网直链导入和生成结果入库。`remove` 会删除所选素材，只使用自有可处置测试数据。
7. `tools.list/get` 发现动态 Schema，`tools.call` 基础示例使用 `platform.estimate` 的费用预估；其他工具按其实际 Schema 编辑参数。异步受理返回 `job_id` 后使用 `tools.status`，完成也必须核对结果。

选择其他方法不会自动重放之前调用。资源占位符必须由前置步骤或真实 ID 替换；例子不会伪造资源。出错时显示宿主的错误码与请求编号；提交结果未知时先用原 `request_id` 查询，勿另起编号重发。收费接口按当前账号与服务规则计费，示例不改变平台报价和权限。

`generation.embeddings` 与兼容 `cloud.invoke` 沿当前桌面 Runtime 的模型代理；其真实用量和积分回执由现有服务保存。图片、视频等异步任务的受理不代表生成完成。

## 打包和校验

```sh
python3 tools/pack-plugin.py plugin /tmp/aigv-demo-1.1.2.zip
node --test tests/*.test.mjs
```

独立仓库保留参数映射、占位符校验与收费调用确认的定向测试；49 项公开方法与 SDK 导出的完整性比对在源项目完成，不在本仓库复制 SDK 实现。UI 的执行器仅编排公开 SDK，不调用任意 IPC、Shell 或后端 URL。所有业务仍属于插件，不修改 Runtime、Harness 或全局提示词。
