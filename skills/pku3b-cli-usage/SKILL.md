---
name: pku3b-cli-usage
description: Summarizes the pku3b CLI for PKU students—assignments (list/download/submit), coursetable, course announcements, video replays, syllabus and auto add/drop, thesis library search/download, ttshitu captcha, Bark push, init, config, cache, and nested help. Use when the user mentions pku3b or wants CLI usage, options, aliases, or typical workflows for PKU course and related tasks.
---

# pku3b CLI Usage

`pku3b` 是面向北大同学的命令行工具，用于查询/操作课程信息（作业、回放、选课）、验证码识别、通知推送等。

`pku3b` 较新版本还支持个人课表、课程公告、学位论文检索与下载等能力（见下文 **coursetable**、**announcement**、**thesis-lib**）。

## 总览

- **基础用法**: `pku3b [COMMAND] [OPTIONS] [ARGS]`
- **查看帮助**:
  - 顶层: `pku3b -h`
  - 子命令帮助: `pku3b help <command> [subcommand...]`
- **全局选项**:
  - `-h, --help`: 显示帮助
  - `-V, --version`: 显示版本

### 顶层命令一览

- `assignment` (`a`): 作业列表、下载、提交
- `coursetable` (`ct`): 获取个人课表
- `announcement` (`ann`): 获取课程公告
- `video` (`v`): 课程回放列表与下载
- `syllabus` (`s`): 选课相关操作与自动补退选
- `ttshitu` (`tt`): 图形验证码识别账户配置与测试
- `bark` (`b`): Bark 通知令牌配置与测试
- `thesis-lib` (`th`): 学位论文检索与下载
- `init`: 初始化/重设用户名密码
- `config`: 查看或修改配置项
- `cache`: 查看或清理缓存
- `help`: 显示帮助或查看子命令帮助

**子命令别名（节选）**: `assignment` 下 `list`→`ls`、`download`→`down`、`submit`→`sb`；`announcement` 下 `list`→`ls`；`video` 下 `list`→`ls`、`download`→`down`；`thesis-lib` 下 `download`→`down`。完整列表以 `pku3b help <命令>` 为准。

---

## assignment: 作业管理

获取课程作业信息、下载附件、提交作业。

**入口**:

```bash
pku3b assignment [OPTIONS] <COMMAND>
```

也可用别名 `pku3b a ...`。

**通用选项**:

- `-f, --force`: 强制刷新远端数据
- `-h, --help`: 显示当前命令帮助

### assignment list

按截止日期排序查看作业列表。

```bash
pku3b assignment list [OPTIONS]
```

- `-a, --all`: 显示所有作业（包括已完成）
- `--all-term`: 显示所有学期的作业（包括已完成）

### assignment download

下载作业要求和附件到指定文件夹。

```bash
pku3b assignment download [OPTIONS] [ID]
```

- `ID`（可选）: 作业 ID（形如 `f4f30444c7485d49`，可通过 `pku3b assignment list` 获取）。省略时进入交互式选择模式。
- `-d, --dir <DIR>`: 下载目录，支持相对路径，默认当前目录 `.`。
- `--all-term`: 在所有学期范围内查找该作业。

典型用法示例：

```bash
# 交互式选择作业，并下载到当前目录
pku3b assignment download

# 指定作业 ID，下载到自定义目录
pku3b assignment download -d ~/Downloads/course-hw f4f30444c7485d49
```

### assignment submit

提交课程作业。

```bash
pku3b assignment submit [ID] [PATH]
```

- `ID`: 作业 ID（形如 `f4f30444c7485d49`，可通过 `pku3b assignment list` 获取）。省略时进入交互式选择作业。
- `PATH`: 提交文件路径。省略时会列出当前工作目录下所有文件供交互式选择。

示例：

```bash
# 全程交互选择作业与文件
pku3b assignment submit

# 已知作业 ID，交互选择文件
pku3b assignment submit f4f30444c7485d49

# 已知作业 ID 与文件路径
pku3b assignment submit f4f30444c7485d49 report.pdf
```

---

## coursetable: 个人课表

获取个人课表。

```bash
pku3b coursetable [OPTIONS]
```

也可用别名 `pku3b ct ...`。

- `-f, --force`: 强制刷新远端数据
- `-r, --raw`: 显示原始 JSON 数据（用于调试）
- `-h, --help`: 显示当前命令帮助

示例：

```bash
pku3b coursetable
pku3b coursetable -f
pku3b coursetable -r
```

---

## announcement: 课程公告

获取课程公告列表与详情。

**入口**:

```bash
pku3b announcement [OPTIONS] <COMMAND>
```

也可用别名 `pku3b ann ...`。

**通用选项**:

- `-f, --force`: 强制刷新远端数据
- `-h, --help`: 显示当前命令帮助

### announcement list

查看课程公告列表。

```bash
pku3b announcement list [OPTIONS]
```

- `--all-term`: 显示所有学期的课程公告

### announcement show

按 ID 查看公告详情。

```bash
pku3b announcement show [OPTIONS] <ID>
```

- `<ID>`: 公告 ID（可通过 `pku3b announcement ls` 查看）
- `--all-term`: 在所有学期的课程公告范围中查找

示例：

```bash
pku3b announcement list
pku3b announcement list --all-term
pku3b announcement show <公告ID>
```

---

## video: 课程回放

获取课程回放列表与下载课程回放视频（MP4，支持断点续传）。

**入口**:

```bash
pku3b video [OPTIONS] <COMMAND>
```

也可用别名 `pku3b v ...`。

**通用选项**:

- `-f, --force`: 强制刷新远端数据
- `-h, --help`: 显示当前命令帮助

### video list

```bash
pku3b video list [OPTIONS]
```

- `--all-term`: 显示所有学期的课程回放。

### video download

```bash
pku3b video download [OPTIONS] <ID>
```

- `ID`: 课程回放 ID（形如 `e780808c9eb81f61`，可通过 `pku3b video list` 查看）。
- `--all-term`: 在所有学期的课程回放中查找该 ID。
- `-o, --outdir <OUTDIR>`: 下载目录，支持相对路径。

示例：

```bash
# 列出本学期所有课程回放
pku3b video list

# 列出历史所有学期课程回放
pku3b video list --all-term

# 下载指定回放到默认目录
pku3b video download e780808c9eb81f61

# 指定输出目录
pku3b video download -o ~/Videos/pku e780808c9eb81f61
```

---

## syllabus: 选课与自动补退选

进行选课相关操作，包括查看选课结果、配置快捷选课以及自动补退选。

**入口**:

```bash
pku3b syllabus [OPTIONS] <COMMAND>
```

也可用别名 `pku3b s ...`。

**通用选项**:

- `-d, --dual <DUAL>`: 双学位类型，可选值：
  - `major`
  - `minor`
- `-h, --help`: 显示当前命令帮助

### syllabus show

查看当前选课结果。

```bash
pku3b syllabus show
```

### syllabus set

选择课程并配置快捷选课（用于后续自动补退选）。

```bash
pku3b syllabus set
```

通常交互式选择课程，完成后用于自动补退选。

### syllabus unset

取消某课程的快捷选课配置。

```bash
pku3b syllabus unset
```

### syllabus launch

启动自动补退选程序，循环尝试补退选。

```bash
pku3b syllabus launch [OPTIONS]
```

- `-t, --interval <INTERVAL>`: 轮询等待间隔（秒）。帮助里写「默认为 5s」，同时标注 `[default: 15]`，以你本机 `pku3b help syllabus launch` 与实际行为为准。

示例：

```bash
# 使用默认间隔启动自动补退选
pku3b syllabus launch

# 每 5 秒尝试一次
pku3b syllabus launch -t 5
```

---

## ttshitu: 图形验证码识别

配置与测试第三方图形验证码识别服务（通常用于登录或抢课时的验证码自动识别）。

**入口**:

```bash
pku3b ttshitu <COMMAND>
```

也可用别名 `pku3b tt ...`。

### ttshitu init

初始化图形验证码识别账户（如设置用户名与密码），通常会更新配置中的 `ttshitu.username` 和 `ttshitu.password`。

```bash
pku3b ttshitu init
```

### ttshitu test

测试验证码识别是否工作正常。

```bash
pku3b ttshitu test [IMAGE_PATH]
```

- `IMAGE_PATH`（可选）: 测试用验证码图片路径。省略时可能使用默认图片或交互方式（以实际实现为准）。

---

## bark: Bark 通知

配置并测试 Bark 推送通知，用于作业截止、选课状态等事件提醒。

**入口**:

```bash
pku3b bark <COMMAND>
```

也可用别名 `pku3b b ...`。

### bark init

初始化 Bark 通知令牌（设置 `bark.token` 配置）。

```bash
pku3b bark init
```

### bark test

测试 Bark 通知是否配置成功。

```bash
pku3b bark test
```

---

## thesis-lib: 学位论文检索

搜索学位论文，并将下载结果转换为 PDF（见各子命令帮助）。

**入口**:

```bash
pku3b thesis-lib <COMMAND>
```

也可用别名 `pku3b th ...`。

### thesis-lib search

```bash
pku3b thesis-lib search <KEYWORD>
```

- `<KEYWORD>`: 搜索关键词

### thesis-lib download

下载学位论文并转换为 PDF 文件。

```bash
pku3b thesis-lib download [OPTIONS] <KEYID>
```

- `<KEYID>`: 学位论文 ID（形如 `pku3b help thesis-lib download` 中给出的示例格式，可通过 `pku3b th search <KEYWORD>` 的结果查看）
- `-o, --outdir <OUTDIR>`: 文件下载目录（支持相对路径）
- `-j, --job <JOB>`: 并发下载页数，默认 `5`
- `--save-image`: 是否保存每一页的图片

示例：

```bash
pku3b thesis-lib search 关键词
pku3b thesis-lib download -o ~/Downloads/thesis <KEYID>
```

---

## init: 初始化账号

重新初始化用户名/密码（与学校统一身份认证相关）。

```bash
pku3b init
```

用于首次使用或需要更换账号时。

---

## config: 配置项管理

显示或修改 pku3b 的配置项。

```bash
pku3b config [ATTR] [VALUE]
```

- `ATTR`: 配置键，可选值：
  - `username`
  - `password`
  - `ttshitu.username`
  - `ttshitu.password`
  - `bark.token`
- `VALUE`: 属性值（若省略通常表示查看当前值，具体行为以实现为准）。

示例：

```bash
# 查看所有配置（行为以实现为准）
pku3b config

# 设置登录用户名
pku3b config username your_user_id

# 设置图形验证码识别账号
pku3b config ttshitu.username foo
pku3b config ttshitu.password bar

# 设置 Bark 通知令牌
pku3b config bark.token your_bark_token
```

---

## cache: 缓存管理

查看缓存大小或清除缓存。

**入口**:

```bash
pku3b cache [COMMAND]
```

### cache show

查看当前缓存大小。

```bash
pku3b cache show
```

### cache clean

清除所有缓存。

```bash
pku3b cache clean
```

---

## help: 帮助系统

使用内置帮助查看命令结构与说明。

```bash
# 顶层帮助
pku3b help

# 查看某个子命令帮助
pku3b help assignment
pku3b help video

# 查看更深层子命令帮助
pku3b help assignment download
pku3b help syllabus launch
pku3b help announcement show
pku3b help thesis-lib download
```

---

## 使用建议与典型场景

- **首次使用**:
  1. `pku3b init` 初始化学校账号。
  2. 如需验证码识别或推送，使用：
     - `pku3b ttshitu init`
     - `pku3b bark init`
  3. 可通过 `pku3b config` 手动调整配置。

- **日常查作业与下载附件**:
  - `pku3b assignment list`
  - `pku3b assignment download [OPTIONS] [ID]`

- **提交作业**:
  - `pku3b assignment submit [ID] [PATH]`

- **个人课表**:
  - `pku3b coursetable`（调试可加 `-r` 看原始 JSON）

- **课程公告**:
  - `pku3b announcement list [--all-term]`
  - `pku3b announcement show [--all-term] <ID>`

- **查看/下载课程回放**:
  - `pku3b video list [--all-term]`
  - `pku3b video download [--all-term] [-o OUTDIR] <ID>`

- **选课与自动补退选**:
  - `pku3b syllabus set` / `unset`
  - `pku3b syllabus launch [-t INTERVAL]`

- **学位论文**:
  - `pku3b thesis-lib search <KEYWORD>`
  - `pku3b thesis-lib download [-o OUTDIR] [-j JOB] [--save-image] <KEYID>`

- **维护与清理**:
  - `pku3b cache show` / `clean`
  - `pku3b config [ATTR] [VALUE]`

本 skill 总结自 `pku3b -h` 与各子命令 `pku3b help [args]` 的输出，可在使用中作为快捷参考。

若你安装的 `pku3b` 版本与本 skill 中的命令/选项不一致，请以本机 `pku3b -h` 与 `pku3b help` 为准。
