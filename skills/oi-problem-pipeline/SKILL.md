---
name: oi-problem-pipeline
description: 根据算法竞赛题面生成数据构造流水线：编写依赖 testlib 的 gen.cpp、不依赖 testlib 的标准解 std.cpp、以及批量产出输入输出的 gen.sh。题面输入可为低质量文本、HTML 文件或两者同时提供。用于用户要求“根据题目生成数据/标程/脚本”、构造评测数据、或提到 gen.cpp/std.cpp/problem.conf/data 目录时。
---

# OI 题目数据流水线

## 适用场景

当用户提供算法竞赛题面，并要求一次性完成以下内容时使用本技能：

1. 生成 `gen.cpp`（可依赖 CodeForces `testlib`）
2. 生成 `std.cpp`（不依赖 `testlib`）
3. 生成 `gen.sh`：编译并批量生成 10 组 `data/input*.txt` 与 `data/output*.txt`，并创建 `data/problem.conf` 文件。

题面来源可为以下任一情况：

- 低质量文本题面（.txt,.preview）
- HTML 文件题面（.htm,.html）
- 低质量文本与 HTML 同时提供（需交叉核对后统一理解题意）

默认 `testlib` 位于工作区 `testlib/`。

## 执行流程

复制并维护下列进度清单：

```text
Task Progress:
- [ ] Step 1: 解析题意与约束
- [ ] Step 2: 设计数据分层与参数方案
- [ ] Step 3: 编写 gen.cpp（testlib）
- [ ] Step 4: 编写 std.cpp（C++14）
- [ ] Step 5: 编写 gen.sh（编译+10组数据）
- [ ] Step 6: 执行 `bash gen.sh` 生成数据
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

### Step 5: 编写 `gen.sh`

- 使用 `set -euo pipefail`。
- 编译：
  - `gen.cpp`：包含 `testlib` 头文件路径（例如 `-I./testlib`）。
  - `std.cpp`：常规 `-O2 -std=c++14`。
- 生成目录与数据：
  - `mkdir -p data`
  - 循环 1..10，按预设参数执行 `./gen ... > data/input$i.txt`
  - 执行 `./std < data/input$i.txt > data/output$i.txt`
  - 将下面的内容写入 `data/problem.conf`

`problem.conf` 内容如下：可根据题目描述修改 time_limit（秒）和 memory_limit（MB）：

```text
use_builtin_judger on
use_builtin_checker ncmp
n_tests 10
time_limit 1
memory_limit 128
```

推荐脚本模板（按题目参数改写）：

```bash
#!/usr/bin/env bash
set -euo pipefail

g++ -std=c++14 -O2 -I./testlib gen.cpp -o gen
g++ -std=c++14 -O2 std.cpp -o std

mkdir -p data

# 每行对应一组数据参数，需按题目约束调整
PARAMS=(
  "--n=10 --vmax=20 --mode=0"
  "--n=20 --vmax=50 --mode=1"
  "--n=50 --vmax=100 --mode=0"
  "--n=100 --vmax=200 --mode=2"
  "--n=200 --vmax=500 --mode=0"
  "--n=500 --vmax=1000 --mode=1"
  "--n=1000 --vmax=2000 --mode=2"
  "--n=2000 --vmax=5000 --mode=0"
  "--n=5000 --vmax=10000 --mode=1"
  "--n=10000 --vmax=100000 --mode=2"
)

for i in $(seq 1 10); do
  ./gen ${PARAMS[$((i - 1))]} > "data/input${i}.txt"
  ./std < "data/input${i}.txt" > "data/output${i}.txt"
done

cat > data/problem.conf << 'EOF'
use_builtin_judger on
use_builtin_checker ncmp
n_tests 10
time_limit 1
memory_limit 128
EOF
```

## 输出要求

向用户交付时应包含：

1. 关键思路：`std.cpp` 的算法与复杂度（简要）
2. 数据设计：10 组参数分层说明（小/中/大/极端）
3. 产物路径：`gen.cpp`、`std.cpp`、`gen.sh`
4. 验证结果：是否成功生成 `data/input1..10.txt`、`data/output1..10.txt`、`data/problem.conf`

## 质量检查

- `gen.cpp` 输出格式与题目输入格式一致。
- `std.cpp` 不包含 `testlib` 依赖。
- `gen.sh` 可重复执行，且在缺少 `data/` 时自动创建。
- 参数不越界，覆盖边界与随机分布。
- 若编译或运行失败，先修复再汇报，不把失败状态直接当最终结果返回。
