---
name: cf-testlib-checker-from-problem-folder
description: 从包含 desc.md、input.md、output.md、std.cpp、gen.cpp 的题目目录中提炼规则，并实现或更新基于 Codeforces testlib.h 的答案检查器 chk.cpp。用于当用户说“根据文件夹中的题目信息，实现 Codeforces Testlib 的答案检查器 chk.cpp”或“为这道题写 checker”时，尤其是平台摆放、可达性、构造类题目，需要形式化题意并严格校验选手输出合法性与可行性。
---

# CF Testlib Checker from Problem Folder

## 适用场景

- 题目目录（如 `H/`）通常包含：
  - `desc.md`：题面（中文或英文）。
  - `input.md`：输入格式。
  - `output.md`：输出格式与语义。
  - `std.cpp`：参考解（标程）。
  - `gen.cpp`：使用 `testlib.h` 的数据生成器。
  - `gen.sh`：批量生成数据的脚本。
- 目标是在该目录下实现或更新 `chk.cpp`，使用 Codeforces Testlib 对选手输出进行判定。
- 特别适合：
  - “平台/石头 + 最大跳跃距离 + 是否可达”之类的构造或判断题。
  - 题目要求输出一个布局/方案，裁判不只关心可行性，还关心方案是否满足长度、顺序、连续性等结构约束。

## 通用工作流程

1. **读取题面和格式说明**
   - 打开 `desc.md`、`input.md`、`output.md`，提炼：
     - 输入变量含义与范围（如 `n` 为河宽，`m` 为平台数，`d` 为最大跳跃距离，`c_i` 为各平台长度）。
     - 输出内容（如 `YES/NO`，以及长度为 `n` 的数组 `a_i`）。
     - 对输出的语义约束（如平台编号必须形成连续子段，每个平台整体在前一平台右侧，不得重叠等）。

2. **参考标程理解判定逻辑**
   - 阅读 `std.cpp`，尤其关注：
     - 在什么条件下输出 `NO`，在什么条件下输出 `YES`。
     - 若输出 `YES`，如何构造一个合法方案。
   - 利用标程行为，反推题目对“合法解”的完整定义，并在 checker 中显式编码这些条件，而不是仅复用标程算法。

3. **搭建 testlib checker 骨架**
   - 在 `chk.cpp` 中：
     ```cpp
     #include "testlib.h"
     #include <vector>
     #include <string>
     #include <algorithm>
     using namespace std;

     int main(int argc, char* argv[]) {
         registerTestlibCmd(argc, argv);

         // 1) 读取输入（inf）
         // 2) 读取标程答案（ans）
         // 3) 读取选手答案（ouf）并校验
     }
     ```
   - 按 `input.md` 读取输入：
     ```cpp
     int n = inf.readInt();
     int m = inf.readInt();
     int d = inf.readInt();
     vector<int> c(m);
     for (int i = 0; i < m; ++i)
         c[i] = inf.readInt();
     ```
   - 若发现输入本身违反题目保证（如 `sum(c_i) > n`），用 `quitf(_fail, ...)` 报错为题目错误，而非给选手 `WA`。

4. **读取并比较标程与选手的 YES/NO 结论**

   - 从 `ans` 中读取首个 token 并统一转大写，只允许 `YES` 或 `NO`：
     ```cpp
     string juryRes = ans.readToken();
     for (char &ch : juryRes) ch = toupper(ch);
     if (juryRes != "YES" && juryRes != "NO")
         quitf(_fail, "jury output must be YES or NO, found '%s'", juryRes.c_str());
     ```
   - 确保选手输出不为空，读取首个 token：
     ```cpp
     if (ouf.seekEof())
         quitf(_pe, "participant output is empty");
     string partRes = ouf.readToken("expected YES or NO");
     for (char &ch : partRes) ch = toupper(ch);
     ```

   - **若标程为 `NO`**：
     - 选手必须输出 `NO`，否则 `WA`。
     - 选手不能有多余输出（跳过空白后要求 `eof()`），否则 `WA`。
     - 通过后 `quitf(_ok, "correct NO");`。

   - **若标程为 `YES`**：
     - 选手必须输出 `YES`，否则 `WA`。
     - 然后继续按照 `output.md` 要求读取完整的输出结构（例如数组 `a[1..n]`）。

5. **平台/布局类输出的结构校验（以河流 + 平台题为例）**

   当输出为长度为 `n` 的序列 `a_i` 时，遵循以下模式进行检查：

   - 读取 `a[1..n]`：
     ```cpp
     vector<int> a(n + 1);
     vector<int> cnt(m + 1, 0);
     const int INF = n + 5;
     vector<int> L(m + 1, INF), R(m + 1, -1);

     for (int i = 1; i <= n; ++i) {
         a[i] = ouf.readInt(0, m, "a[i]");
         int x = a[i];
         if (x > 0) {
             cnt[x]++;
             if (L[x] == INF) L[x] = i;
             R[x] = i;
         }
     }
     ```
   - 读取后调用：
     ```cpp
     ouf.skipBlanks();
     if (!ouf.eof())
         quitf(_wa, "extra data after sequence a[1..n]");
     ```

   - 结构性检查：
     - **长度匹配**：对每个平台 `k`，要求 `cnt[k] == c[k-1]`。
     - **连续性**：`R[k] - L[k] + 1 == cnt[k]`，即平台编号在数组中形成一个连续区间。
     - **顺序与不重叠**：按 `k = 1..m` 遍历，要求 `L[k] > R[k-1]`，平台整体从左到右严格递增且不交叠。
     - 出错时使用 `quitf(_wa, "...具体说明平台 k 问题...")`，方便调试。

6. **题意语义（如可达性）的检查**

   以“从 0 到 `n+1` 的跳跃 + 平台题”为例：

   - 模型：
     - 初始在位置 0。
     - 可从位置 `x` 跳到 `[x+1, x+d]` 任意单元。
     - 只能落在属于平台的单元上，0 和 `n+1` 视为平台。
   - 在已经得到各平台的区间 `[L[k], R[k]]` 后：
     - 从 0 到第一个平台：检查 `L[1] - 0 <= d`。
     - 相邻平台 `k` 与 `k+1`：检查 `L[k+1] - R[k] <= d`。
     - 从最后一个平台到右岸：检查 `(n + 1) - R[m] <= d`。
   - 任一跳跃距离超过 `d`，则选手输出为 `WA`，即使长度、顺序等其他条件都通过。

7. **边界与特殊情况**

   - 根据题意决定是否可能有 `m = 0`、`n` 很小、`d` 极大等边界：
     - 若 `m = 0` 且题意允许：
       - 要求所有 `a[i]` 为 0。
       - 判断能否一次从 0 跳到 `n+1`。
     - 若题面保证某些条件（如 `m >= 1`、`sum c_i <= n` 等），而实际输入违反，应使用 `_fail` 报题面/数据错误。

8. **编译与使用建议**

   - 默认使用：
     ```bash
     g++ -std=c++14 H/chk.cpp -Itestlib -o chk
     ```
   - 如果题目目录下存在 `data/` 文件夹，且其中包含 `input1.txt` 与 `output1.txt`：
     1. 在题目目录下先用标程生成 `data/output1.txt`（若尚未生成）。
     2. 然后在题目目录下执行：
        ```bash
        ./chk data/input1.txt data/output1.txt data/output1.txt
        ```
        用 `chk` 同时作为验证器来检查“标程作为选手”的情况，以验证答案生成器与 checker 的一致性。
   - 生成器通常形如：
     ```cpp
     #include "testlib.h"
     int main(int argc, char* argv[]) {
         registerGen(argc, argv, 1);
         // ...
     }
     ```
     在 checker 中改用 `registerTestlibCmd(argc, argv);`。
   - 保持与现有 `gen.cpp`、`std.cpp` 一致的风格；只在非直观的判定处写少量解释性注释，避免冗长。

## 执行流程

复制并维护下列进度清单（可按题目标号替换 `H/`）：

```text
Task Progress:
- [ ] Step 1: 读取题面与格式说明
- [ ] Step 2: 理解标程逻辑与合法性条件
- [ ] Step 3: 搭建 chk.cpp testlib 骨架
- [ ] Step 4: 实现结构性与语义性检查
- [ ] Step 5: 编译 chk.cpp 并用样例/数据自测
- [ ] Step 6: 必要时修复并重复验证
- [ ] Step 7: 同步评测配置文件
```

### Step 1: 读取题面与格式说明

- 打开题目目录下的 `desc.md`、`input.md`、`output.md`，提取：
  - 输入的所有参数名称、类型与范围。
  - 输出格式与每个字段的语义（尤其是数组、布局、编号等约束）。
- 若描述存在歧义，结合 `std.cpp` 进行佐证，优先保证 checker 不比题意更宽松。

### Step 2: 理解标程逻辑与合法性条件

- 阅读 `std.cpp`，搞清楚：
  - 标程在什么条件下输出 `NO`，在什么条件下输出 `YES`。
  - 当输出 `YES` 时，构造的对象/布局具备哪些性质（连续、顺序、可达性等）。
- 将这些性质抽象成独立的、可直接在 checker 中验证的条件，而不是简单把标程算法搬过来。

### Step 3: 搭建 `chk.cpp` testlib 骨架

- 引入 `testlib.h`，在 `main` 中调用 `registerTestlibCmd(argc, argv);`。
- 使用 `inf` 按 `input.md` 读取完整输入，并在必要时校验输入是否违反题目保证（用 `_fail` 报题面/数据问题）。
- 使用 `ans` 和 `ouf`：
  - 统一读取并大写化 `YES/NO`。
  - 处理 “裁判 NO / 选手 NO” 和 “裁判 YES / 选手 YES + 后续输出” 两大分支。

### Step 4: 实现结构性与语义性检查

- 当裁判答案为 `YES` 时：
  - 按 `output.md` 定义读取选手全部输出（如长度为 `n` 的数组 `a_i`）。
  - 做严格的结构检查：长度、取值范围、连续性、不重叠、顺序等。
  - 对于本题型，额外检查：
    - 每个平台长度之和与输入 `c_i` 一致。
    - 从起点 0，经各个平台，到终点 `n+1` 的每一跳距离都不超过 `d`。
- 使用 `quitf(_wa, ...)` 给出尽量明确的失败原因，方便调试选手输出。

### Step 5: 编译 `chk.cpp` 并用样例/数据自测

- 在工程根目录下，使用 skill 约定的命令编译（可根据题目标号调整路径）：
  ```bash
  g++ -std=c++14 H/chk.cpp -Itestlib -o chk
  ```
- 利用样例或已有的 `data/` 目录进行自测：
  - 若存在 `data/input1.txt` 和 `data/output1.txt`，优先确认标程能产出该输出，或根据生成脚本重新生成。
  - 然后在题目目录下执行：
    ```bash
    ./chk data/input1.txt data/output1.txt data/output1.txt
    ```
    检查“标程作为选手输出”是否通过，以验证答案生成器与 checker 的一致性。

### Step 6: 必要时修复并重复验证

- 若 `chk` 在样例或数据上报错：
  - 仔细阅读报错信息，区分是题面不严谨、标程行为有特殊性、还是 checker 条件写得过严/过宽。
  - 按需修正 `chk.cpp`（尽量只放宽/收紧真正需要调整的条件），重新编译并重复 Step 5。
- 只有在样例与 `data/` 下都表现稳定后，再把 checker 作为最终结果交付或投入评测使用。

### Step 7: 同步评测配置文件

- 修改题目目录下的 `gen.sh`，加入：
  ```bash
  cp chk.cpp data/chk.cpp
  ```
  以确保生成数据后，checker 会被同步到 `data/` 目录。
- 修改 `data/problem.conf`，删除 `use_builtin_judger` 配置，避免与自定义 `chk.cpp` 的评测方式冲突。

## 简要示例（本次聊天对应题型）

- 输入：河宽 `n`、平台数 `m`、最大跳跃 `d`、各平台长度 `c_i`。
- 输出：
  - 若无解：`NO`。
  - 若有解：`YES` 与数组 `a[1..n]`，其中：
    - `a[i] = 0` 表示空水域。
    - `a[i] = k (1..m)` 表示单元 `i` 属于平台 `k`。
    - 每个平台 `k` 形成一个连续区间，且平台 `k` 整体位于平台 `k-1` 右侧。
- checker 需要：
  - 严格校验上述结构约束。
  - 校验总长度与输入的 `c_i` 一致。
  - 校验从 0 经若干平台到 `n+1` 的跳跃路径在每一段都不超过 `d`。

