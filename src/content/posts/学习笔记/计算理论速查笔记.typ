#metadata((
  title: "Theory of Computation Quick Reference Notes",
  published: "2026-09-29",
  description: "计算理论基础重点知识整理",
  tags: ("计算理论",),
  category: "学习笔记",
  draft: true,
))<frontmatter>

== Theory of Computation
- (Models) What is computation?
- (Computability) What can be computed?
- (Complexity) What can be computed efficiently?

== Complexity Notation
#table(
  columns: 2,
  stroke: none,
  align: center,
  column-gutter: 1.5em,
  [Notation], [Analogy],
  table.hline(stroke: 0.5pt),
  $f(n) = O(g(n))$, $<=$,
  $f(n) = o(g(n))$, $<$,
  $f(n) = Omega(g(n))$, $>=$,
  $f(n) = omega(g(n))$, $>$,
  $f(n) = Theta(g(n))$, $approx$,
  $f(n) = theta(g(n))$, $=$,
)

- *Big O notation*: Let $f, g : RR → RR$. We write $f(x) = O(g(x))$ if $(exists c > 0)(exists N)(forall x ≥ N)(|f(x)| ≤ c dot |g(x)|)$.
- *$O_y$ notation*: Let $f : RR^2 → RR$ and $g : RR → RR$. We write $f(x, y) = O_y (g(x))$ if $(forall y)(exists c = c(y) > 0)(exists N = N(y))(forall x ≥ N)(|f(x, y)| ≤ c dot |g(x)|)$, that is, the constant $c$ and the threshold $N$ may depend on $y$.
- *$tilde(O)$ notation*: Let $f, g : RR → RR$. We write $f(x) = tilde(O)(g(x))$ if $(exists c > 0)(exists N)(forall x ≥ N)(|f(x)| ≤ (log x)^c dot |g(x)|)$. In other words, $tilde(O)$ hides polylogarithmic ($log^(O(1)) n$) terms.

== Alphabets and Languages

- *Alphabet* (字母表) : An alphabet is a set of symbols.
 - *Binary alphabet* (二进制字母表) : ${0,1}$.
- *String* (字符串) : A string over an alphabet is a finite sequence of symbols from the alphabet.
 - *Empty string* (空串) : $ϵ$.
 - *Length* (长度) : The length of a string is its length as a sequence. Denote the length of a string $w$ by $|w|$.
 - *$Σ^*$*: the set of all strings over an alphabet $Σ$.
 - *$Σ^n$*: the set of strings of length $n$ over an alphabet $Σ$.
 - *Concatenation* (连接) : Two strings over the same alphabet can be combined to form a third by the operation of concatenation. The concatenation of strings $x$ and $y$ is denoted by $x y$.
- *Language* (语言) : A language is a set of strings over an alphabet, denoted by $L in Σ^*$.
 - Since languages are sets, the usual set operations apply: *union* ($∪$, 并) , *intersection* ($∩$, 交) , and *difference* ($\\$, 差) .
 - *Complement* (补) : Let $L in Σ^*$. The complement of $L$, denoted by $macron(L)$, is $Σ^* \\ L$.
 - *Concatenation* (连接) : If $L_1$, $L_2$ are languages, the concatenation of $L_1$ and $L_2$ is defined by $L_1 L_2 "or" L_1∘L_2 = {w = x y : x in L_1, y in L_2}$.
 - *Kleene star* (Kleene 星号) : Let $L in Σ^*$. The Kleene star of $L$ is defined by $L^∗ = {w = w_1 ... w_k : k ≥ 0, w_i in L}$.
 - *Kleene plus* (Kleene 加号) : We write $L^+$ for the language $L L^∗$. Equivalently, $L^+ = {w = w_1 ... w_k : k ≥ 1, w_i in L}$.

== Problem Encodings

- *Decision problem* (判定问题) : asks a yes/no question about the input. It can be represented as a language $L ⊆ Σ^*$, where the answer for input $x$ is yes if $x ∈ L$, and no if $x ∉ L$.
 - *Reduction to decision problems*: computation, search, and optimization problems can all be reduced to decision problem.
- *Computation problem* (计算问题) : asks to compute some output from the input, not just a yes/no answer. It can be represented as a partial function (部分函数) $f : Σ^* → Σ^* ∪ {"undefined"}$.
 - *Reducing computation to decision*: Let $f : Σ^* → Σ^*$. Define $L_f = {(x, i, b) : "the" i"-th bit of" f(x) "is" b}$. We can compute $f(x)$ by making $O(|f(x)|)$ queries to an oracle for $L_f$, one query per bit of $f(x)$. So solving the decision problem $L_f$ lets us solve the computation problem $f$.
- *Search problem* (搜索问题) : asks to find a solution satisfying some property. Formally, given $x ∈ {0,1}^*$, find $y ∈ {0,1}^*$ such that $R(x,y)$ holds, where $R$ is a relation.
 - *Reducing search to decision*: Define $L_R = {(x, y_p) : y_p "is a prefix of some" y "satisfying" R(x,y)}$. Once $L_R$ can be decided, we can find $y$ by $O(|y|)$ queries, extending the prefix $y_p$ one bit at a time.
- *Optimization problem* (优化问题) : asks to find a solution that maximizes or minimizes some objective. Formally, $"OPT"(x) = max {c(x,y) : R(x,y)}$, where $R$ is a relation and $c$ is a cost function.
 - *Reducing optimization to decision*: Define $L_"OPT" = {(x, k) : exists y "such that" R(x,y) "and" c(x,y) ≥ k}$. By binary search, $"OPT"(x)$ can be computed by making $O(|"OPT"(x)|)$ queries to $L_"OPT"$.
- *Reasonable encoding*: we only consider encodings that are polynomial-time interconvertible. Under this restriction, the choice of encoding does not affect the complexity class a problem belongs to.

== Finite Automata

- The Finite automaton is the simplest computation model, one without memory.
- A *Finite automaton* (有限自动机) is a 5-tuple $(Q, Σ, δ, q_0, F)$, where
 - $Q$ is a finite set called the *states* (状态) .
 - $Σ$ is a finite set called the *alphabet* (字母表) .
 - $δ$ is the *transition function* (转移函数) .
 - $q_0 ∈ Q$ is the *start state* (初始状态) .
 - $F ⊆ Q$ is the set of *accept states* (接受状态) .
- *Deterministic Finite Automaton* (*DFA*, 确定型有限自动机) : $δ "is" Q times Σ → Q$.
- *Non-deterministic Finite Automaton* (*NFA*, 非确定型有限自动机) : $δ "is" Q times Σ → 2^Q$.
 - *$ϵ$-arrow* ($ϵ$-转移) : $δ "is" Q times (Σ ∪{ε}) → 2^Q$. It allows the NFA to change state without reading any input symbol.
- *Accepting a string*: Let $M = (Q, Σ, δ, q_0, F)$ be a finite automaton and $w = w_1 w_2 ... w_n$ a string where each $w_i ∈ Σ$. $M$ *accepts* $w$ if there exists a sequence of states $r_0, r_1, ..., r_n ∈ Q$ such that
 - $r_0 = q_0$,
 - $δ(r_i, w_(i+1)) = r_(i+1)$, for $i = 0, 1, ..., n-1$,
 - $r_n ∈ F$.
- *Accepting a language*: If $L$ is the set of all strings that a finite automaton $M$ accepts, we say $M$ *recognizes* (识别) or *accepts* (接受) $L$, and we write $L(M) = L$.
- *Equivalence of NFAs and DFAs* : Use the *power set* (幂集) . An NFA may be in several states at once, so the DFA tracks the set of all states the NFA could currently be in. A state of the new DFA is therefore a set of NFA states, i.e., an element of $cal(P)(Q)$.

== Regular Language

- *Regular language* (正则语言) : A language is called a regular language if some finite automaton recognizes it.
 - $"Regular Languages" ⊂ "P" ⊂ "Decidable Languages" ⊂ "All Languages"$.
- *Regular operations* (正则运算) : union, intersection, difference, complement, concatenation, star...
- *Closure property* (闭包性质) of regular languages : if $L_1, L_2$ are regular languages, then so are $macron(L)$, $L_1 ∪ L_2$, $L_1 ∩ L_2$, $L_1 ∘ L_2$, $L_1^*$, and $L_1 \\ L_2$. Each closure is proved by constructing a finite automaton that recognizes the resulting language.
 - *Closure under union and intersection*: Use the *Cartesian product* (笛卡尔积) construction.
 - *Closure under concatenation*: Connect every accept state of $N_1$ to the start state of $N_2$ by an $ϵ$-arrow, so that $N$ may switch from the $N_1$ part to the $N_2$ part after having read any $x in L_1$.
 - *Closure under star*: Add $ϵ$-arrows from every accept state back to the start state so that the machine may repeat the loop any number of times.

== Nonregular Languages

- *Almost all languages are non-regular*: Every regular language is described by some DFA, and each DFA can be encoded as a finite string. Since there are only countably many such strings, there are only countably many regular languages. The set of all languages is $cal(P)(Σ^*)$, and since $Σ^*$ is countably infinite, $|cal(P)(Σ^*)| = 2^(aleph_0)$, which is uncountable. Since $aleph_0 < 2^(aleph_0)$, almost all languages are non-regular.
- *Pumping lemma* (泵引理) : If $L$ is a regular language, then there exists $p in NN$ such that, for any string $s in L$ with $|s| ≥ p$, we can write $s = x y z$, where $x, y, z in Σ^*$, such that
 - $x y^i z in L$ for all $i ≥ 0$,
 - $|y| > 0$, and
 - $|x y| ≤ p$.
- *Applying the pumping lemma*: The lemma is a tool to *disprove* regularity: assume $L$ is regular, then pump a long string $s in L$ and show that some $x y^i z$ falls outside the language -- a contradiction.

== Regular Expressions

- *Regular expression* (*regex*, *RE*, 正则表达式) : an intuitive way to describe patterns in strings. Practical regex tools are built on (and extend) it, and it describes exactly the regular languages.
- *Syntax* (语法) : $R$ is a regular expression if $R$ is
 1. a symbol $s$, for some $s in Σ$,
 2. $ϵ$,
 3. $∅$,
 4. $(R_1 ∪ R_2)$, where $R_1, R_2$ are regular expressions,
 5. $(R_1 R_2)$, where $R_1, R_2$ are regular expressions,
 6. $(R_1)^*$, where $R_1$ is a regular expression.
- *Semantics* (语义) : The *language* $L(R)$ of a regular expression $R$ is defined by
 1. $L(s) = {s}$, for $s in Σ$,
 2. $L(ϵ) = {ϵ}$,
 3. $L(∅) = ∅$,
 4. $L(R_1 ∪ R_2) = L(R_1) ∪ L(R_2)$,
 5. $L(R_1 R_2) = L(R_1) ∘ L(R_2)$,
 6. $L(R_1^*) = L(R_1)^*$.
- *Theorem*: A language is regular if and only if some regular expression describes it.
 - *Regular expression → NFA*: Build the NFA by induction, following how the regular expression is built. Three base cases (a single symbol, $ϵ$, $∅$) and three ways to combine smaller NFAs (union, concatenation, star) -- exactly the closure constructions.
 - *DFA/NFA → regular expression*: Convert the NFA into a *generalized NFA* (*GNFA*, 广义 NFA) , whose arrows are labeled by regular expressions, then remove states one by one until only $q_"start"$ and $q_"accept"$ remain; the label on the last arrow is the answer.

== Turing Machines

- *Hilbert's program* (希尔伯特纲领) : After the crisis in the foundations of mathematics around 1900 (e.g. Russell's paradox, 1901), Hilbert's answer in the 1920s was to *formalize all of mathematics*: a fixed list of axioms (公理) and rules of inference (推理规则) , in which a proof is a finite string of symbols, checkable mechanically. The goal was to show that mathematics is *complete*, *consistent*, and *decidable*.
#table(
  columns: 3,
  stroke: none,
  align: center,
  column-gutter: 1.2em,
  [Hilbert's goal], [Answer], [Who],
  table.hline(stroke: 0.5pt),
  [Complete?], [No], [Gödel, 1931],
  [Consistent (provably)?], [No], [Gödel, 1931],
  [Decidable?], [No], [Turing / Church, 1936],
)
- *The Entscheidungsproblem* (判定问题, Hilbert & Ackermann, 1928) : Is there an algorithm that, given any statement of first-order logic, decides whether it is provable?
 - To answer "yes" it suffices to write down one algorithm; to answer "no" one must rule out *every* possible algorithm, which needs a *precise definition of "algorithm"* -- and that is exactly what the Turing machine supplies.
- *Turing machine* (*TM*, 图灵机) : a 7-tuple $(Q, Σ, Γ, δ, q_0, q_"accept", q_"reject")$, where $Q, Σ, Γ$ are all finite sets and
 1. $Q$ is the set of *states* (状态) ,
 2. $Σ$ is the *input alphabet* (输入字母表) , not containing the blank symbol $⊔$,
 3. $Γ$ is the *tape alphabet* (纸带字母表) , where $⊔ ⊆ Γ$ and $Σ ⊆ Γ$,
 4. $δ : Q times Γ → Q times Γ times {L, R}$ is the *transition function* (转移函数) ,
 5. $q_0 in Q$ is the *start state* (初始状态) ,
 6. $q_"accept" in Q$ is the *accept state* (接受状态) , and
 7. $q_"reject" in Q$ is the *reject state* (拒绝状态) , where $q_"reject" ≠ q_"accept"$.
 - *One step* of the computation has three parts: *read* the symbol in the current cell; *write* a new symbol there and update the state; *move* the head one cell left or right.
 - *Configuration* (格局) : records everything needed to continue the computation: the current state, the full tape contents, and the head position. Formally, a configuration is written as $u q v$, where $q in Q$ is the current state, $u, v in Γ^*$, the tape contains $u v$ followed by blanks, and the head is on the first symbol of $v$.
- *Acceptance*: $M$ *accepts* (接受) input $w$ if there exists a sequence of configurations $C_0, C_1, ..., C_k$ such that
 - $C_0$ is the *start configuration*: state $q_0$, with $w$ written on the tape and the head at the leftmost cell,
 - each $C_i$ *yields* $C_(i+1)$, that is, $C_(i+1)$ follows from $C_i$ by one application of $δ$, and
 - $C_k$ is an *accepting configuration*: its state is $q_"accept"$.
- *Recognizable language* (可识别语言) : The set of strings that $M$ *accepts* is the language *recognized* by $M$, denoted $L(M)$. $L$ is *recognizable* if there is a TM $M$ such that $L(M) = L$.
- *Deciding a language*: Let $L ⊆ {0,1}^*$ be a language, $M$ a Turing machine, and $T : NN → NN$. $M$ *decides* (判定) $L$ in time $T(n)$ if for every $x in {0,1}^*$, $M$ halts within $T(|x|)$ steps, if $x in L$ then $M$ accepts $x$, and if $x ∉ L$ then $M$ rejects $x$.
- *Decidable language* (可判定语言) : $L$ is decidable if some Turing machine decides $L$.
 - On an input, a Turing machine may *accept*, *reject*, or *loop forever*. A TM that decides a language always halts -- it never loops forever.
 - *Every decidable language is recognizable*; the converse is not true. For example, the halting problem is recognizable but not decidable.
- *Computational Turing machine* (计算图灵机) : a 6-tuple $(Q, Σ, Γ, δ, q_0, q_"end")$, where $q_"end" in Q$ is the *end state* (终止状态) . $M$ *computes* $f : Σ^* → Σ^*$ if, on every input $w in Σ^*$, $M$ halts in $q_"end"$ with $f(w)$ on its tape.
- *Computable function* (可计算函数) : Let $f : {0,1}^* → {0,1}^* ∪ {"undefined"}$ be a possibly partial function. $M$ *computes* $f$ within time $T(n)$ if for every $x in {0,1}^*$ with $f(x) ≠ "undefined"$, $M$ halts on $x$ within $T(|x|)$ steps, with exactly $f(x)$ on its tape. $f$ is *computable* if some TM computes it.

== Variants of Turing Machines

- The Turing machine model is *robust*: the basic model and all the variants below have the *same computational power*, that is, they recognize (or decide) the *same class of languages*, and each can simulate the other with at most a *polynomial slowdown*, that is, $T(n)$ steps become $"poly"(T(n))$ steps.
- *Stay option*: allow $δ : Q times Γ → Q times Γ times {L, R, S}$, where $S$ means the head remains in place. If $M$ decides $L$ in time $T(n)$, then $L$ is decidable in time $O(T(n))$ by a standard Turing machine.
- *Change of alphabet*: let $L ⊆ {0,1}$ and $T(n) ≥ n^2$. If $L$ is decided in time $T(n)$ by a Turing machine with tape alphabet $Γ$, then $L$ is decided in time $O(log |Γ| dot T(n))$ by a Turing machine with tape alphabet ${0, 1, ⊔}$.
- *One-way Turing machine* (单向图灵机) : a Turing machine whose tape is infinite in only one direction.
- *Multitape Turing machine* (多带图灵机) : $δ : Q times Γ^k → Q times Γ^k times {L, R, S}^k$, with one head per tape. In state $q$, if head $i$ reads $a_i$ for every $i$, the machine enters $q'$, and each head $i$ writes $b_i$ and moves in direction $D_i$. The input $x$ is on tape 1; tapes $2, ..., k$ are blank. All heads start on cell 0 in state $q_0$.
- *RAM Turing machine* (RAM 图灵机) : a $(k+1)$-tape Turing machine $M = (Q, Σ, Γ, δ, q_0, q_"accept", q_"reject", Q_"access")$ with
 - tapes $1, ..., k$ as *work tapes* (工作带) (tape 1 holds the input) and tape $k+1$ as the *address tape* (地址带) ;
 - a *memory* $A : NN → Γ$, initially $A[i] = ⊔$ for all $i$;
 - a set of *access states* $Q_"access" ⊆ Q ∖ {q_"accept", q_"reject"}$.
 - $Γ$ contains two special symbols $"Rd"$ and $"Wr"$. When $M$ enters a state in $Q_"access"$:
  - *Read*: if the address tape contains $"bin"(i) "Rd"$, the address tape is erased and $A[i]$ is written into its first cell.
  - *Write*: if the address tape contains $"bin"(i) "Wr" α$, then $A[i]$ is set to $α$ and the address tape is erased.
  - Otherwise, nothing happens.
 - Each access counts as *one* step.
 - The transition function is that of an ordinary $(k+1)$-tape machine; the memory $A$ never appears in $δ$, it is used only through access states.
- *$"DTIME"$*: let $T : NN → NN$. A language $L ⊆ {0,1}^*$ is in $"DTIME"(T(n))$ if there exists a *multitape Turing machine* $M$ that decides $L$ in time $O(T(n))$.
- *$"P"$*: $"P" = union.big_(c ≥ 1) "DTIME"(n^c) = "DTIME"(n) ∪ "DTIME"(n^2) ∪ "DTIME"(n^3) ∪ ...$. $P$ does not depend on the choice of Turing machine model, since these models can all simulate each other in polynomial time.
- Two *Conjectures* (猜想) : with $"CLIQUE" = {⟨G, k⟩ : "graph" G "has a clique (团) of size" k}$,
 - $"P" ≠ "NP"$, equivalently $"CLIQUE" ∉ "P"$.
 - $"CLIQUE" ∉ "DTIME"(n)$.
- *Summary*: every variant is simulated with at most polynomial overhead, so the class of decidable languages is the same, and $P$ is the same, whichever model we use.
#table(
  columns: 3,
  stroke: none,
  align: center,
  column-gutter: 1.2em,
  [Variant], [Simulated in time], [Proof idea],
  table.hline(stroke: 0.5pt),
  [Stay option], [$O(T(n))$], [stay = right, then left],
  [Alphabet], [$O(log |Γ| dot T(n))$], [encode each symbol in $log_2 |Γ|$ bits],
  [One-way TM], [$O(T(n))$], [fold the tape into two tracks],
  [Multitape TM], [$O_k (T(n)^2)$], [$k$ tracks, hats mark heads],
  [RAM TM], [$O(T(n)^2)$], [add a memory tape holding a list of (address, value) pairs],
)

== Church–Turing Thesis

- *From C to a Turing machine*: every RISC-V RV32I instruction can be simulated by a multitape RAM TM in $O(1)$ steps, so every C program running in time $T(n)$ is compiled to *RV32I* ($T(n)$ steps), simulated by a *multitape RAM TM* ($O(T(n))$), merged onto a *multitape TM* ($O(T(n)^2)$), and encoded over the alphabet ${0, 1}$ on a *single-tape TM* ($O(T(n)^4)$). That is, Every C program running in time $T(n)$ can be simulated by a single-tape TM over ${0,1}$ in time $O(T(n)^4)$ -- polynomial.

- Other models equivalent to Turing machines:

#table(
  columns: 2,
  stroke: none,
  align: center,
  column-gutter: 1.5em,
  [Model], [Idea],
  table.hline(stroke: 0.5pt),
  [Register Machine (寄存器机)], [INC/DEC/JZ on counters (计数器)],
  [λ-calculus (λ 演算) / SKI], [β-reduction (β-归约)],
  [μ-Recursive Functions (μ-递归函数)], [prim. recursion + μ (原始递归 + μ)],
  [Post / Markov Systems], [string rewriting],
  [Cellular Automata (元胞自动机)], [local rules],
  [Boolean Circuits (布尔电路)], [circuit families],
)

- *Church–Turing Thesis* (*CTT*, 丘奇–图灵论题) : every function that is effectively computable is computable by a Turing machine.
- *Strong Church–Turing Thesis* (强丘奇–图灵论题) : any reasonable model of computation can be simulated by a Turing machine with at most *polynomial* overhead. Possibly false: quantum computers.
- *Physical Church–Turing Thesis* (物理丘奇–图灵论题) : every function that can be computed by a physical system is computable by a Turing machine.

== Universal Turing Machine

- Why a *universal Turing machine* (*UTM*, 通用图灵机) ? 
 - One machine runs every program, so no special hardware per algorithm.
 - Encoding machines as strings lets us prove computability results.
 - Origin of the stored-program computer (von Neumann architecture, 1945).
- *Stored-program computer* (存储程序计算机) : instructions and data share one memory, so a program is just data interpreted as instructions. The UTM is the model, a computer is the realization. Calculators, traffic light controllers and elevator controllers are *not* universal (fixed logic); laptops, desktops and smartphones are.
- *Encoding a Turing machine as a string*: assume every string $α in {0,1}^*$ represents some Turing machine $M_α$ (if $α$ is invalid, $M_α$ always rejects), and every Turing machine is represented by infinitely many strings.
- *Theorem*: there is a 2-tape Turing machine $U$ such that for all $x, α in {0,1}^*$, $U(x, α) = M_α(x)$, with the same outcome (accept, reject, or run forever). Moreover, if $M_α$ halts on $x$ within $T$ steps, then $U$ halts within $O(T log T)$ steps.