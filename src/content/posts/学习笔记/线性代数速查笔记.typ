#metadata((
  title: "线性代数速查笔记",
  published: "2026-09-08",
  description: "基于我自身理解整理的线性代数重点知识",
  tags: ("数学", "线性代数"),
  category: "学习笔记",
  draft: false,
))<frontmatter>

=== 理解 “函数”
- *本质*：定义域到值域的映射，输入到输出的映射
- *万物皆函数*：从函数的视角看，万物与世界交互，对其的作用即输入，对作用的响应即输出
- *函数的子类*
 - *函数*（狭义）：从数到数的映射
 - *泛函*：从函数到数的映射，核心应用是变分法
 - *算子*：从函数到函数的映射，这里的函数是函数空间，或者更一般的向量空间
 - *变换*：自映射，定义域等于值域

=== 理解 “线性”
- *本质*：满足*叠加原理*
 - *可加性*：$f(x+y)=f(x)+f(y)$，和的函数等于函数的和
 - *齐次性*：$f(a x)=a f(x)$
- *线性运算*：加法和数乘，最基础的线性操作
- *线性组合*：通过线性运算将基本对象组合
- *线性变换*：满足叠加原理的变换，通常指向量的线性变换

== 基础对象

*向量*：有序数组，表示空间中的点或方向（几何视角）、一组变量的取值（数据视角）

*矩阵*：数的矩形阵列，可以表示线性方程组的系数、线性变换

理解*线性变换* $bold(A) bold(x)=bold(b)$（$bold(A)$ 为 $m×n$ 实矩阵，$bold(x) in RR^n$，$bold(b) in RR^m$）的三种视角：

$bold(A)=mat(delim: "[", a_11,a_12,dots,a_(1n);a_21,a_22,dots,a_(2n);dots.v,dots.v,,dots.v;a_(m 1),a_(m 2),dots,a_(m n))=mat(delim: "[","row"(bold(A),1);"row"(bold(A),1);dots.v;"row"(bold(A),m))=mat(delim: "["," col"(bold(A),1),"col"(bold(A),1),dots,"col"(bold(A),n)" ")$

$bold(b)=bold(A) bold(x) &= mat(delim: "[", a_11,a_12,dots,a_(1n);a_21,a_22,dots,a_(2n);dots.v,dots.v,,dots.v;a_(m 1),a_(m 2),dots,a_(m n))mat(delim: "[",x_1;x_2;dots.v;x_n)=mat(delim: "[", a_11x_1&+a_12x_2&+dots&+a_(1n)x_n;a_21x_1&+a_22x_2&+dots&+a_(2n)x_n;dots.v;a_(m 1)x_1&+a_(m 2)x_2&+dots&+a_(m n)x_n)\
 
&=mat(delim: "[","row"(bold(A),1);"row"(bold(A),1);dots.v;"row"(bold(A),m))bold(x)=mat(delim: "[","row"(bold(A),1) dot bold(x);"row"(bold(A),1) dot bold(x);dots.v;"row"(bold(A),m) dot bold(x))\ 
 
&=mat(delim: "["," col"(bold(A),1),dots,"col"(bold(A),n)" ")mat(delim: "[",x_1;dots.v;x_n)=x_1"col"(bold(A),1)+ ... +x_n"col"(bold(A),n)$


== 核心代数结构

=== 线性空间（向量空间）
 - *定义*：对线性运算封闭的集合（满足八条公理）
 - *关键概念*：线性相关/无关、基、维数（可以为无限维）、坐标
=== 内积空间
 - *内积*：二元运算，将线性空间中的两个向量映射到一个*数域* $FF$（$FF=RR$ 或 $CC$）中的标量
  - 满足共轭对称性、第一变元线性、正定性
  - 通常讨论实内积空间，内积满足对称性、双线性、正定性
 - 内积赋予*几何度量*：长度（范数）、角度（进一步定义正交）、距离
 - *欧几里得空间* $RR^n$：$⟨bold(x),bold(y)⟩=bold(x)^T bold(y)$，*正交变换*保持内积，*正交矩阵* $bold(Q)^T bold(Q) = bold(I)$
  - 正交变换保持内积，从而保持范数、角度和距离
  - 正交矩阵的列向量（行向量）构成一组正交基
 - *酉空间* $CC^n$：$⟨bold(x),bold(y)⟩=bold(x)^* bold(y)$（共轭转置），酉变换保持内积，酉矩阵 $bold(U)^* bold(U) = bold(I)$
 - *希尔伯特空间*：欧几里得空间的推广，可以是无穷维，保留了内积和完备性
 - *平方可积函数空间* $L^2$：$⟨f,g⟩=integral f(x) macron(g(x)) d x$，是最典型的无穷维希尔伯特空间，也是傅里叶分析、量子力学和信号处理的基本框架。

=== 子空间
 - *运算*：和、交、补、直和、正交补
 - 对于任意 $m×n$ 实矩阵 $bold(A)$（线性变换 $bold(A) bold(x)=bold(b)，bold(x) in RR^n，bold(b) in RR^m$），定义四个基本子空间：
  - *零空间* $N(bold(A))$（解空间）：使输出 $bold(b)=bold(0)$ 的输入 $bold(x)$ 的集合
  - *列空间* $C(bold(A))$：列向量张成的空间，也是输出 $bold(b)$ 的集合（线性变换的值域）
  - *行空间* $R(bold(A))=C(bold(A)^T)$：行向量张成的空间，也是使 $bold(b)!=bold(0)$ 的 $bold(x)$ 的集合
  - *左零空间* $N(bold(A)^T)$：使 $bold(A)^T bold(y)=bold(0)$ 的 $bold(y)$ 的集合，满足 $bold(y)^T bold(A) bold(x)=bold(0)$ 对任意 $bold(x)$ 成立
  - 零空间中的向量被压扁成零向量，行空间中的向量被映射到列空间中，故 $N(bold(A))⊕R(bold(A))=RR^n$
  - 左零空间中的向量与任意输出正交，列空间是所有可能的输出，故 $N(bold(A)^T)⊕C(bold(A))=RR^m$（$⊕$为直和）


== 关键数值特征

=== 行列式
 - *几何意义*：体积缩放因子
 - *性质*：矩阵可逆 $<=>$ 行列式 ≠ 0
=== 特征值与特征向量
 - *理解*：在特征向量的方向上，线性变换的作用简化为数乘，特征值表示该方向上的缩放倍数
 - $n$ 阶方阵 $bold(A)$ 的*特征多项式*： $abs(lambda bold(I) - bold(A))$，是关于 $lambda$ 的 $n$ 次多项式
  - 特征多项式的零点即为 $bold(A)$ 的*特征值*
  - 特征值 $lambda$ 的*代数重数*：特征多项式中 $lambda$ 作为根的重数
 - 特征值 $lambda$ 的*特征子空间*：属于 $lambda$ 的全部特征向量和零向量构成的子空间
  - 特征值 $lambda$ 的*几何重数*：$lambda$ 的特征子空间的维数
  - 几何重数 $<=$ 代数重数
=== 相似对角化
 - *矩阵相似*： $bold(A)~bold(B)$ $<=>$ 存在可逆矩阵 $bold(P)$ 使得 $bold(B)=bold(P)^(-1) bold(A) bold(P)$
  - *理解*：相似矩阵表示同一线性变换在不同基下的表示， $bold(P)$ 为两组基的*过渡矩阵*
 - *相似不变量*：在相似变换下保持不变的量，刻画线性变换的本质属性
  - 特征多项式为相似不变量
  - *特征值*（特征多项式的根）、*迹*（特征值的和）、*行列式*（特征值的积）为相似不变量
 - 矩阵 $bold(A)$ 可*对角化*：$bold(A)$ 与对角矩阵相似，即存在可逆矩阵 $bold(P)$ 和对角阵 $bold(D)$，使得 $bold(A)=bold(P)^(-1) bold(D) bold(P)$
  - $n$ 阶矩阵 $bold(A)$ 可对角化的充要条件：$bold(A)$ 有 $n$ 个线性无关的特征向量，即每个特征值的几何重数 $=$ 代数重数
 - *实对称矩阵*：元素都是实数的对称矩阵
  - 实对称矩阵的特征值是实数，特征向量是实向量，且不同特征值对应的特征向量相互正交
  - 实对称矩阵可*正交对角化*，即存在正交矩阵 $bold(P)$ 和对角阵 $bold(D)$，使得 $bold(A)=bold(P)^T bold(D) bold(P)$
=== 二次型
 - *定义*：设 $bold(A)$ 是 $n$ 阶实对称矩阵，$bold(x)$ 是 $n$ 元列向量，则 $bold(x)^T bold(A) bold(x)$ 是一个*二次型*
  - $bold(x)^T bold(A) bold(x)=sum_(i=1)^n sum_(j=1)^n a_(i j) x_i x_j=sum_(i=1)^n a_(i i) x_i^2+2sum_(i<j) a_(i j) x_i x_j$
  - 二次型即 $n$ 个变量 $x_1, x_2, ..., x_n$ 的二次齐次多项式，二次型 $bold(x)^T bold(A) bold(x)$ 与实对称矩阵 $bold(A)$ 一一对应
 - 二次型的*标准型*：二次型只含有变量的平方项，对应的矩阵为对角矩阵
  - 由于实对称矩阵 $bold(A)$ 可正交对角化 $bold(A)=bold(P)^T bold(D) bold(P)$，作正交变换 $bold(y)=bold(P) bold(x)$，则 $bold(x)^T bold(A) bold(x)=bold(y)^T bold(D) bold(y)=sum_(i=1)^n lambda_i y_i^2$，二次型化为标准型
 - *正定二次型*：对任意非零向量，值恒为正的二次型，对应的实对称矩阵为*正定矩阵*（*半正定*：值恒非负）
  - 实对称矩阵（半）正定的充要条件：所有特征值为正（非负）
  - 由于 $bold(x)^T (bold(A)^T bold(A)) bold(x)=(bold(A) bold(x))^T (bold(A) bold(x))>=0$，矩阵 $bold(A)^T bold(A)$ 半正定，若 $bold(A)$ 满秩则正定
