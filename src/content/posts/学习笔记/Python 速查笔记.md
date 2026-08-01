---
title: Python 速查笔记
published: 2026-07-31-1
description: 基于我自身理解整理的 Python 重点语法
tags: [Python]
category: 学习笔记
draft: false
---

# 0 Python的异常处理

```python
try:
    # 可能引发异常的代码块(一旦发生异常，try块中剩余的代码将不再执行)
except[ ExceptionType][ as e]:
    # 处理特定异常类型的代码块(可以有多个)，ExceptionType为匹配的异常类型(留空则匹配所有)，e为异常对象(可选)
else:
    # 没有发生任何异常时执行的代码块
finally:
    # 无论是否发生异常，都会在离开try块之前执行的代码块(即使try中包含return、break或continue)
```

# 1 Python的基础: 类与对象

Python中一切皆对象  
类(`class`)是创建实例(`instance`)的模板，对象(`object`)就是类的实例  
面向对象编程(`OOP`)把对象作为程序的基本单元  

## 1.1 类基础

类定义体仅在类定义时执行一次，其中可定义属性(`property`)和方法(`method`)  

- **实例属性**：在实例方法中用`self`定义，或在类体外给实例动态绑定，每个实例独有，只能通过实例访问  
- **类属性**：直接在类体中定义，所有实例共享，可通过类名或实例访问  

- 以`__`开头的属性为私有变量(`private`)，只有类内部可以访问，外部代码不能直接访问  
- 以`__`开头和结尾的属性为特殊变量，可以直接访问  

- **实例方法**：定义在类体中的函数，第一个参数通常命名为`self`，表示实例对象  
- **类方法**：使用`@classmethod`装饰器，第一个参数通常命名为`cls`，表示类对象(类方法不能访问实例属性和方法)  
- **静态方法**：使用`@staticmethod`装饰器，不需要表示实例或类的参数  

- 实例方法一般通过实例调用，类方法和静态方法一般通过类调用  
- `__init__`方法为特殊的实例方法，会在创建实例时传入除`self`外的参数并自动调用一次，用于初始化实例属性等  
- 使用`@property`装饰器可将实例方法定义为只读的实例属性，使用`@property_name.setter`装饰器可定义对应属性的写入方法  

## 1.2 变量与对象

Python中的数据类型、函数、类、模块等都是对象，都拥有自己的属性和方法  
对象的三大特性: **身份(`id`) 类型(`type`) 值(`value`)**  
Python中的变量是对对象的引用(`reference`)  
变量赋值就是引用赋值，函数参数传递也是变量赋值  
可变对象的修改会影响所有引用该对象的变量  
不可变对象的修改会创建新对象，不影响原对象  

## 1.3 数据类型: 存储数据的对象

数据类型分为**简单数据类型**(`int` `float` `complex` `bool` `NoneType`)与**组合数据类型**(`list` `tuple` `set` `dict` `str`)  
简单数据类型均不可变，组合数据类型含**可变类型**(`list` `set` `dict` `bytearray`)与**不可变类型**(`tuple` `frozenset` `str` `bytes`)  
数据类型转换函数: `int()` `float()` `complex()` `bool()` `str()` `list()` `tuple()` `set()` `dict()`  

- `str()`函数会调用对象的`__str__`方法返回一个用户友好的字符串，`repr()`函数会调用对象的`__repr__`方法返回一个开发者友好的字符串，`eval()`函数会将字符串解析为表达式并返回其值(往往能还原`repr()`函数的输出)  

## 1.4 简单函数

- **输入输出函数**  
  `input(prompt=None)` 返回`str`类型  
  `print(*objects, sep=' ', end='\n', file=sys.stdout, flush=False)` 返回`None`  
  - `flush`: 是否强制刷新输出缓冲区(`True`则立即写入目标文件)  
- **运算符与运算函数**  
  `//`整除运算 `**`幂运算 `abs()`绝对值 `divmod()`返回元组(商, 余数) `round()`取最接近的整数(距离相等则取偶数)  
- **lambda函数**  
  `lambda arguments: expression`   表示一个参数为`arguments`，返回值为`expression`的匿名函数  

# 2 Python的核心数据结构: 可迭代对象

Python中的组合数据类型均为可迭代对象(`iterable`)，这是Python的核心概念之一  

## 2.1 可迭代对象的分类

- **序列**(`sequence`): `list` `tuple` `str` `bytes` `bytearray` `range`  
- **集合**(`set`): `set` `frozenset`  
- **映射**(`mapping`): `dict`  
- **迭代器**(`iterator`): 生成器(`generator`) 文件对象(`file object`) `enumerate` `zip` `map` `filter`  

## 2.2 可迭代对象的共同函数

- `iter(iterable)` 调用`__iter__`方法返回迭代器对象  
- `next(iterator[, default])` 返回迭代器的下一个元素  
  - `default`: 当可迭代对象为空时返回的默认值，如果未提供则抛出异常  

- `sum(iterable, /, start=0)`  
- `min(iterable, *[, default, key])`  
- `max(iterable, *[, default, key])`  
  - 参数`/`前的所有参数必须以位置实参传递，参数`*`或可变长位置参数后的参数必须以关键字实参传递  
  - `*arg`: 可变长位置参数，接收任意数量的位置实参并将其存储为元组  
  - `**kwarg`: 可变长关键字参数，接收任意数量的关键字实参并将其存储为字典  

- `in` / `not in` 判断元素是否在可迭代对象中  
- `len(iterable)` 返回容器对象的长度(迭代器都是惰性求值且一次性的，无法直接用`len`函数获取长度)  
- `all(iterable)` 所有元素为`True`则返回`True`  
- `any(iterable)` 任一元素为`True`则返回`True`  
- `sorted(iterable, *, key=None, reverse=False)` 返回排序后的列表  

- `enumerate(iterable, start=0)` 返回带索引的迭代器，元素为`(index, value)`格式的元组  
- `zip(*iterables)` 返回聚合后的迭代器，元素为元组  
- `map(function, iterable, ...)` 返回映射后的迭代器  
- `filter(function, iterable)` 返回过滤后的迭代器  
- `reduce(function, iterable[, initializer])` 累积计算可迭代对象的元素，需导入`functools`模块  

## 2.3 序列(sequence)

- **序列反转** `reversed(seq)` 返回反转序列后的迭代器  
- **序列索引** `seq[index]` 返回指定索引的元素 支持负索引  
  `seq.index(value[, start[, stop]])` 返回指定值的第一个匹配元素的索引  
  `seq.count(value)` `str.count(sub, start=0, end=len(string))` 返回指定值在序列中出现的次数  
- **序列运算** 连接(`+`)、重复(`*`)、比较(`== != < <= > >=`)(按元素顺序逐一比较)  
- **序列切片** `seq[start:stop:step]` 返回切片后的新对象  
  - **切片赋值** `list[start:stop] = iterable` 替换(包括插入和删除)列表的指定切片  
    `list[start:stop:step] = iterable` 逐一替换列表的指定切片中的元素  
  - **切片删除** `del list[start:stop:step]` 删除列表的指定切片中的元素  
    - 切片赋值与删除仅适用于可变序列(`list` `bytearray`)  
    - `list.insert(index, value)` 亦可实现在指定索引位置插入元素  
- **序列解包** 将序列中的元素依次赋值给多个变量 可用于同时赋值多个变量  
  `*`号在赋值语句中可收集多余元素到一个列表中  
  `*iterable`在表达式或函数调用中将可迭代对象拆包成单独元素  
- 省略括号的序列默认为元组，创建单元素元组时需在元素后添加逗号  
- **range对象**是一类特殊的不可变序列，惰性求值但可重复使用，支持反转、索引与切片  
  `range(stop)` `range(start, stop)` `range(start, stop, step)` 皆可创建`range`对象  

## 2.4 可变容器对象(list set dict)

| 操作 | `list` | `set` | `dict` |
|------|--------|-------|--------|
| 添加单个元素 | `append(value)` | `add(elem)` | `dict[key] = value` |
| 添加多个元素 | `extend(iterable)` | `update(iterable)` | `update(other)` |
| 移除指定元素 | `remove(value)`<br>`del list[index]` | `remove(elem)` | `pop(key)`<br>`del dict[key]`<br>`del variable` |
| 移除并返回元素 | `pop(index)` (默认最后一个) | `pop()` (随机) | `pop(key)` (返回对应value)<br>`popitem()` (最后插入的键值对) |
| 移除所有元素 | `clear()` | `clear()` | `clear()` |
| 拷贝对象 | `copy()` (浅拷贝) | `copy()` (浅拷贝) | `copy()` (浅拷贝) |

- `del`删除变量时，只删除变量对对象的引用而不删除对象，对象只在引用次数为0时自动删除  
- 浅拷贝仅拷贝引用，不拷贝内容；序列切片也是浅拷贝；`copy`模块的`copy()`和`deepcopy()`函数可实现浅拷贝和深拷贝(深拷贝会创建可变元素的副本)  
- **list的独有方法**: `list.sort(key=None, reverse=False)`，`list.reverse()`  

## 2.5 集合(set) `{elem, ...}`

集合中的元素必须是不可变数据对象，且不可重复  
定义空集合不能直接用`{}`(这表示空字典)，需要使用`set()`  

- **集合的运算**  
  - 并集(`|`)、交集(`&`)、差集(`-`)、对称差集(`^`)、子集(`<=`)、超集(`>=`)、真子集(`<`)、真超集(`>`)、相等(`==`)、不等(`!=`)  
  - `s1.isdisjoint(s2)` 不交  
  - `s1.issubset(s2)` 子集  
  - `s1.issuperset(s2)` 超集  
- **集合的更改**  
  - `set.add(elem)` 添加单个元素  
  - `set.update(iterable)` 求并集并更新  
  - `set.intersection_update(iterable)` 求交集并更新  
  - `set.difference_update(iterable)` 求差集并更新  
  - `set.symmetric_difference_update(iterable)` 求对称差集并更新  
  - `set.remove(elem)` 移除指定元素(不存在则报错)  
  - `set.discard(elem)` 移除指定元素(不存在不报错)  
  - `set.pop()` 随机移除并返回一个元素  

## 2.6 字典(dict) `{key: value, ...}`

字典的键可以是任意不可变数据对象，值可以是任意数据对象  
字典作为可迭代对象时，默认迭代的是`key`  

- **字典的创建**  
  - `dict(iterable)` 可迭代对象的每个元素应包括两个元素  
  - `dict.fromkeys(iterable, value=None)` 可迭代对象作为键，`value`作为所有键对应的默认值  
- **字典的读取**  
  - `dict[key]`、`dict.get(key, default=None)` 返回key对应value或`default`  
  - `dict.keys()` 返回包含所有键的视图对象  
  - `dict.values()` 返回包含所有值的视图对象  
  - `dict.items()` 返回包含所有`(key, value)`对的视图对象  
    - 视图对象是实时同步且不可更改的，支持集合操作但不支持索引访问  
- **字典的更新**: `dict[key] = value`、`dict.update(other)`  
  - `dict.setdefault(key, default=None)` key不存在则添加`key: default`，否则返回对应value  

## 2.7 推导式与生成器

- **列表推导式**   `[expression for item in iterable if condition]`  
- **字典推导式**   `{key_expression: value_expression for item in iterable if condition}`  
- **集合推导式**   `{expression for item in iterable if condition}`  
- **生成器表达式** `(expression for item in iterable if condition)`  
  - 表达式`expression`可以是函数、复杂表达式、甚至另一个推导式  
  - `if condition`可省略；推导式可含多个`for`或`if`子句(括号中可自由换行)  

生成器函数也可返回生成器对象，生成器函数包含的每个`yield`表达式都会暂停函数执行并返回一个元素  

## 2.8 字符串

### 2.8.1 字符串方法

- **分割与连接**  
  - `split(sep=None, maxsplit=-1)` 从左往右查找分隔符`sep`(至多查找`maxsplit`次)，返回分割后字符串组成的列表  
  - `rsplit(sep=None, maxsplit=-1)` 从右往左查找(后续开头加`r`的字符串方法同理)  
  - `splitlines(keepends=False)` 返回按行分割字符串后的列表，`keepends`为`True`则保留行末的换行符  
  - `partition(sep)`、`rpartition(sep)` 返回元组(分隔符前的部分, 分隔符, 分隔符后的部分)  
  - `join(iterable)` 将可迭代对象中的字符串连接成一个字符串，连接符为调用该方法的字符串  
- **查找与替换**  
  - `find(sub[, start[, end]])`、`rfind(sub[, start[, end]])` 查找`sub`并返回其索引，未找到返回`-1`  
  - `index(sub[, start[, end]])`、`rindex(sub[, start[, end]])` 查找`sub`并返回其索引，未找到抛出异常  
  - `count(sub[, start[, end]])` 查找互不重叠的子串`sub`并返回其出现的次数  
  - `replace(old, new[, count])` 返回替换`old`为`new`后的新字符串，`count`为最大替换次数  
  - `maketrans(x, y[, z])` 返回字符映射字典，字符串`x`和`y`必须长度相同，字符串`z`为要删除的字符  
  - `translate(dict)` 返回根据字典替换后的新字符串(字典的键为单字符或Unicode码点，值为替换后的字符串或`None`)  
- **转换与检验**  
  - **转换**: `upper()`全大写、`lower()`全小写、`title()`每个单词首字母大写、`capitalize()`首字母大写、`swapcase()`大小写互换  
  - **检验**: `isalpha()`、`isdigit()`、`isalnum()`、`islower()`、`isupper()`、`isspace()`、`istitle()` 字符串不为空且所有字符合法  
  - `startswith(prefix[, start[, end]])`、`endswith(suffix[, start[, end]])` 判断字符串是否具有指定前缀或后缀  
- **对齐与消减**  
  - `center()`、`ljust()`、`rjust()` 将字符串居中/向左/向右对齐，参数`width`为宽度，`fillchar`为填充字符，默认为空格  
  - `zfill(width)` 在数字字符串左侧填充0至宽度`width`(以符号开头则会在符号后填充)  
  - `strip([chars])`、`lstrip([chars])`、`rstrip([chars])` 返回将字符串两端/左端/右端的指定字符删除后的新字符串，`chars`指定要删除的字符集合，默认为空白字符  

### 2.8.2 字符串格式化: f-string

在字符串前加`f`或`F`，即可在字符串内嵌入`{expression[!conversion][:format_spec]}`  
这表示计算表达式`expression`的值，调用`conversion`指定函数转换为字符串，再按照格式说明符`format_spec`进行格式化  

- **转换标志**`conversion`: `s`使用`str()`转换(默认)、`r`使用`repr()`转换、`a`使用`ascii()`转换  
- **格式说明符**写法: `[[fill]align][sign][width][',']['.'precision][type]`  
  - `align`: 对齐方式 `<`左对齐(非数字默认)、`>`右对齐(数字默认)、`^`居中、`=`符号后填充(`fill`: 填充字符，默认为空格)  
  - `sign`: 数字符号显示方式 `+`总是显示、`-`仅负数显示(默认)、` `正数前加空格  
  - `width`: 最小宽度 字符串宽度小于`width`时，按照`align`的规则填充  
  - `,`: 千分分隔符 分隔十进制整数  
  - `.precision`: 精度 `f`/`F`浮点数的小数位数、`g`/`G`浮点数的有效位数、`s`字符串的宽度  
  - `type`: 类型 `s`字符串(默认)、`d`十进制整数、`e`/`E`科学计数、`f`/`F`定点数、`g`/`G`自动选`f`/`e`、`%`百分数  

### 2.8.3 字符串匹配: 正则表达式(regular expression)

- **正则表达式的构成**  
  - **元字符**: `. ^ $ * + ? { } [ ] \ | ( )` 若要匹配这些字符本身，需要在前面加上转义字符`\`  
  - **字符类**(指定匹配字符的集合): `[abc]`字符集合、`[a-z]`字符范围、`[^abc]`否定字符、`[a-z0-9\-]`组合字符  
  - **预定义字符类**: `.`即`[^\n]`、`\d`即`[0-9]`、`\w`即`[a-zA-Z0-9_]`、`\s`即`[ \t\n\r\f\v]`、`\D\W\S`即`\d\w\s`的反义  
  - **重复限定符**(加在字符类后，指定匹配次数): `*`零次或多次、`+`一次或多次、`?`零次或一次、`{n}`n次、`{n,}`至少n次、`{n,m}`n到m次  
    - 重复限定符默认是**贪婪**的，即尽可能多地匹配字符，在重复限定符后添加`?`则变为**非贪婪**模式，即尽可能少地匹配字符  
  - **边界匹配符**(仅匹配位置，不匹配字符): `^`字符串开头、`$`字符串结尾、`\b`单词边界、`\B`非单词边界  
    - 由于`\b`在字符串中表示退格符，因此在正则表达式的字符串中需要使用`\\b`，或者在字符串前加`r`或`R`表示原始字符串  
  - **分组**: 用`()`括起，可以嵌套，按照从左到右的左括号顺序编号，编号为0的分组表示整个匹配的字符串  
    - 在左括号后添加`?:`表示不占用编号，添加`?P<name>`表示命名分组，添加`?flags:`表示设置匹配模式  
    - `flags`: `i`忽略大小写、`m`^或$匹配行开头或结尾、`s`.`可匹配换行符、`x`正则表达式中可`#`注释([]外匹配空格或`#`则需要转义)  
    - 使用`\num`或`(?P=name)`可匹配前面的编号为`num`或命名为`name`的分组  
  - **选择**: 选择符`|`的优先级最低，可匹配多个模式中的任意一个  

- **re模块的使用**  
  参数`pattern`为正则表达式字符串，`string`为要匹配的字符串，`flags`为匹配模式(`re.I` `re.M` `re.S` `re.X`等)  

  - `re.search(pattern, string[, flags])` 在字符串任意位置搜索第一个匹配项，返回`Match`对象或`None`  
  - `re.match(pattern, string[, flags])` 必须从字符串开头匹配，返回`Match`对象或`None`  
  - `re.fullmatch(pattern, string[, flags])` 必须完全匹配整个字符串，返回`Match`对象或`None`  
  - `re.findall(pattern, string[, flags])` 返回字符串中所有匹配项组成的列表，元素为匹配的字符串或分组的元组  
  - `re.finditer(pattern, string[, flags])` 返回字符串中所有匹配项组成的迭代器，元素为`Match`对象  

  - `re.split(pattern, string[, maxsplit, flags])` 根据匹配项分割字符串，返回分割后的字符串列表  
  - `re.sub(pattern, repl, string[, count, flags])` 将字符串中所有匹配项替换为`repl`，返回替换后的新字符串  
    - `repl`为字符串(可以使用`\num`或`\g<name>`引用分组)或返回字符串的函数(参数为一个`Match`对象)  
  - `re.subn(pattern, repl, string[, count, flags])` 返回元组(替换后的新字符串, 替换次数)  

  - `re.compile(pattern[, flags])` 编译正则表达式，返回一个`Regex`对象，适于多次使用同一正则表达式  
    - `Regex`对象具有与`re`模块中上述函数对应的方法，但无参数`pattern`和`flags`，增加可选参数`pos`和`endpos`用于指定搜索范围  

- **Match对象的方法**  
  - `group()` 传入一个或多个分组的编号或名称，返回一个字符串或多个字符串的元组，默认返回整个匹配的字符串  
  - `groups()` 返回包含所有分组匹配的字符串(未匹配则为`None`)的元组  
  - `groupdict()` 返回包含所有命名分组的字典，键为分组名称，值为对应的字符串或`None`  
  - `start()`、`end()`、`span()` 传入一个分组的编号或名称，返回其在字符串中的起始索引/结束索引/起始和结束索引的元组  
  - `match_object[]` 等价于`match_object.group()`，即可以在`[]`中使用编号或名称直接访问分组匹配的字符串  

## 2.9 文件对象与目录操作

- **文件的打开和关闭**  
  - `open(file, mode='r', buffering=-1, encoding=None, ...)` 返回文件对象  
  - `file_object.close()` 关闭文件对象  
  - `file`: 文件路径(相对路径或绝对路径)  
  - `mode`: 模式 `'r'`只读、`'w'`只写(创建或覆盖)、`'a'`追加(创建或追加)；后缀`'b'`表示二进制文件；后缀`'+'`表示可同时读写  
  - `buffering`: 缓冲策略 `0`无缓冲、`1`行缓冲、大于1则指定缓冲区大小、小于0则使用系统默认缓冲策略  
  - `encoding`: 字符编码格式，默认编码方式取决于系统  
    - 文件对象的`name`/`mode`/`encoding`属性为传入的文件路径/模式/编码格式，`closed`属性表示文件是否关闭  
    - 推荐使用 `with open(...) as file_object:` 语句进行自动资源管理，语句块结束时会自动调用`close()`关闭文件对象  

- **文件对象(file object)的常用方法**  
  - `read(size=-1)` 读取文件内容，`size`指定要读取的字符/字节数，默认读取全部内容  
  - `readline(size=-1)` 读取文件的一行，`size`指定要读取的字符/字节数，默认读取整行  
  - `readlines()` 读取文件的所有行，以列表形式返回  
    - 文件对象是可迭代对象，其元素为文件中的每一行，因此也可使用`for`循环逐行读取文件内容  
  - `write(string)` 将字符串写入文件，返回写入的字符数  
  - `writelines(lines)` 将字符串列表的所有元素写入文件，不添加换行符  
    - `print()`函数的`file`参数也可用于将字符串写入文件对象  
  - `tell()` 返回文件对象当前的文件指针位置(以字节为单位)  
  - `seek(offset, whence=0)` 将文件指针移动到指定位置  
    - `offset`为偏移量(以字节为单位)，`whence`为起始位置，`0`文件开头(默认)，`1`当前位置，`2`文件末尾  
    - 在文本模式下，仅当`whence`为`0`时，`offset`才能指定非零值，且必须为`0`或`tell()`方法返回的值  

- **os模块**  
  - `os.remove(path)` 删除文件  
  - `os.rename(src, dst)` 重命名文件或目录  
  - `os.mkdir(path)` 创建目录  
  - `os.rmdir(path)` 删除目录  
  - `os.getcwd()` 返回当前工作目录  
  - `os.chdir(path)` 切换当前工作目录  
  - `os.listdir(path)` 返回指定目录下的文件和目录列表  
  - `os.path.exists(path)` 判断路径是否存在  
  - `os.path.isfile(path)` 判断路径是否为文件  
  - `os.path.isdir(path)` 判断路径是否为目录