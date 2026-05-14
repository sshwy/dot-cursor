---
name: oi-problem-pipeline
description: 根据算法竞赛题面生成数据构造流水线：编写依赖 testlib 的 gen.cpp、不依赖 testlib 的标准解 std.cpp、用 NUON 行参数文件 data_params 配合工作区 ./bobo.nu generate-testdata 批量产出输入输出。题面输入可为低质量文本、HTML 文件或两者同时提供。用于用户要求“根据题目生成数据/标程/脚本”、构造评测数据、或提到 gen.cpp/std.cpp/problem.conf/data 目录时。
---

# OI 题目数据流水线

## 适用场景

当用户提供算法竞赛题面，并要求一次性完成以下内容时使用本技能：

1. 生成 `gen.cpp`（可依赖 CodeForces `testlib`）
2. 生成 `std.cpp`（不依赖 `testlib`）
3. 生成 `data_params`（每行一组 NUON 参数）并写入 `data/problem.conf`；用工作区 `./bobo.nu generate-testdata`（Nushell 脚本）在题目目录下批量生成 10 组 `data/input*.txt` 与 `data/output*.txt`（须先编译出可执行的 `gen` 与 `std`）。

题面来源可为以下任一情况：

- 低质量文本题面（.txt,.preview）
- HTML 文件题面（.htm,.html）
- 低质量文本与 HTML 同时提供（需交叉核对后统一理解题意）

默认 `testlib` 位于工作区 `testlib/`。

## 执行流程

**题目目录边界（须遵守）**：若用户**明确提供了题目目录**（例如 `A/`），则在本技能全流程中**不得对该目录之外的路径进行写操作**（不得新建、修改、删除目录外文件）。允许的例外仅为**只读**使用目录外资源（例如编译时 `-I` 引用工作区 `testlib/`、执行工作区根目录的 `./bobo.nu` 等命令本身不写题目目录外文件时）。`gen.cpp`、`std.cpp`、`data_params`、`data/`、可执行文件 `gen`/`std` 等产物均须落在用户给出的题目目录及其子目录内。若用户未指定题目目录，则不受本条约束，按与用户约定或工作区惯例处理。

复制并维护下列进度清单：

```text
Task Progress:
- [ ] Step 1: 解析题意与约束
- [ ] Step 2: 设计数据分层与参数方案
- [ ] Step 3: 编写 gen.cpp（testlib）
- [ ] Step 4: 编写 std.cpp（C++14）
- [ ] Step 5: 编译 gen/std、编写 data_params 与 data/problem.conf
- [ ] Step 6: 执行 `./bobo.nu generate-testdata <题目目录> ...` 生成数据
- [ ] Step 7: 自检与必要修复
```

### Step 1: 解析题意与约束

- 提取输入格式、输出格式、范围、边界条件、特殊数据形态。
- 若关键约束缺失（如 `n` 上限、值域、是否多组数据），先向用户确认，避免臆造规则。

### Step 2: 设计数据分层与参数方案

- 将 10 组数据分为小/中/大规模与极端情况（如全相等、严格单调、随机、卡边界）。
- 明确每组传给 `./gen` 的参数语义（例如 `nMax valueMax mode seed`）。
- 保证参数与题面规模一致，不超约束。

### Step 3: 编写 `gen.cpp`

- 使用 `testlib.h` 与 `registerGen(argc, argv, 1)`。
- 通过命令行参数控制数据规模与模式，不把规模硬编码成单一值。
- 使用 `rnd.next(...)` 生成随机数据；必要时按模式生成特殊结构。
- 输出必须严格匹配题目输入格式。

推荐骨架（按题目改写）：

```cpp
#include "testlib.h"
#include <bits/stdc++.h>
using namespace std;

int main(int argc, char* argv[]) {
    registerGen(argc, argv, 1);

    int n = opt<int>("n", 10);
    int vmax = opt<int>("vmax", 100);
    int mode = opt<int>("mode", 0);

    cout << n << '\n';
    for (int i = 0; i < n; ++i) {
        int x = rnd.next(1, vmax);
        cout << x << (i + 1 == n ? '\n' : ' ');
    }
    return 0;
}
```

### Step 4: 编写 `std.cpp`

- 给出可通过目标约束的正确解，不依赖 `testlib`。
- 优先可读与稳定实现，包含必要的边界处理。
- 若存在多解策略，选复杂度最稳妥的一版。
- 编写完成后，使用 `g++ -std=c++14 -O2 std.cpp -o std` 在题目目录下编译，确保无编译错误。
- 若当前题目目录下存在 `sample1.in` 与 `sample1.out`，务必执行 `./std < sample1.in > sample1.tmp` 并对比 `sample1.out`，确认输出完全一致；若发现不一致，则视为当前 `std.cpp` 存在错误，需继续基于差异信息调试并修复，反复编译与比对，直至与 `sample1.out` 完全一致后方可进入后续步骤。

### Step 5: 编译、`data_params` 与 `bobo.nu generate-testdata`

`generate-testdata` 不会替你编译；生成器与标程须已是题目目录下可执行的 `gen`、`std`（二进制或带执行位的脚本）。随后用 **NUON 参数表** 驱动批量造数据。

#### 5.1 编译（在题目目录内示例）

- `gen.cpp`：带上 `testlib` 头路径，例如  
  `g++ -std=c++14 -O2 -I./testlib gen.cpp -o gen`（若 `testlib` 在上一级则 `-I../testlib` 等，按实际布局改）。
- `std.cpp`：  
  `g++ -std=c++14 -O2 std.cpp -o std`

#### 5.2 编写 `data_params`（默认文件名）

在题目目录创建 **`data_params`**：每行对应一组测试数据。实现上会把该行首尾拼成 `[` + 行内容 + `]` 再按 **NUON** 解析为传给 `./gen` 的 argv 列表，因此**每行应写成「若外面包一对 `[]` 则为合法 NUON 列表」的内部写法**（通常是一串带引号的字符串参数，逗号或空格分隔均可，以 NUON 语法为准）。

示例（10 行对应 10 组；参数名与 `gen.cpp` 中 `opt`/argv 一致）：

```text
"--n=10" "--vmax=20" "--mode=0"
"--n=20" "--vmax=50" "--mode=1"
"--n=50" "--vmax=100" "--mode=0"
"--n=100" "--vmax=200" "--mode=2"
"--n=200" "--vmax=500" "--mode=0"
"--n=500" "--vmax=1000" "--mode=1"
"--n=1000" "--vmax=2000" "--mode=2"
"--n=2000" "--vmax=5000" "--mode=0"
"--n=5000" "--vmax=10000" "--mode=1"
"--n=10000" "--vmax=100000" "--mode=2"
```

勿留空行；行数 = 测试组数（与 `problem.conf` 里 `n_tests` 一致）。

#### 5.3 编写 `data/problem.conf`

`generate-testdata` 只负责写 `input*.txt` / `output*.txt`，**不**生成 `problem.conf`，仍需在 `data/`（或你选用的数据子目录）下创建。可按题目改 `time_limit`（秒）、`memory_limit`（MB）：

```text
use_builtin_judger on
use_builtin_checker ncmp
n_tests 10
time_limit 1
memory_limit 128
```

#### 5.4 调用 `./bobo.nu generate-testdata`

在工作区根目录（存在 `bobo.nu` 且已 `chmod +x` 时可直接）执行：

```bash
./bobo.nu generate-testdata /path/to/题目目录 --datadir data --dataparams data_params
```

说明（与 `bobo.nu` 中 `main generate-testdata` 一致）：

- 第一个参数 **`dir`**：题目目录，内含可执行的 `gen`、`std` 与参数文件。
- **`--datadir`**：相对 `dir` 的子目录，写入 `inputN.txt` / `outputN.txt`。默认是 `data2`；若希望与上文的 `data/problem.conf` 同目录，显式传 **`--datadir data`**。
- **`--dataparams`**：参数文件名，默认 `data_params`。
- **`--generator` / `--stdname`**：可执行文件 basename，默认分别为 `gen`、`std`。

等价用法：在 Nushell 里 `source bobo.nu` 后执行 `main generate-testdata /path/to/题目目录 ...`。生成器从标准输出写输入文件，标程从标准输入读入、标准输出写答案（与原先 `gen.sh` 里重定向语义一致）。

## 输出要求

向用户交付时应包含：

1. 关键思路：`std.cpp` 的算法与复杂度（简要）
2. 数据设计：10 组参数分层说明（小/中/大/极端）
3. 产物路径：`gen.cpp`、`std.cpp`、`data_params`、`data/problem.conf`（及工作区 `bobo.nu` 的调用方式）
4. 验证结果：是否成功生成 `data/input1..10.txt`、`data/output1..10.txt`、`data/problem.conf`

## 质量检查

- 若用户已指定题目目录：自检变更范围，确认没有对题目目录外的文件产生写操作。
- `gen.cpp` 输出格式与题目输入格式一致。
- `std.cpp` 不包含 `testlib` 依赖。
- `./bobo.nu generate-testdata` 可重复执行；`bobo.nu` 会创建 `--datadir` 指定子目录（若不存在）。
- 参数不越界，覆盖边界与随机分布。
- **标程输出类别分布**：若题目答案在少数离散类别上（例如 `YES`/`NO`、`0`/`1`、无解/有解），纯随机构造往往使 `gen.cpp` 产出的数据经 `std` 后**某一类占绝大多数**（两极分化），不利于覆盖两类分支。应在 `gen.cpp` 中显式控制目标类别比例（例如先以约 50% 概率决定生成「正例」或「反例」，再分别构造合法/不合法实例），或通过命令行参数（如 `balanced`、`yes100`）调节期望比例；并避免在 **`data_params` 各组参数** 中长期使用会导致整组数据几乎全为同一类答案的单一模式（如全空网格、全障碍等），除非刻意测该极端。生成后可用 `std` 对大批量样例统计各类出现次数作抽查。
- 若编译或运行失败，先修复再汇报，不把失败状态直接当最终结果返回。
