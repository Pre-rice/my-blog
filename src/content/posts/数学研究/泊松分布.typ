#metadata((
  title: "泊松分布",
  published: "2026-08-01-2",
  description: "一个小切口，牵连出无数宝藏！紧密联系的体系。",
  tags: ("数学","概率"),
  category: "数学研究",
  draft: false,
))<frontmatter>

本文暂为大纲，有的地方还没讲清楚，看不懂很正常。

=== 定义
 - 引入：样方内个体数的分布
  - 基本假定：个体出现在各个位置上的概率均等，且个体间的分布互不影响（泊松分布的基本条件：连续事件载体、事件发生的概率恒定且独立）
  - 数学建模：平面内布满了随机生成的点，每个点独立等可能地出现在平面内的任意位置，且平面内点的平均密度为$lambda$。在一个面积为S的区域内，点的个数记为随机变量X，求X的分布列。
 - $X~B(n,p)，E(X)=n p=lambda，使 lambda"不变"，n -> +oo，"则得"P(X=k)=(lambda^k e^(-lambda))/k!$
 - 应用公式：$lim_(n->+oo) (1+1/x)^x = e，lim_(n->+oo) (1-1/x)^x = 1/e$（*$e$的定义及本质*）
 - 两种趋近方法
  - 宏观趋近：样方不变，总区域$->$无穷大
  - 微观趋近：划分样方，总数量$->$无穷多个
 - 唯一参数$lambda$的含义
  - 均值
  - 平均密度
  - 微观本质：对于连续事件载体的微元ds，事件有很小概率dp发生，$(d p)/(d s)=lambda$
  - $lambda$刻画的是事件恒定的发生概率，但又不是概率本身，本质上也是一种“概率密度”。不过通常意义上（概率密度函数中）的概率密度描述单位变量上事件发生的概率，这里的概率密度描述单位事件载体上事件发生的概率，联想到电子云的概率密度则描述单位体积内电子出现的概率
 - 理解
  - 一句话：泊松分布，即一段连续事件载体上，发生概率恒定的独立随机事件发生次数的分布
  - 二项分布的连续化（二项分布：离散的事件载体）
  - 概率为0的事件无数次尝试发生，积累出不为0的概率（类比：连续型随机变量取任何一个值的概率均为0，却必然取到某个值）
  - 类似于衰变，完全不知何时发生，却仍有内在$lambda$
 - 情境实例
  - 样方内的个体数。事件载体：二维的空间（平面）。
  - 连续版的输出机器。原先的机器输出离散的数字，每个离散的载体上，随机事件（输出1）发生的概率为p。现在的机器随时间流逝随机发出一声“哔”，机器设定单位时间内发出“哔”的概率为$lambda$，则一段时间内发出“哔”的次数服从泊松分布。事件载体：一维的时间。
  - 考虑函数$f(x)$，定义域$[0,1]，forall x in [0,1]，f(x)$的值在$[0,1]$中均匀随机地选取。则对$a in [0,1]$，$f(x)=a$的解的个数服从泊松分布。事件载体：一维的函数自变量。
  - 上例中改为$f(x)=x$的解的个数分布亦然，这使人联想到错排问题中，匹配元素个数的分布趋于泊松分布。

=== 性质
 - 本身：$sum (lambda^k e^(-lambda))/k! =1$，源于$e^lambda= sum (lambda^k)/k!$（*泰勒展开*）
  
 - 均值：$sum k dot (lambda^k e^(-lambda))/k! = sum lambda dot (lambda^(k-1) e^(-lambda))/(k-1)! = lambda dot sum (lambda^(k-1) e^(-lambda))/(k-1)! = lambda$

 - 方差：$D(X)=E(X^2)-E(X)^2，E(X^2)= lambda + lambda^2$（求导法），$D(X)=lambda$（三阶中心矩亦为$lambda$）
  
 - 卷积：$sum (lambda_1^i e^(-lambda_1))/i! dot (lambda_2^(k-i) e^(-lambda_2))/(k-i)! = sum k!/(i!(k-i)!)dot (lambda_1^i lambda_2^(k-i))dot e^(-(lambda_1+lambda_2))/k! = sum C_k^i lambda_1^i lambda_2^(k-i)dot e^(-(lambda_1+lambda_2))/k! = ((lambda_1+lambda_2)^k e^(-(lambda_1+lambda_2)))/k!$ （*二项式定理*）对卷积封闭！
 
 - 表达式 $(lambda^k e^(-lambda))/k!$ 对 $k$（离散）和 $lambda$（连续）的积分均为1，分布与逆分布的形式相同，均值、方差、极值点等值简介，卷积封闭。这一系列的美妙性质，赋予了泊松分布独一无二的美。

=== 逆分布
 - 由果推因 由 $k$ 推 $lambda$ （假定先验分布均匀）
  
 - $f(lambda)= (lambda^k e^(-lambda))/(integral_0^(+oo) lambda^k e^(-lambda) d lambda)=(lambda^k e^(-lambda))/k!$ 与原分布形式上相同，但离散转为连续，随机变量 $k$ 转为 $lambda$
  
  $integral_0^(+oo) (lambda^k e^(-lambda) )/k! d lambda=1$ 证明：分部积分+数学归纳法。不过归纳法实为事后诸葛，下面采用分析证明：
  
  （分析是思考的过程，归纳是证明的书写）

  $d(lambda^k e^(-lambda)) = k lambda^(k-1) e^(-lambda) d lambda-lambda^k e^(-lambda) d lambda$

  $d((lambda^k e^(-lambda))/k!) = (lambda^(k-1) e^(-lambda))/(k-1)! d lambda- (lambda^k e^(-lambda))/k! d lambda$

  两边同时对 $lambda$ 取0到$+oo$积分，左边为0，右边得等式，递推至k=1即可

  这同时给出了阶乘的连续化定义：$k! =integral_0^(+oo) lambda^k e^(-lambda) d lambda$
  
  现代数学中，定义*伽马函数* $Gamma(k)=integral_0^(+oo) lambda^(k-1) e^(-lambda) d lambda=(k-1)!$

  伽马函数又称为第二类欧拉积分

 - 峰值：$f'(lambda)=((k-lambda) lambda^(k-1) e^(-lambda))/k! =0$ 在$lambda=k$处取得峰值
 
 - 均值：$E(lambda)=integral_0^(+oo) lambda dot (lambda^k e^(-lambda))/k! d lambda=integral_0^(+oo) (k+1)(lambda^(k+1) e^(-lambda))/(k+1)! d lambda=k+1$
 
 - 方差：$E(lambda^2)=integral_0^(+oo) lambda^2 dot (lambda^k e^(-lambda))/k! d lambda=integral_0^(+oo) (k+1)(k+2)(lambda^(k+2) e^(-lambda))/(k+2)! d lambda=(k+1)(k+2)$，$D(lambda)=k+1$
 
 - 卷积：$integral_0^lambda (x^a e^(-x))/a! ((lambda-x)^b e^(-(lambda-x)))/b! d x = integral_0^lambda x^a (lambda-x)^b d x dot e^(-lambda)/(a! b!) = (a! b! lambda^(a+b+1))/(a+b+1)! dot e^(-lambda)/(a! b!) = (lambda^(a+b+1) e^(-lambda))/(a+b+1)!$ 对卷积封闭！

  其中用到公式：$integral_0^t x^m (t-x)^n d x = t^(m+n+1) dot (m!n!)/(m+n+1)!$ 
  
  证明：分部积分+数学归纳法。下面采用分析证明：

  $d(x^m (t-x)^n) = m x^(m-1) (t-x)^n d x - n x^m (t-x)^(n-1) d x$

  $d((x^m (t-x)^n)/(m!n!)) = (x^(m-1) (t-x)^n)/((m-1)!n!) d x - (x^m (t-x)^(n-1))/(m!(n-1)!) d x$

  两边同时对 $x$ 取0到t积分，左边为0，右边得等式，递推至k=1即可

  特别地，$t=1$时，有 $integral_0^1 x^m (1-x)^n d x = (m!n!)/(m+n+1)!$

  现代数学中，定义*贝塔函数* $B(p,q)=integral_0^1 x^(p-1) (1-x)^(q-1) d x=((p-1)! (q-1)!)/(p+q-1)! = (Gamma(p) Gamma(q))/Gamma(p+q)$

  贝塔函数又称为第一类欧拉积分

 - 情境：考虑连续版的输出机器，机器设定的$lambda$未知。观测到机器在t时间内发出n声“哔”，使用贝叶斯公式反过来推测$lambda$，则$lambda$的分布列即为上述的泊松分布逆分布。我们可以从该分布中得到关于$lambda$的更多信息，而不仅仅是一个简单的估计值。值得注意的是，$E(lambda)=(n+1)/t$对比离散版的输出机器，即二项分布的逆分布，均值$$，+1的奇妙修正。（联想：对一遵循特定分布的随机变量X进行n次观测，则观测样本数据的方差$S^2$满足$E(S^2)=(n-1)/n D(X)$）
 （其实我所说的逆分布就是先验为均匀分布时的后验共轭分布。一般地，泊松分布的先验共轭为伽马分布，略细说）

=== 相关分布
  - 二项分布（离散事件载体，本质上是伯努利过程），事件首现分布即为几何分布 $P(X=k)=(1-p)^(k-1) p，E(X)=1/p$ 
  - 泊松分布（连续事件载体，本质上是泊松过程），事件首现分布即为指数分布 $f_t (lambda)=lambda e^(-lambda t)，E(t)=1/lambda$
   - 但是注意：泊松过程并非伯努利过程的连续版本，而是伯努利过程的累积版本的连续版本。伯努利过程是0阶马尔可夫/独立过程，泊松过程则是一个累积，是1阶马尔可夫。
   - 泊松过程之所以定义为一种累积，是因为这是连续时间上的离散事件，这种情况下只有采用累积才能良好地刻画出这一过程。不能为测度为0的瞬间分配一个数，就用积分函数的优良性质。混合型随机变量也有这样的困境。狄拉克δ函数是解决问题的一个办法。
   - 几何分布和指数分布的无记忆性：$P(T>s+t∣T>t)=P(T>s)$
  - 事件的首现分布即为间隔分布，首现期望即为间隔期望，亦为概率(密度)的倒数
  - 经t已发生的概率，即首现分布的累积分布函数的补数$F(t)=e^(-lambda t)$，与原子衰变图相同