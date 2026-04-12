---
title: "Can LLMs Be Computers?"
author:
  - "[[Percepta]]"
published: 2026-03-11
date: "2026-03-29T23:23:29+08:00"
description: "We build a computer inside a transformer — executing arbitrary C programs for millions of steps with exponentially faster inference via 2D attention heads."
tags:
  - "clippings"
---
> 本文截取自互联网博客并做一定修改：https://www.percepta.ai/blog/can-llms-be-computers

## TL;DR

Language models can solve tough math problems at research grade but struggle on simple computational tasks that involve reasoning over many steps and long context. Even multiplying two numbers or solving small Sudokus is nearly impossible unless they rely on external tools.

> But what does it take for an LLM itself to be as reliable and efficient as a computer?

We answer this by literally building a computer inside a transformer. We turn arbitrary C code into tokens that the model itself can execute reliably for millions of steps in seconds.

Here is how it works when solving an optimization problem that proceeds in many steps, namely min-cost perfect matching via the Hungarian algorithm.

User

Solve the min-cost perfect matching for this 10×10 cost matrix:

61 58 35 86 32 39 41 27 21 42

59 77 97 99 78 21 89 72 35 63

88 85 37 57 59 97 37 29 69 94

32 82 53 20 77 96 21 70 50 61

15 44 81 10 64 36 56 78 20 69

76 35 87 69 16 55 26 37 30 66

86 32 74 94 32 14 24 12 31 70

97 63 20 64 90 21 28 49 89 10

58 52 27 76 61 35 17 91 37 66

42 79 61 26 55 98 70 17 26 86

**31,405** tok/s **182,160** tokens **6,827** lines/s

Assistant

solving 10x10 assignment problem using the Hungarian algorithm..

assigning row 1.

running Dijkstra on reduced costs....

explored 1 column, found free col 9.

updating dual variables....

augmenting along path:

assign row 1 -> col 9.

cost: 0 + 21 = 21 (new row adds 21 to total)

assigning row 2.

running Dijkstra on reduced costs....

explored 1 column, found free col 6.

updating dual variables....

augmenting along path:

assign row 2 -> col 6.

cost: 21 + 21 = 42 (new row adds 21 to total)

<svg viewBox="90 0 210 340" class="w-full h-full" preserveAspectRatio="xMidYMid meet"><g><path d="M155,30 C194.2246913580247,54 213.83703703703702,246 253.06172839506172,270" fill="none" stroke="rgb(145,177,50)" stroke-width="2" stroke-opacity="0.1111111111111111" style="transition: stroke 0.3s;"></path><text x="163" y="22" text-anchor="middle" font-size="11" font-weight="700" fill="rgb(145,177,50)" fill-opacity="0.18888888888888888">21</text></g> <g><path d="M143.93827160493828,60 C194.2246913580247,72 219.3679012345679,168 269.65432098765433,180" fill="none" stroke="rgb(145,177,50)" stroke-width="2" stroke-opacity="0" style="transition: stroke 0.3s;"></path><text x="151.93827160493828" y="52" text-anchor="middle" font-size="11" font-weight="700" fill="rgb(145,177,50)" fill-opacity="0">21</text></g> <g><path d="M135.64197530864197,90 C185.9283950617284,90 211.0716049382716,90 261.358024691358,90" fill="none" stroke="rgb(34,197,94)" stroke-width="2" stroke-opacity="0" style="transition: stroke 0.3s;"></path></g><g><path d="M130.11111111111111,120 C184.82222222222225,120 212.1777777777778,120 266.8888888888889,120" fill="none" stroke="rgb(34,197,94)" stroke-width="2" stroke-opacity="0" style="transition: stroke 0.3s;"></path></g><g><path d="M127.34567901234568,150 C173.2074074074074,138 196.13827160493827,42 242,30" fill="none" stroke="rgb(34,197,94)" stroke-width="2" stroke-opacity="0" style="transition: stroke 0.3s;"></path></g><g><path d="M127.34567901234568,180 C184.26913580246915,177 212.73086419753088,153 269.65432098765433,150" fill="none" stroke="rgb(34,197,94)" stroke-width="2" stroke-opacity="0" style="transition: stroke 0.3s;"></path></g><g><path d="M130.11111111111111,210 C179.29135802469136,195 203.88148148148147,75 253.06172839506172,60" fill="none" stroke="rgb(34,197,94)" stroke-width="2" stroke-opacity="0" style="transition: stroke 0.3s;"></path></g><g><path d="M135.64197530864197,240 C178.1851851851852,246 199.45679012345678,294 242,300" fill="none" stroke="rgb(34,197,94)" stroke-width="2" stroke-opacity="0" style="transition: stroke 0.3s;"></path></g><g><path d="M143.93827160493828,270 C193.11851851851853,264 217.70864197530867,216 266.8888888888889,210" fill="none" stroke="rgb(34,197,94)" stroke-width="2" stroke-opacity="0" style="transition: stroke 0.3s;"></path></g><g><path d="M155,300 C197.54320987654322,294 218.8148148148148,246 261.358024691358,240" fill="none" stroke="rgb(34,197,94)" stroke-width="2" stroke-opacity="0" style="transition: stroke 0.3s;"></path></g><g><g transform="translate(137,30) scale(1.5)" opacity="1" style="transition: opacity 0.3s;"><path d="M-6,6 Q-6,0 0,0 Q6,0 6,6" fill="#e74c3c"></path><circle cx="0" cy="-3" r="3.5" fill="#FFDBB4"></circle></g><text x="123" y="34" text-anchor="end" font-size="8" font-weight="600" fill="#e74c3c" fill-opacity="0.9" style="transition: fill-opacity 0.3s;">1</text> <circle cx="155" cy="30" r="3" fill="#e74c3c" opacity="0.8" style="transition: 0.3s;"></circle></g><g><g transform="translate(125.93827160493828,60) scale(1.5)" opacity="1" style="transition: opacity 0.3s;"><path d="M-6,6 Q-6,0 0,0 Q6,0 6,6" fill="#e67e22"></path><circle cx="0" cy="-3" r="3.5" fill="#E8B98D"></circle></g><text x="111.93827160493828" y="64" text-anchor="end" font-size="8" font-weight="600" fill="#e67e22" fill-opacity="0.9" style="transition: fill-opacity 0.3s;">2</text> <circle cx="143.93827160493828" cy="60" r="3" fill="#e67e22" opacity="0.8" style="transition: 0.3s;"></circle></g><g><g transform="translate(117.64197530864197,90) scale(1.5)" opacity="0.3" style="transition: opacity 0.3s;"><path d="M-6,6 Q-6,0 0,0 Q6,0 6,6" fill="#f1c40f"></path><circle cx="0" cy="-3" r="3.5" fill="#D4A06A"></circle></g><text x="103.64197530864197" y="94" text-anchor="end" font-size="8" font-weight="600" fill="#f1c40f" fill-opacity="0.35" style="transition: fill-opacity 0.3s;">3</text> <circle cx="135.64197530864197" cy="90" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle></g><g><g transform="translate(112.11111111111111,120) scale(1.5)" opacity="0.3" style="transition: opacity 0.3s;"><path d="M-6,6 Q-6,0 0,0 Q6,0 6,6" fill="#2ecc71"></path><circle cx="0" cy="-3" r="3.5" fill="#C68642"></circle></g><text x="98.11111111111111" y="124" text-anchor="end" font-size="8" font-weight="600" fill="#2ecc71" fill-opacity="0.35" style="transition: fill-opacity 0.3s;">4</text> <circle cx="130.11111111111111" cy="120" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle></g><g><g transform="translate(109.34567901234568,150) scale(1.5)" opacity="0.3" style="transition: opacity 0.3s;"><path d="M-6,6 Q-6,0 0,0 Q6,0 6,6" fill="#1abc9c"></path><circle cx="0" cy="-3" r="3.5" fill="#8D5524"></circle></g><text x="95.34567901234568" y="154" text-anchor="end" font-size="8" font-weight="600" fill="#1abc9c" fill-opacity="0.35" style="transition: fill-opacity 0.3s;">5</text> <circle cx="127.34567901234568" cy="150" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle></g><g><g transform="translate(109.34567901234568,180) scale(1.5)" opacity="0.3" style="transition: opacity 0.3s;"><path d="M-6,6 Q-6,0 0,0 Q6,0 6,6" fill="#3498db"></path><circle cx="0" cy="-3" r="3.5" fill="#FFCD94"></circle></g><text x="95.34567901234568" y="184" text-anchor="end" font-size="8" font-weight="600" fill="#3498db" fill-opacity="0.35" style="transition: fill-opacity 0.3s;">6</text> <circle cx="127.34567901234568" cy="180" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle></g><g><g transform="translate(112.11111111111111,210) scale(1.5)" opacity="0.3" style="transition: opacity 0.3s;"><path d="M-6,6 Q-6,0 0,0 Q6,0 6,6" fill="#9b59b6"></path><circle cx="0" cy="-3" r="3.5" fill="#F1C27D"></circle></g><text x="98.11111111111111" y="214" text-anchor="end" font-size="8" font-weight="600" fill="#9b59b6" fill-opacity="0.35" style="transition: fill-opacity 0.3s;">7</text> <circle cx="130.11111111111111" cy="210" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle></g><g><g transform="translate(117.64197530864197,240) scale(1.5)" opacity="0.3" style="transition: opacity 0.3s;"><path d="M-6,6 Q-6,0 0,0 Q6,0 6,6" fill="#e84393"></path><circle cx="0" cy="-3" r="3.5" fill="#DEB887"></circle></g><text x="103.64197530864197" y="244" text-anchor="end" font-size="8" font-weight="600" fill="#e84393" fill-opacity="0.35" style="transition: fill-opacity 0.3s;">8</text> <circle cx="135.64197530864197" cy="240" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle></g><g><g transform="translate(125.93827160493828,270) scale(1.5)" opacity="0.3" style="transition: opacity 0.3s;"><path d="M-6,6 Q-6,0 0,0 Q6,0 6,6" fill="#fd79a8"></path><circle cx="0" cy="-3" r="3.5" fill="#A0522D"></circle></g><text x="111.93827160493828" y="274" text-anchor="end" font-size="8" font-weight="600" fill="#fd79a8" fill-opacity="0.35" style="transition: fill-opacity 0.3s;">9</text> <circle cx="143.93827160493828" cy="270" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle></g><g><g transform="translate(137,300) scale(1.5)" opacity="0.3" style="transition: opacity 0.3s;"><path d="M-6,6 Q-6,0 0,0 Q6,0 6,6" fill="#6c5ce7"></path><circle cx="0" cy="-3" r="3.5" fill="#FFDAB9"></circle></g><text x="123" y="304" text-anchor="end" font-size="8" font-weight="600" fill="#6c5ce7" fill-opacity="0.35" style="transition: fill-opacity 0.3s;">10</text><circle cx="155" cy="300" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle></g><g><circle cx="242" cy="30" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle><g transform="translate(260,30)" opacity="0.25" style="transition: opacity 0.3s;"><path d="M0,-7 L7,0 L0,7 L-7,0Z" fill="#e74c3c"></path></g></g><g><circle cx="253.06172839506172" cy="60" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle><g transform="translate(271.0617283950617,60)" opacity="0.25" style="transition: opacity 0.3s;"><path d="M0,-8 L2,-2.5 L8,-2.5 L3.5,1.5 L5,7.5 L0,4 L-5,7.5 L-3.5,1.5 L-8,-2.5 L-2,-2.5Z" fill="#f39c12"></path></g></g><g><circle cx="261.358024691358" cy="90" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle><g transform="translate(279.358024691358,90)" opacity="0.25" style="transition: opacity 0.3s;"><path d="M-7,5 L0,-7 L7,5Z" fill="#2ecc71"></path></g></g><g><circle cx="266.8888888888889" cy="120" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle><g transform="translate(284.8888888888889,120)" opacity="0.25" style="transition: opacity 0.3s;"><path d="M-6,-6 L6,-6 L6,6 L-6,6Z" fill="#3498db"></path></g></g><g><circle cx="269.65432098765433" cy="150" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle><g transform="translate(287.65432098765433,150)" opacity="0.25" style="transition: opacity 0.3s;"><path d="M0,-7 L4,-3 L7,2 L4,7 L-4,7 L-7,2 L-4,-3Z" fill="#9b59b6"></path></g></g><g><circle cx="269.65432098765433" cy="180" r="3" fill="#e84393" opacity="0.8" style="transition: 0.3s;"></circle><g transform="translate(287.65432098765433,180)" opacity="1" style="transition: opacity 0.3s;"><path d="M-7,0 A7,7 0 1,1 7,0 A7,7 0 1,1 -7,0Z" fill="#e84393"></path></g></g><g><circle cx="266.8888888888889" cy="210" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle><g transform="translate(284.8888888888889,210)" opacity="0.25" style="transition: opacity 0.3s;"><path d="M0,-8 L3,-3 L8,0 L3,3 L0,8 L-3,3 L-8,0 L-3,-3Z" fill="#00cec9"></path></g></g><g><circle cx="261.358024691358" cy="240" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle><g transform="translate(279.358024691358,240)" opacity="0.25" style="transition: opacity 0.3s;"><path d="M-7,4 L-3,-6 L3,-6 L7,4 L0,8Z" fill="#fdcb6e"></path></g></g><g><circle cx="253.06172839506172" cy="270" r="3" fill="#6c5ce7" opacity="0.8" style="transition: 0.3s;"></circle><g transform="translate(271.0617283950617,270)" opacity="1" style="transition: opacity 0.3s;"><path d="M0,-7 L8,5 L-8,5Z" fill="#6c5ce7"></path></g></g><g><circle cx="242" cy="300" r="3" fill="#999" opacity="0.2" style="transition: 0.3s;"></circle><g transform="translate(260,300)" opacity="0.25" style="transition: opacity 0.3s;"><path d="M-5,-7 L5,-7 L7,0 L5,7 L-5,7 L-7,0Z" fill="#e17055"></path></g></g></svg>

The model does not call an external tool. Instead, it executes the program directly via its transformer weights, producing an execution trace token by token and streaming results at more than 30k tokens/sec on a CPU.

The key technical idea is a new decoding path for execution traces that turns the model's attention lookups from linear scans into queries that take logarithmic time, enabling millions of correct execution steps inside a single transformer run.

---

## Motivation: LLMs cannot compute

State-of-the-art language models can solve impressively hard mathematics, with systems able to reach gold-medal standard on the International Mathematical Olympiad or even tackle open Math and Science problems.

At the same time, a stubborn gap remains: even state-of-the-art models still stumble on tasks that should be purely computational. They make mistakes even on basic addition, and they fail to solve even simple Sudoku puzzles without outside help. Benchmarks such as Sudoku-Bench make this failure mode especially visible, reporting low unaided solve rates.

In practice, we bridge this gap using two families of workarounds:

- **Tool use:** the model writes code; an external interpreter executes it; the model reports the result. Tool-integrated approaches measurably improve math reasoning.
- **Agentic orchestration:** an outer loop stores intermediate state, decomposes tasks, and repeatedly calls the model on short contexts, effectively bolting a state machine onto the outside.

These approaches are extremely useful but they highlight an important limitation: LLMs do not reliably perform long, exact computations on their own, so in practice we often delegate the execution to external tools or orchestration systems.

An analogy makes the distinction clear. Humans cannot fly. Building airplanes does not change that; it only means we built a machine that flies for us.

Today's language models are in the same situation. When a task requires exact computation, we attach external systems (interpreters, code runners, agent loops) and let those systems do the computing.

But that means the capability still lives outside the model. The model itself is fundamentally handicapped: it cannot carry out the computation it is reasoning about, so it must repeatedly hand the task off to another system.

As a result, the model can describe algorithms, reason about them, or orchestrate tools that run them, but it cannot execute the steps itself. A system that cannot compute cannot truly internalize what computation is.

So the real question is not whether a model can talk about computation, or even access it through tools. The real question is whether it can execute computation internally: reliably, efficiently, and over very long horizons. If it could, it would stop being merely a coordinator of computation and become a computer itself.

---

## How we turned LLMs to computers

On the surface, nothing is broken. The transformer architecture that powers LLMs is incredibly capable. Multiple works have shown that different variants of transformers can carry out complex computations because they can simulate Turing machines and hence any effective computer. Recent work shows that they can even achieve these computational capabilities via training.

But theoretical universality is not the same as practical execution. A model can be expressive enough to simulate a computer and still be a terrible computer in practice. Classical universality results often rely on constructions where simple operations in a real machine correspond to long sequences of steps in the simulated model. In other words, representational capability alone does not guarantee practical execution efficiency.

> We tackle this by implementing a modern RAM computer inside the transformer rather than a purely theoretical model of computation. In our construction, each instruction maps to only a handful of tokens (at most 5).

But even that is not enough. The deeper problem is the decoding process itself.

Transformers have a structural handicap as executors: standard autoregressive decoding makes each step interact with the full accumulated history. A real computer updates a compact state with roughly constant work per instruction. A transformer instead generates one token at a time while continually interacting with a prefix that keeps growing. KV caching avoids recomputing past key/value projections, but decoding still requires attending over the cached prefix, so work per step remains coupled to sequence length.

> We remove this handicap by showing that the same transformer architecture admits an efficient decoding scheme for execution-style traces. The key technical unlock is to restrict lookup heads to head dimension 2, which enables a decoding path where the dominant retrieval/update operations can be computed in log time in the sequence length (for this structured executor regime), rather than by a full prefix-sized attention sweep.

This is powerful enough to let us execute arbitrary programs inside a transformer for millions of steps.

The rest of this post walks through how this works. Feel free to skip ahead:

- [What does computation mean?](https://www.percepta.ai/blog/can-llms-be-computers#but-what-does-computation-mean) — How in-model execution differs from tool use: the transformer runs the program itself, step by step.
- [More demos: Sudoku](https://www.percepta.ai/blog/can-llms-be-computers#more-demos-sudoku) — Executing a compiled solver inside the transformer to solve the Arto Inkala Sudoku, regarded as the hardest Sudoku in the world.
- [How can computation be encoded?](https://www.percepta.ai/blog/can-llms-be-computers#how-can-computation-be-encoded) — Execution as a trace that only appends, and how a transformer reconstructs state by looking back at prior steps.
- [Exponentially Fast Attention](https://www.percepta.ai/blog/can-llms-be-computers#the-key-unlock-exponentially-fast-attention) — The core unlock: 2D heads turn attention into a convex-hull query, enabling log-time decoding over million-step traces.
- [What is next?](https://www.percepta.ai/blog/can-llms-be-computers#so-what-is-next) — Richer attention, training at scale, compiling programs into weights, and growing AI systems like software.

---

## What does computation mean?

These days, when a model needs to compute something, it writes code. For example, to add 3 + 5, a model might output:

```bash
python -c "print(3+5)"
```

Generation then pauses. An external tool-use mechanism intercepts the code block, sends it to a sandboxed interpreter, and injects the result (`8`) back into the token stream. The model resumes, now knowing the answer.

This works, but the actual execution happened outside the model. The model specified the computation, then waited for an external system to carry it out.

Our transformer also emits a program, but instead of pausing for an external tool, it executes that program itself, step by step, within the same transformer.

To achieve this, we implemented a WebAssembly interpreter inside the transformer weights. WebAssembly is a low-level instruction set designed for fast, deterministic execution and a universal target that languages such as C and C++ can compile to. To compute 3 + 5, the model would write:

```bash
{
i32.const 03 00 00 00
i32.const 05 00 00 00
i32.add   00 00 00 00
output    00 00 00 00
}
```

The model then switches to fast decoding mode and executes the program itself, step by step within the same transformer, producing an execution trace of tokens:

```bash
03 00 00 00  commit(+1,sts=1,bt=0)
05 00 00 00  commit(+1,sts=1,bt=0)
08 00 00 00  commit(-1,sts=1,bt=0)
out(08)
halt
```

Each line contains tokens the model generates. The stack grows, the `add` fires, the result is output, and the machine halts, all within the model's own output stream, with no external round-trip.

codeexternal round-tripwasm programexecution trace

Tool useexternal

Let me compute that. \`\`\`python python -c "print(3+5)" \`\`\`

sending code

External interpreter

$ python -c "print(3+5)"

running

returning result

In-model executionours

Let me compute that. { i32.const 03 00 00 00 i32.const 05 00 00 00 i32.add 00 00 00 00 output 00 00 00 00 } 03 00 00 00 commit(+1,sts=1,bt=0) 05 00 00 00 commit(+1,sts=1,bt=0) 08 00 00 00 commit(-1,sts=1,bt=0) out(08) halt The answer is

The key difference is that tool use is opaque: the model hands off control and receives a black-box answer. In-model execution is transparent: every intermediate step appears in the trace, and the model never leaves its own decoding loop.

---

Sudoku is another useful stress test for exact long-horizon computation. Learned neural approaches can achieve strong performance on easy or random Sudokus but completely stumble on the hard ones. A common explanation is that autoregressive models are fundamentally ill-suited for constraint-satisfaction problems because they commit to answers token-by-token and cannot revise early mistakes. But our fully autoregressive system achieves 100% accuracy on these benchmarks, suggesting that the real bottleneck is not the autoregressive paradigm itself — it is that solving hard Sudokus requires very long execution traces, and standard attention makes long-context generation prohibitively expensive. This is exactly the problem our fast attention path addresses.

Our system executes a fully correct compiled Sudoku solver inside the transformer itself. There is no learned heuristic standing in for the algorithm and no gap between "the model suggested a solution" and "an external system verified it". The transformer executes the solver step by step.

The guarantee is universal rather than benchmark-specific: if the compiled solver is correct, the transformer's execution is correct as well. In practice, this lets the model solve even famously hard instances such as Arto Inkala's Sudoku, reaching the correct solution in under 3 minutes.

User

Solve this Sudoku puzzle:

8........

.. 3 6.....

. 7.. 9. 2..

. 5... 7...

.... 4 5 7..

... 1... 3.

.. 1.... 6 8

.. 8 5... 1.

. 9.... 4..

**32,693** tok/s **2,460,476** tokens **7,201** lines/s

Assistant

Puzzle loaded — 21 clues given.

Propagated constraints — 21 of 81 cells resolved so far.

Need to search. Starting depth-first exploration...

Trying 3 at row 8, col 7.

No immediate violations.

Trying 9 at row 7, col 7.

Looks consistent.

Trying 2 at row 8, col 9.

Still consistent.

Trying 1 at row 1, col 7.

No violations so far.

Trying 2 at row 1, col 2.

Contradiction — that doesn't work.

Undoing row 1 col 7. Going back up.

Undoing row 8 col 9. Trying another path.

Trying 2 at row 8, col 5.

Contradiction again.

Trying 2 at row 6, col 5.

That works.

Trying 1 at row 3, col 1.

Contradiction.

Undoing row 6 col 5. Dead end, going back.

Undoing row 7 col 7. Trying a different value.

Trying 6 at row 9, col 3.

Looks good.

Trying 4 at row 3, col 3.

Contradiction.

Trying 4 at row 3, col 8 instead.

8

3

6

7

9

2

4

5

7

4

5

7

1

3

1

6

8

8

5

3

1

9

6

4

---

## How can computation be encoded?

A useful way to picture an autoregressive transformer is as a machine that lives inside its own history. A traditional computer has editable memory that it updates as a result of operations. But in a transformer there is no such thing.

There is a fixed prompt (the input or the program). Then there is a trace that only grows (the tokens the model generates). At each step, the model can only "look back" through a small number of queries (attention heads), and must then append one more token. Through this process we need to find a way to encode a working machine.

To build intuition about this model and how the encoding works, it is helpful to think about the following.

---

### Computation as a trace that only appends

To understand how a transformer can execute a program internally, it helps to think of computation in a slightly unusual way.

Imagine a notebook where every step of a computation is written on the next line. Once written, earlier lines cannot be changed; the notebook only grows.

- The first few lines contain the input (the prompt).
- Each new line records the next step of the computation.
- At every step you are allowed to look back at earlier lines, but you cannot edit them.

This is surprisingly close to how an autoregressive transformer operates: the prompt is the input, the generated tokens form a trace that keeps growing, and each new token is produced after looking back at a small number of positions via attention.

Here is a toy example. Given a sentence, count whether the number of verbs is odd or even. Each trace token attends to exactly two positions: the corresponding input word (to check if it is a verb) and the previous trace token (to read the running parity).

Notice that each step only needs two lookbacks (one into the prompt and one into the trace), regardless of how long the sentence is. This is the key insight: many algorithms can be expressed as a trace that only appends, where each step reads a small, fixed number of earlier positions.

> Can a computation be represented as a trace that only appends, where each step only needs to look back a small number of times?

The answer is yes. In our system the model generates such a trace explicitly. The tokens it produces represent the evolving state of a virtual machine: instruction pointer, memory and stack operations, arithmetic, control flow, and outputs. The model reconstructs the current state simply by looking back to the relevant earlier steps.

In a transformer, the look-back operations are more expressive than simply inspecting past tokens. Each step can also read intermediate states computed while deciding which token to produce — these correspond to the values stored in different attention layers. Think of it this way: each attention head acts like a shared one-dimensional array. When processing a token, the head first writes a single value at some index, then may read a single value at a (potentially different) index — one write followed by at most one read, in that order. Each token reads values published by earlier tokens and publishes values to inform future decisions.

In addition to this read/write primitive, attention can also compute *cumulative sums*. This lets us track quantities like the instruction pointer, operand-stack depth, and call-stack depth as running sums of delta increments. Together, index lookup and summing are enough to run complex computation.

The rest of this post focuses on the efficiency challenge: even if a transformer can represent such an execution trace, standard decoding still pays a growing cost as the trace becomes longer. Our fast decoding path removes that handicap, and the 2D head restriction is the key unlock that makes the fast path possible.

## The key unlock: Exponentially Fast Attention

A real computer runs long programs by updating a compact state (registers, stack, memory) with near-constant work per instruction.

A standard transformer "advances state" by generating tokens, and each next token is computed by attention over a prefix that grows forever. KV caching reuses previously computed keys/values, but it does not remove the basic scaling: at each step the query still has to interact with a cache whose size grows with the number of generated tokens. This is why decoding research often becomes an IO problem: the bottleneck becomes "make the KV cache fast enough and score against it."

But no matter how fast one makes KV caching, the fundamental scaling remains: the $t$ -th decoding step still interacts with a prefix of length $t$. This means work per step grows linearly with the trace length, and the total cost of generating $t$ tokens grows quadratically. This is a well-known bottleneck of transformers and it is an active area of research how to design faster alternatives.

As we'll explain below, our approach addresses the quadratic blow-up and yields exponentially faster attention lookups. Instead of spending $\Theta(t)$ time per step, our method requires $O(\log t)$ time. Here is how it looks in practice, when using our HullKVCache compared to a standard KVCache:

Elapsed: **34.4s**

HullKVCache

**41,709** tok **31,037** tok/s(**6,747** lines/s)

0{

126input\_base 10 04 01 00

252i32.const 00 00 00 00

378local.set 09 00 00 00

504i32.const 00 00 00 00

630local.set 08 00 00 00

756...

882i32.const 00 04 00 00

1007i32.const 25 00 00 00

1133i32.store 00 00 00 00

1259...

1385return d4 fe ff ff

1511}

16371 5 0 00 commit(+0,sts=0,bt=0)

176300 00 00 00 commit(+1,sts=1,bt=0)

188900 00 00 00 commit(-1,sts=0,bt=0)

201500 00 00 00 commit(+1,sts=1,bt=0)

214103 00 00 00 commit(+0,sts=1,bt=0)

2267ee fe ff ff commit(-1,sts=0,bt=1)

239301 00 00 00 commit(+1,sts=1,bt=0)

251900 00 00 00 commit(+1,sts=1,bt=0)

2645branch\_taken

277100 00 00 00 commit(-1,sts=0,bt=0)

289601 00 00 00 commit(+1,sts=1,bt=0)

302200 00 00 00 commit(-2,sts=0,bt=0)

314805 00 00 00 commit(-1,sts=0,bt=0)

327430 00 00 00 commit(+1,sts=1,bt=0)

340000 00 00 00 commit(-1,sts=1,bt=0)

35260a 00 00 00 commit(-1,sts=1,bt=0)

365200 00 00 00 commit(+1,sts=1,bt=0)

377808 00 00 00 commit(+1,sts=1,bt=0)

390408 00 00 00 commit(+1,sts=1,bt=0)

403000 00 00 00 commit(+1,sts=1,bt=0)

415600 00 00 0a commit(+0,sts=1,bt=0)

428208 00 00 00 commit(+1,sts=1,bt=0)

4408branch\_taken

453401 00 00 00 commit(-1,sts=1,bt=0)

466006 00 00 00 commit(+1,sts=1,bt=0)

478503 00 00 00 commit(+1,sts=1,bt=0)

491159 00 00 00 commit(+1,sts=1,bt=0)

50370e 00 00 00 commit(-1,sts=1,bt=0)

5163ff ff ff ff commit(+1,sts=1,bt=0)

528902 04 00 00 commit(+0,sts=0,bt=0)

541504 00 00 00 commit(-1,sts=0,bt=0)

5541f3 ff ff ff commit(+0,sts=0,bt=1)

56673f 00 00 00 commit(+0,sts=0,bt=0)

579319 00 00 00 commit(-1,sts=0,bt=1)

591910 00 00 00 commit(-1,sts=1,bt=0)

604544 00 00 00 commit(+1,sts=1,bt=0)

617101 00 00 00 commit(+1,sts=1,bt=0)

629701 00 00 00 commit(-1,sts=0,bt=0)

6423commit(-1,sts=0,bt=0)

654900 00 00 00 commit(-1,sts=1,bt=0)

6674branch\_taken

680000 00 00 00 commit(-2,sts=0,bt=0)

692607 00 00 00 commit(-1,sts=1,bt=0)

7052c7 fe ff ff return\_commit

7178branch\_taken

73040a 00 00 00 commit(-1,sts=0,bt=0)

743001 00 00 00 commit(+1,sts=1,bt=0)

7556out(31='1')

76821e 00 00 00 commit(-1,sts=1,bt=0)

780816 00 00 00 commit(-1,sts=1,bt=0)

793401 00 00 00 commit(+1,sts=1,bt=0)

806009 00 00 00 commit(+1,sts=1,bt=0)

818625 00 00 00 commit(+1,sts=1,bt=0)

831200 00 00 00 commit(+1,sts=1,bt=0)

8438ee fe ff ff commit(-1,sts=0,bt=1)

85638d 00 00 00 commit(+0,sts=0,bt=0)

868964 00 00 00 commit(+1,sts=1,bt=0)

881502 00 00 00 commit(-1,sts=1,bt=0)

8941halt

Line **9,067** / 9,580Done in 1.3s

KVCache

**13,361** tok **391** tok/s(**85** lines/s)

0{

126input\_base 10 04 01 00

252i32.const 00 00 00 00

378local.set 09 00 00 00

504i32.const 00 00 00 00

630local.set 08 00 00 00

756...

882i32.const 00 04 00 00

1007i32.const 25 00 00 00

1133i32.store 00 00 00 00

1259...

1385return d4 fe ff ff

1511}

16371 5 0 00 commit(+0,sts=0,bt=0)

176300 00 00 00 commit(+1,sts=1,bt=0)

188900 00 00 00 commit(-1,sts=0,bt=0)

201500 00 00 00 commit(+1,sts=1,bt=0)

214103 00 00 00 commit(+0,sts=1,bt=0)

2267ee fe ff ff commit(-1,sts=0,bt=1)

239301 00 00 00 commit(+1,sts=1,bt=0)

251900 00 00 00 commit(+1,sts=1,bt=0)

2645branch\_taken

277100 00 00 00 commit(-1,sts=0,bt=0)

289601 00 00 00 commit(+1,sts=1,bt=0)

Line **2,905** / 9,580258.9s total

HullKVCacheKVCache

<svg viewBox="0 0 600 200" class="w-full" preserveAspectRatio="xMidYMid meet"><g><line x1="60" y1="170" x2="580" y2="170" stroke="currentColor" stroke-opacity="0.08"></line><text x="55" y="173" text-anchor="end" font-size="9" fill="currentColor" fill-opacity="0.4">0s</text></g> <g><line x1="60" y1="134.44444444444446" x2="580" y2="134.44444444444446" stroke="currentColor" stroke-opacity="0.08"></line><text x="55" y="137.44444444444446" text-anchor="end" font-size="9" fill="currentColor" fill-opacity="0.4">10s</text></g> <g><line x1="60" y1="98.88888888888889" x2="580" y2="98.88888888888889" stroke="currentColor" stroke-opacity="0.08"></line><text x="55" y="101.88888888888889" text-anchor="end" font-size="9" fill="currentColor" fill-opacity="0.4">20s</text></g> <g><line x1="60" y1="63.33333333333334" x2="580" y2="63.33333333333334" stroke="currentColor" stroke-opacity="0.08"></line><text x="55" y="66.33333333333334" text-anchor="end" font-size="9" fill="currentColor" fill-opacity="0.4">30s</text></g> <g><line x1="60" y1="27.77777777777777" x2="580" y2="27.77777777777777" stroke="currentColor" stroke-opacity="0.08"></line><text x="55" y="30.77777777777777" text-anchor="end" font-size="9" fill="currentColor" fill-opacity="0.4">40s</text></g> <g><line x1="60" y1="10" x2="60" y2="170" stroke="currentColor" stroke-opacity="0.06"></line><text x="60" y="184" text-anchor="middle" font-size="9" fill="currentColor" fill-opacity="0.4">0</text></g> <g><line x1="175.55555555555554" y1="10" x2="175.55555555555554" y2="170" stroke="currentColor" stroke-opacity="0.06"></line><text x="175.55555555555554" y="184" text-anchor="middle" font-size="9" fill="currentColor" fill-opacity="0.4">10k</text></g> <g><line x1="291.1111111111111" y1="10" x2="291.1111111111111" y2="170" stroke="currentColor" stroke-opacity="0.06"></line><text x="291.1111111111111" y="184" text-anchor="middle" font-size="9" fill="currentColor" fill-opacity="0.4">20k</text></g> <g><line x1="406.66666666666663" y1="10" x2="406.66666666666663" y2="170" stroke="currentColor" stroke-opacity="0.06"></line><text x="406.66666666666663" y="184" text-anchor="middle" font-size="9" fill="currentColor" fill-opacity="0.4">30k</text></g> <g><line x1="522.2222222222222" y1="10" x2="522.2222222222222" y2="170" stroke="currentColor" stroke-opacity="0.06"></line><text x="522.2222222222222" y="184" text-anchor="middle" font-size="9" fill="currentColor" fill-opacity="0.4">40k</text></g> <line x1="60" y1="10" x2="60" y2="170" stroke="currentColor" stroke-opacity="0.15"></line><line x1="60" y1="170" x2="580" y2="170" stroke="currentColor" stroke-opacity="0.15"></line><path d="M60.0,170.0 L83.1,169.6 L106.2,169.3 L129.3,169.1 L152.4,168.9 L175.6,168.7 L198.7,168.4 L221.8,168.2 L244.9,168.0 L268.0,167.8 L291.1,167.6 L314.2,167.4 L337.3,167.2 L360.4,166.9 L383.6,166.7 L406.7,166.5 L429.8,166.3 L452.9,166.1 L476.0,165.8 L499.1,165.6 L522.2,165.4 L542.0,165.2" fill="none" stroke="#06b6d4" stroke-width="2.5"></path><path d="M60.0,170.0 L83.1,160.0 L106.2,149.5 L129.3,135.2 L152.4,116.1 L175.6,94.2 L198.7,68.1 L214.4,47.8" fill="none" stroke="#f59e0b" stroke-width="2.5"></path><g><circle cx="541.9706666666666" cy="165.22133333333332" r="4" fill="#06b6d4"></circle><text x="533.9706666666666" y="155.22133333333332" text-anchor="end" font-size="10" font-weight="bold" fill="#06b6d4">1.3s</text></g> <text x="300" y="198" text-anchor="middle" font-size="10" fill="currentColor" fill-opacity="0.5">tokens generated</text> <text x="12" y="100" text-anchor="middle" font-size="10" fill="currentColor" fill-opacity="0.5" transform="rotate(-90, 12, 100)">time (s)</text></svg>

In the workloads we care about (long execution traces where the model repeatedly performs a small number of structured lookups per step), the difference in scaling per step compounds.

A linear scan decoder pays a cost that keeps growing as the trace grows. A hull-based decoder keeps the cost per step essentially tied to a retrieval primitive that runs in logarithmic time. Over long horizons, that changes what is feasible: computations that would be impractically slow under standard decoding become runnable for millions of steps.

This is also why the payoff shows up most clearly on "boring" deterministic spans: exact copying, state-machine stepping, or long mechanical traces. These are precisely the steps where we do not want to spend full attention budget.

### The fast path: 2D attention

We obtain this speed-up by reframing the question. We are not attempting to speed up transformers in full generality, nor do we want to introduce yet another architecture.

Instead, we focus on vanilla transformers but under a tractable parameterization. We specifically target the case where the dimension of the heads is small: 2D.

This does not mean that the whole transformer is small. You can still have an arbitrarily large number of layers, arbitrarily many heads and arbitrarily large embeddings. It just means that the embeddings used across layers of a transformer are broken into smaller chunks resulting in more heads $n_\text{heads} = d_\text{model} / 2$.

Of course, this restriction can come at a cost for certain tasks and is not the magic answer to everything. While we are still exploring how limiting this is in practice for training, say, large models, we find that it is still flexible enough to train efficiently and can capture very complicated logic.

In fact, for Turing completeness, 2D attention is all you need! And it is still flexible enough to represent a whole RAM computer as we show in this blog. It is a crucial enabler of building a fast-path in transformers. While abstract reasoning and planning remain part of the original path, heavy computational tasks can go through the fast path.

The model itself is a completely standard PyTorch transformer, nothing exotic:

```python
class VanillaTransformer(nn.Module):
    def __init__(self, vocab, d_model=36, n_heads=18, n_layers=7, d_ffn=36):
        super().__init__()
        self.tok = nn.Embedding(vocab, d_model)
        self.attn = nn.ModuleList([
            nn.MultiheadAttention(d_model, n_heads, batch_first=True, bias=False)
            for _ in range(n_layers)
        ])
        self.ff_in  = nn.ModuleList([nn.Linear(d_model, 2*d_ffn, bias=False) for _ in range(n_layers)])
        self.ff_out = nn.ModuleList([nn.Linear(d_ffn, d_model, bias=False) for _ in range(n_layers)])
        self.head = nn.Linear(d_model, vocab, bias=False)

    def forward(self, idx):
        T = idx.shape[1]
        x = self.tok(idx) + pos_emb(T)
        causal = torch.triu(torch.ones(T, T, device=idx.device, dtype=torch.bool), diagonal=1)
        for attn, ff_in, ff_out in zip(self.attn, self.ff_in, self.ff_out):
            y, _ = attn(x, x, x, attn_mask=causal, need_weights=False)
            x = x + y
            gate, val = ff_in(x).chunk(2, dim=-1)
            x = x + ff_out(F.relu(gate) * val)
        return self.head(x)
```

Notice: `d_model = 36` with `n_heads = 18` gives exactly 2D per head. The architecture uses 7 layers, standard `nn.MultiheadAttention`, and a gated feed-forward network. No custom attention kernels, no sparse masks; just vanilla PyTorch. The only thing that makes it special is the weights.

Let's look at how 2D attention gets us these impressive speed-ups.

### The geometric view of 2D attention

Step 5/15insert

<svg viewBox="0 0 400 400" class="w-full max-w-md mx-auto" style="touch-action: none;"><g><line x1="86.66666666666666" y1="30" x2="86.66666666666666" y2="370" stroke="currentColor" stroke-opacity="0.06" stroke-width="1"></line><line x1="30" y1="313.33333333333337" x2="370" y2="313.33333333333337" stroke="currentColor" stroke-opacity="0.06" stroke-width="1"></line></g><g><line x1="143.33333333333331" y1="30" x2="143.33333333333331" y2="370" stroke="currentColor" stroke-opacity="0.06" stroke-width="1"></line><line x1="30" y1="256.66666666666663" x2="370" y2="256.66666666666663" stroke="currentColor" stroke-opacity="0.06" stroke-width="1"></line></g><g><line x1="200" y1="30" x2="200" y2="370" stroke="currentColor" stroke-opacity="0.15" stroke-width="1.5"></line><line x1="30" y1="200" x2="370" y2="200" stroke="currentColor" stroke-opacity="0.15" stroke-width="1.5"></line></g><g><line x1="256.66666666666663" y1="30" x2="256.66666666666663" y2="370" stroke="currentColor" stroke-opacity="0.06" stroke-width="1"></line><line x1="30" y1="143.33333333333331" x2="370" y2="143.33333333333331" stroke="currentColor" stroke-opacity="0.06" stroke-width="1"></line></g><g><line x1="313.33333333333337" y1="30" x2="313.33333333333337" y2="370" stroke="currentColor" stroke-opacity="0.06" stroke-width="1"></line><line x1="30" y1="86.66666666666666" x2="370" y2="86.66666666666666" stroke="currentColor" stroke-opacity="0.06" stroke-width="1"></line></g><g transform="translate(290.66666666666663,83.83333333333334) scale(1)"><circle cx="0" cy="0" r="5.5" fill="rgba(234,179,8,1)" stroke="currentColor" stroke-opacity="0.2" stroke-width="1.5" style="transition: fill 0.5s, r 0.3s, stroke 0.5s;"></circle><text x="0" y="-12" text-anchor="middle" font-size="10" font-weight="600" fill="currentColor" fill-opacity="0.6" style="transition: fill-opacity 0.5s;">k <tspan font-size="8" dy="2">1</tspan></text> <text x="0" y="16" text-anchor="middle" font-size="9" font-weight="600" fill="rgba(22,163,74,0.75)" style="transition: fill 0.5s;">v <tspan font-size="7" dy="1.5">1</tspan> <tspan dy="-1.5">=</tspan> <tspan>7</tspan></text></g> <g transform="translate(129.16666666666669,92.33333333333334) scale(1)"><circle cx="0" cy="0" r="5.5" fill="rgba(234,179,8,1)" stroke="currentColor" stroke-opacity="0.2" stroke-width="1.5" style="transition: fill 0.5s, r 0.3s, stroke 0.5s;"></circle><text x="0" y="-12" text-anchor="middle" font-size="10" font-weight="600" fill="currentColor" fill-opacity="0.6" style="transition: fill-opacity 0.5s;">k <tspan font-size="8" dy="2">2</tspan></text> <text x="0" y="16" text-anchor="middle" font-size="9" font-weight="600" fill="rgba(22,163,74,0.75)" style="transition: fill 0.5s;">v <tspan font-size="7" dy="1.5">2</tspan> <tspan dy="-1.5">=</tspan> <tspan>3</tspan></text></g> <g transform="translate(327.5,234) scale(1)"><circle cx="0" cy="0" r="5.5" fill="rgba(234,179,8,1)" stroke="currentColor" stroke-opacity="0.2" stroke-width="1.5" style="transition: fill 0.5s, r 0.3s, stroke 0.5s;"></circle><text x="0" y="-12" text-anchor="middle" font-size="10" font-weight="600" fill="currentColor" fill-opacity="0.6" style="transition: fill-opacity 0.5s;">k <tspan font-size="8" dy="2">3</tspan></text> <text x="0" y="16" text-anchor="middle" font-size="9" font-weight="600" fill="rgba(22,163,74,0.75)" style="transition: fill 0.5s;">v <tspan font-size="7" dy="1.5">3</tspan> <tspan dy="-1.5">=</tspan> <tspan>9</tspan></text></g> <g transform="translate(86.66666666666666,279.33333333333337) scale(1)"><circle cx="0" cy="0" r="5.5" fill="rgba(234,179,8,1)" stroke="currentColor" stroke-opacity="0.2" stroke-width="1.5" style="transition: fill 0.5s, r 0.3s, stroke 0.5s;"></circle><text x="0" y="-12" text-anchor="middle" font-size="10" font-weight="600" fill="currentColor" fill-opacity="0.6" style="transition: fill-opacity 0.5s;">k <tspan font-size="8" dy="2">4</tspan></text> <text x="0" y="16" text-anchor="middle" font-size="9" font-weight="600" fill="rgba(22,163,74,0.75)" style="transition: fill 0.5s;">v <tspan font-size="7" dy="1.5">4</tspan> <tspan dy="-1.5">=</tspan> <tspan>2</tspan></text></g> <g transform="translate(228.33333333333334,327.5) scale(1)"><circle cx="0" cy="0" r="12" fill="none" stroke="rgba(234,179,8,1)" stroke-width="2" stroke-opacity="0.5" stroke-dasharray="3 3"></circle><circle cx="0" cy="0" r="5.5" fill="rgba(234,179,8,1)" stroke="currentColor" stroke-opacity="0.2" stroke-width="1.5" style="transition: fill 0.5s, r 0.3s, stroke 0.5s;"></circle><text x="0" y="-12" text-anchor="middle" font-size="10" font-weight="600" fill="currentColor" fill-opacity="0.6" style="transition: fill-opacity 0.5s;">k <tspan font-size="8" dy="2">5</tspan></text> <text x="0" y="16" text-anchor="middle" font-size="9" font-weight="600" fill="rgba(22,163,74,0.75)" style="transition: fill 0.5s;">v <tspan font-size="7" dy="1.5">5</tspan> <tspan dy="-1.5">=</tspan> <tspan>5</tspan></text></g> <g><defs><linearGradient id="score-gradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="rgba(59,130,246,1)"></stop><stop offset="50%" stop-color="rgba(234,179,8,1)"></stop><stop offset="100%" stop-color="rgba(220,38,38,1)"></stop></linearGradient></defs><rect x="150" y="8" width="100" height="8" rx="3" fill="url(#score-gradient)"></rect><text x="145" y="15" text-anchor="end" font-size="8" fill="currentColor" fill-opacity="0.4">low q·k</text> <text x="255" y="15" text-anchor="start" font-size="8" fill="currentColor" fill-opacity="0.4">high q·k</text></g></svg>

Insert k <sub>5</sub>

#### Winner

Inserting…

#### Top scores

—

**5** / 15 keys inserted

The attention mechanism works as follows:

- each past token contributes a key vector $k_j$ and a value $v_j$,
- the current step forms a query vector $q$,
- relevance scores are computed for every key $q \cdot k_j$, and
- the head returns the sum of values of all keys reweighted by the softmax of their scores.

In the special case that matters for our fast path:

- each key is 2D, $k_j \in \mathbb{R}^2$,
- the query $q \in \mathbb{R}^2$ can be thought of as a direction in the plane,
- and we want the value of the point that maximizes the dot product in that direction (hard-max attention). In case of ties, we compute the average.

Despite the maximization queries being global over the whole history, there exist efficient data-structures that can answer such 2D attention queries in logarithmic time in the number of points. That is exactly the classic "supporting point" query in computational geometry: given a direction $q$, find the point on the convex hull furthest in that direction. We speed up decoding by maintaining such a data-structure as tokens get generated which lets us efficiently search over the whole set of past points.

Restricting the head dimension to 2 is what enables the fast path: during inference we can replace a brute force scan ("score against every key") with a structure where the maximum can be found by looking only at a tiny subset of points in the hull.

To implement memory and stack operations, we need each attention head to answer the query "give me the value most recently stored at index $i$." This index lookup is what requires 2D keys.

Store every index $j$ as the 2D key $k_j = (2j, -j^2)$. Looking up index $i$ then amounts to querying in direction $q = (i, 1)$, since

$$
\arg\max_{j} \{ (2j, -j^2) \cdot (i,1) \} = i
$$

The quadratic term $-j^2$ acts as a penalty that grows for any $j \neq i$, ensuring only the exact match wins the argmax.

Attention can also compute cumulative sums, which we use to track quantities like the instruction pointer and stack depth. If all keys are set to the same value, attention averages all values uniformly, and multiplying by the current token position $t$ recovers the actual sum. This only requires 1D (or even 0D) keys — it is index lookup that forces us to 2D.

---

## So what is next?

We showed that a transformer can become a computer, and that opens a new interface between software and neural networks. Once programs can run efficiently inside the model's own inference loop, a much larger design space opens up.

### Richer attention mechanisms

For simplicity, our construction uses hard-max attention. But that is not a fundamental restriction. While we do not yet know whether exact softmax attention can be maintained with the same efficiency, it is easy to approximate it with k-sparse softmax attention: retrieve the top- $k$ keys and perform the softmax only over those. By storing points across nested convex hulls, this yields a decoding cost of $O(k + \log n)$.

This means the geometric fast path is not limited to our executor construction. In principle, it can accelerate any transformer with 2D heads at decoding time, replacing full linear scans with efficient geometric retrieval. The same machinery also extends naturally to 3D heads via 3D convex hulls, although higher dimensions quickly become less efficient. The key question is whether 2D already captures most of the speedup, or whether slightly larger heads unlock substantially more capability.

<svg viewBox="0 0 320 200" class="w-full max-w-xs"><polygon points="50,20 170,15 260,50 280,130 230,175 90,180 30,150 20,70" fill="none" stroke="currentColor" stroke-opacity="0.15" stroke-width="1.5" stroke-dasharray="1px 1px" pathLength="1" stroke-dashoffset="0px"></polygon><polygon points="100,55 190,50 230,90 210,150 130,155 70,120 75,75" fill="none" stroke="currentColor" stroke-opacity="0.1" stroke-width="1" stroke-dasharray="1px 1px" pathLength="1" stroke-dashoffset="0px"></polygon><polygon points="110,90 140,80 180,100 160,120 120,110" fill="none" stroke="currentColor" stroke-opacity="0.08" stroke-width="1" stroke-dasharray="1px 1px" pathLength="1" stroke-dashoffset="0px"></polygon><line x1="150" y1="100" x2="280" y2="55" stroke="#06b6d4" stroke-width="2" stroke-dasharray="1px 1px" pathLength="1" stroke-dashoffset="0px"></line><polygon points="285.66991644064154,53.037336616701005 275.90021426599765,61.49859653581224 272.75995285271927,52.426730230785765" fill="#06b6d4" opacity="1"></polygon><text x="276" y="45" font-size="11" fill="#06b6d4" font-weight="600" font-style="italic">q</text> <circle cx="50" cy="20" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="170" cy="15" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="260" cy="50" r="5" fill="#06b6d4" fill-opacity="1" opacity="1"></circle><circle cx="280" cy="130" r="5" fill="#06b6d4" fill-opacity="1" opacity="1"></circle><circle cx="230" cy="175" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="90" cy="180" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="30" cy="150" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="20" cy="70" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="100" cy="55" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="190" cy="50" r="5" fill="#06b6d4" fill-opacity="1" opacity="1"></circle><circle cx="230" cy="90" r="5" fill="#06b6d4" fill-opacity="1" opacity="1"></circle><circle cx="210" cy="150" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="130" cy="155" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="70" cy="120" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="75" cy="75" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="140" cy="80" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="160" cy="120" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="120" cy="110" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="180" cy="100" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><circle cx="110" cy="90" r="3" fill="currentColor" fill-opacity="0.25" opacity="1"></circle><text x="160" y="196" font-size="9" fill="currentColor" fill-opacity="0.35" text-anchor="middle">outer hull · inner hull · top-k points</text></svg>

**k-sparse softmax** retrieves the top‑ *k* keys from **nested convex hulls** and applies softmax only over those — cost **O(k + log n)**.

The same geometric machinery extends to **3D heads** via 3D convex hulls.

### Training large models with 2D heads

The 2D-head parameterization used here is not inherently small. The total parameter count can remain comparable to standard transformers because the model can simply use more heads and layers. The real question is how capable such models become when trained at scale.

That question matters even beyond pure capability. These models could be useful in several modes: as a dedicated fast path paired with a slower, more general model; as part of a fast/slow hybrid architecture inside a single system; or as a speculative execution model that proposes tokens quickly while a regular-attention model verifies and accepts them. Regardless of their eventual capability ceiling, they already suggest a powerful systems primitive for speeding up larger models.

Standard transformer

4 heads × d\_h = 64

d\_model = 256

2D-head transformer

128 heads × d\_h = **2**

d\_model = 256 (same budget)

Deployment modes

Fast path

Dedicated executor for heavy computation

Fast / slow hybrid

2D heads handle execution while full-dim heads reason

Speculative decoding

2D model proposes tokens; a larger model verifies

The system presented here is a standalone transformer designed as an executor. A natural next step is to combine it with a large language model and train the model to invoke this execution pathway when exact computation is required. In such a hybrid system the language model would plan and reason, while the execution component would run algorithms.

Because the execution trace is part of the forward pass, the whole process remains differentiable: we can even propagate gradients through the computation itself. That makes this fundamentally different from an external tool. It becomes a trainable computational substrate that can be integrated directly into a larger model.

### Programs into weights & training beyond gradient descent

In our current prototype the model learns an interpreter whose behavior is encoded in its weights. But the compilation machinery we built for generating those weights can go further. In principle, arbitrary programs can be compiled directly into the transformer weights, bypassing the need to represent them as token sequences at all.

That would make weights themselves a deployment target for software. Instead of merely learning software-like behavior, models could literally contain compiled program logic as part of their internal circuitry.

C source

int fib(int n) {

int a=0, b=1;

for (int i=0;

i<n; i++) {

int t = a+b;

a = b; b = t;

}

return a;

}

compile

Transformer weights

W <sub>Q</sub>, W <sub>K</sub>, W <sub>V</sub>, W <sub>O</sub>, W <sub>ff</sub>

Weights become a deployment target: instead of learning software-like behavior, models **contain** compiled program logic.

If logic can be compiled into weights, then gradient descent is no longer the only way to modify a model. Weight compilation provides another route for inserting structure, algorithms, and guarantees directly into a network.

Taken seriously, this suggests a different picture of training altogether: not just optimizing weights with data, but also writing parts of the model directly. Push that idea far enough and you get systems that do not merely learn from experience, but also modify or extend their own weights, effectively rewriting parts of their internal machinery.

### Growing AI systems like software

Finally, if software becomes part of the neural architecture, then AI systems need a way to grow over time much like software libraries do today. Modern software ecosystems evolve by accumulating modules, abstractions, and reusable components. A similar process may eventually occur inside AI systems, where new computational abilities are added incrementally to the model's internal execution engine.

<svg viewBox="0 0 370 290" class="w-full max-w-sm"><path d="M185,16 C200,14 218,18 232,12 C252,4 272,16 280,30 C290,46 310,42 320,58 C332,78 330,100 326,112 C322,128 332,148 324,168 C316,188 308,198 300,210 C290,226 278,244 260,254 C240,266 218,270 200,272 C180,274 158,270 140,260 C120,250 108,238 96,222 C82,204 68,196 58,178 C46,156 40,140 38,120 C36,100 40,78 52,62 C64,44 78,36 92,30 C108,22 124,14 142,12 C160,10 172,16 185,16 Z" fill="currentColor" fill-opacity="0.025" stroke="currentColor" stroke-opacity="0.12" stroke-width="2.5"></path><line x1="195" y1="140" x2="140" y2="72" stroke="currentColor" stroke-opacity="0.12" stroke-width="1" opacity="1"></line><line x1="195" y1="140" x2="268" y2="80" stroke="currentColor" stroke-opacity="0.12" stroke-width="1" opacity="1"></line><line x1="195" y1="140" x2="100" y2="170" stroke="currentColor" stroke-opacity="0.12" stroke-width="1" opacity="1"></line><line x1="195" y1="140" x2="280" y2="170" stroke="currentColor" stroke-opacity="0.12" stroke-width="1" opacity="1"></line><line x1="195" y1="140" x2="200" y2="228" stroke="currentColor" stroke-opacity="0.12" stroke-width="1" opacity="1"></line><line x1="140" y1="72" x2="100" y2="170" stroke="currentColor" stroke-opacity="0.12" stroke-width="1" opacity="1"></line><line x1="268" y1="80" x2="280" y2="170" stroke="currentColor" stroke-opacity="0.12" stroke-width="1" opacity="1"></line><line x1="100" y1="170" x2="200" y2="228" stroke="currentColor" stroke-opacity="0.12" stroke-width="1" opacity="1"></line><line x1="72" y1="110" x2="195" y2="140" stroke="#0ea5e9" stroke-opacity="0.35" stroke-width="1.5" stroke-dasharray="5 4" opacity="1"></line><line x1="72" y1="110" x2="140" y2="72" stroke="#0ea5e9" stroke-opacity="0.35" stroke-width="1.5" stroke-dasharray="5 4" opacity="1"></line><line x1="72" y1="110" x2="100" y2="170" stroke="#0ea5e9" stroke-opacity="0.35" stroke-width="1.5" stroke-dasharray="5 4" opacity="1"></line><g opacity="1"><rect x="165" y="128" width="60" height="24" rx="6" fill="#f1f5f9" stroke="#64748b" stroke-width="1.2"></rect><text x="195" y="141" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="bold" fill="#64748b">core</text></g> <g opacity="1"><rect x="110" y="60" width="60" height="24" rx="6" fill="#ecfeff" stroke="#0891b2" stroke-width="1.2"></rect><text x="140" y="73" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="bold" fill="#0891b2">math</text></g> <g opacity="1"><rect x="238" y="68" width="60" height="24" rx="6" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1.2"></rect><text x="268" y="81" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="bold" fill="#7c3aed">sorting</text></g> <g opacity="1"><rect x="70" y="158" width="60" height="24" rx="6" fill="#ecfdf5" stroke="#059669" stroke-width="1.2"></rect><text x="100" y="171" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="bold" fill="#059669">graph</text></g> <g opacity="1"><rect x="250" y="158" width="60" height="24" rx="6" fill="#fffbeb" stroke="#d97706" stroke-width="1.2"></rect><text x="280" y="171" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="bold" fill="#d97706">crypto</text></g> <g opacity="1"><rect x="170" y="216" width="60" height="24" rx="6" fill="#fff1f2" stroke="#e11d48" stroke-width="1.2"></rect><text x="200" y="229" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="bold" fill="#e11d48">DSP</text></g> <g opacity="1"><rect x="42" y="98" width="60" height="24" rx="6" fill="#f0f9ff" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="4 3"></rect><text x="72" y="111" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="bold" fill="#0ea5e9">new</text></g></svg>

Just as software ecosystems grow by accumulating **modules**, AI systems can add computational abilities incrementally — each one compiled into the model's internal execution engine.

New capabilities connect to the existing circuit without retraining the whole system.

Our work shows that transformers can execute programs efficiently inside their own inference loop. The broader vision is that future AI systems will not just use software; they will contain it, integrating learned representations with compiled algorithms inside a single computational substrate. In that world, software itself becomes part of the model.

## Closing thoughts

We showed that transformers can execute programs efficiently inside their own inference loop, not as an external tool, but as part of the model itself. This opens a path toward AI systems that integrate learned representations with compiled algorithms inside a single computational substrate.

We think this matters because the hardest problems we care about, sequential decision-making under uncertainty in healthcare, supply chains, and financial institutions, will require systems that can both reason flexibly and compute reliably.

We are building these systems now, and we are hiring. If you want to work on problems at the intersection of language models, reinforcement learning, and real-world decision systems, [join us](https://jobs.ashbyhq.com/percepta).