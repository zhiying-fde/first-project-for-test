# 智影演示插件

智影桌面插件独立示例，版本 **1.1.2**，插件 ID 为 `aigv.material-processor`。提供 SDK 1.1 的 49 项公开方法清单、可编辑参数、调用示例和真实宿主返回。

## 下载安装

直接下载 [演示插件 1.1.2 ZIP](https://github.com/zhiying-fde/first-project-for-test/releases/download/v1.1.2/aigv-demo-1.1.2.zip)，在智影桌面端插件管理页导入，无需解压。版本说明与校验文件见 [Releases](https://github.com/zhiying-fde/first-project-for-test/releases/tag/v1.1.2)。

## 本地使用

```sh
git clone git@github.com:zhiying-fde/first-project-for-test.git
cd first-project-for-test
```

在智影桌面端的「插件」页选择「加载本地插件目录」，选择本仓库的 **`plugin/`** 目录，并确认权限和配置。修改包内 UI 或脚本后，宿主按现有本地开发流程自动刷新；无需 npm 安装或前端构建。普通浏览器只能预览能力清单，实际调用需要宿主注入 `window.aigvPlugin`。

需要当前桌面宿主支持插件目录开发、SDK 1.1 平台能力及相应账号权限。清单声明的平台为 macOS arm64 和 Windows x64；独立仓库导出不代表两个平台均已重新验收。

## 打包

打包工具只依赖 Python 3 标准库，ZIP 输出必须在插件目录外且尚不存在：

```sh
mkdir -p dist
python3 tools/pack-plugin.py plugin dist/aigv-demo-1.1.2.zip
```

得到的 ZIP 根目录直接包含 `plugin.json`，可通过智影桌面端已有的插件包导入流程安装。GitHub 的源码 ZIP 是仓库归档，不能直接作为插件包导入。此工具执行基础检查；完整包校验仍由宿主和服务端负责。

## 验证

使用 Node.js 24：

```sh
node --test tests/*.test.mjs
```

测试覆盖参数映射、资源占位符及收费调用的预估与确认约束，不调用真实云服务。

## 文件与运行边界

| 路径 | 内容 |
| --- | --- |
| `plugin/plugin.json` | 插件入口、权限、配置与受管脚本声明 |
| `plugin/ui/` | 原生 HTML/CSS/JavaScript 界面及 SDK 调用 |
| `plugin/scripts/` | 素材清单、图片/音频测试素材与取消演示 |
| `tools/pack-plugin.py` | 复用现有开发工具的标准库打包器 |
| `tests/` | 无宿主依赖的定向行为测试 |

插件源码来自 AIGV 的 `desktop/examples/plugins/material-processor`；本仓库独立保存该示例，无需主项目源码。界面、SDK 参数、权限、`prefix` 配置和脚本保持原行为，无独立数据库、服务端、队列或 Worker。宿主负责账号、授权、任务、云调用、上传与费用记录。

完整演示步骤见 [插件说明](plugin/README.md)。生成接口沿当前账号规则计费；执行前先预估并确认。仅使用可处置的自有测试素材验证删除等操作。
