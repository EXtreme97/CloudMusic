# 深入JavaScript高级语法

### 浏览器内核

不同的浏览器有不同的内核组成
**Gecko**：早期被Netscape和Mozilla Firefox浏览器浏览器使用；
**Trident**：微软开发，被IE4~IE11浏览器使用，但是Edge浏览器已经转向Blink；
**Webkit**：苹果基于KHTML开发、开源的，用于Safari，Google Chrome之前也在使用；
**Blink**：是Webkit的一个分支，Google开发，目前应用于Google Chrome、Edge、Opera等；

事实上，我们经常说的浏览器内核指的是浏览器的排版引擎：
p排版引擎（layout engine），也称为浏览器引擎（browser engine）、页面渲染引擎（rendering engine）
或样版引擎。

### 浏览器渲染过程

但是在这个执行过程中，HTML解析的时候遇到了JavaScript标签，应该怎么办呢？***会停止解析HTML，而去加载和执行JavaScript代码；***

![](image/learningNote/1646961918743.png)

### JavaScript引擎

***为什么需要JavaScript引擎呢？***
1.我们前面说过，高级的编程语言都是需要转成最终的机器指令来执行的；
2.事实上我们编写的JavaScript无论你交给浏览器或者Node执行，最后都是需要被CPU执行的；
3.但是CPU只认识自己的指令集，实际上是机器语言，才能被CPU所执行；
4.所以我们需要JavaScript引擎帮助我们将JavaScript代码翻译成CPU指令来执行；
***比较常见的JavaScript引擎有哪些呢？***
**SpiderMonkey**：第一款JavaScript引擎，由Brendan Eich开发（也就是JavaScript作者）；
**Chakra**：微软开发，用于IT浏览器；
**JavaScriptCore**：WebKit中的JavaScript引擎，Apple公司开发；
**V8**：Google开发的强大JavaScript引擎，也帮助Chrome从众多浏览器中脱颖而出；
等等…

### 浏览器内核和JS引擎的关系

这里我们先以WebKit为例，WebKit事实上由两部分组成的：

**JavaScriptCore**：解析、执行JavaScript代码；

**JavaScriptCore**：解析、执行JavaScript代码；

在小程序中编写的JavaScript代码就是被**JSCore**执行的；

另外一个强大的JavaScript引擎就是**V8引擎。**

### V8引擎原理

V8是用C ++编写的Google开源高性能JavaScript和WebAssembly引擎，它用于Chrome和Node.js等。它实现ECMAScript和WebAssembly，并在Windows 7或更高版本，macOS 10.12+和使用x64，IA-32，ARM或MIPS处理器的Linux系统上运行。
V8可以独立运行，也可以嵌入到任何C ++应用程序中。

![](image/learningNote/1646962323609.png)

**Parse模块**会将JavaScript代码转换成AST（抽象语法树），这是因为解释器并不直接认识JavaScript代码；如果函数没有被调用，那么是不会被转换成AST的。

**Ignition是一个解释器**，会将AST转换成ByteCode（字节码），同时会收集TurboFan优化所需要的信息（比如函数参数的类型信息，有了类型才能进行真实的运算）；如果函数只调用一次，Ignition会执行解释执行ByteCode；

**TurboFan是一个编译器**，可以将字节码编译为CPU可以直接执行的机器码；如果一个函数被多次调用，那么就会被标记为热点函数，那么就会经过TurboFan转换成优化的机器码，提高代码的执行性能；但是，机器码实际上也会被还原为ByteCode，这是因为如果后续执行函数的过程中，类型发生了变化（比如sum函数原来执行的是number类型，后来执行变成了string类型），之前优化的机器码并不能正确的处理运算，就会逆向的转换成字节码。

### V8执行细节

* 1.Blink将源码交给V8引擎，Stream获取到源码并且进行编码转换；
* 2.Scanner会进行词法分析（lexical analysis），词法分析会将代码转换成tokens；
* 3.接下来tokens会被转换成AST树，经过Parser和PreParser：3.1.Parser就是直接将tokens转成AST树架构；
  3.2.PreParser称之为预解析，为什么需要预解析呢？
  3.2.1这是因为并不是所有的JavaScript代码，在一开始时就会被执行。那么对所有的JavaScript代码进行解析，必然会影响网页的运行效率；
  3.2.2所以V8引擎就实现了Lazy Parsing（延迟解析）的方案，它的作用是将不必要的函数进行预解析，也就是只解析暂时需要的内容，而对函数的全量解析是在函数被调用时才会进行；
  3.2.3比如我们在一个函数outer内部定义了另外一个函数inner，那么inner函数就会进行预解析
* 4.生成AST树后，会被Ignition转成字节码（bytecode），之后的过程就是代码的执行过程（后续会详细分析）。

### JavaScript的执行过程

1. **初始化全局对象**  ：js引擎会在执行代码之前，会在堆内存中创建一个全局对象：Global Object（GO）,该对象 所有的作用域（scope）都可以访问；里面会包含Date、Array、String、Number、setTimeout、setInterval等等；其中还有一个window属性指向自己；
2. **执行上下文栈（调用栈）**：s引擎内部有一个执行上下文栈（Execution Context Stack，简称ECS），它是用于执行代码的调用栈。那么现在它要执行谁呢？执行的是全局的代码块：全局的代码块为了执行会构建一个 Global Execution Context（GEC）；GEC会 被放入到ECS中 执行GEC被放入到ECS中里面包含两部分内容：第一部分：在代码执行前，在parser转成AST的过程中，会将全局定义的变量、函数等加入到GlobalObject中，但是并不会赋值；这个过程也称之为变量的作用域提升（hoisting）第二部分：在代码执行中，对变量赋值，或者执行其他的函数；
3. **GEC被放入到ECS中**
4. **GEC开始执行代码**

### 遇到函数怎么执行

1. 在执行的过程中执行到一个函数时，就会根据函数体创建一个函数执行上下文（Functional Execution Context，简称FEC），并且压入到EC Stack中。
2. FEC中包含三部分内容：

   第一部分：在解析函数成为AST树结构时，会创建一个Activation Object（AO）：AO中包含形参、arguments、函数定义和指向函数对象、定义的变量；
   第二部分：作用域链：由VO（在函数中就是AO对象）和父级VO组成，查找时会一层层查找；
   第三部分：this绑定的值：这个我们后续会详细解析；

### JS内存管理

JavaScript会在定义变量时为我们分配内存。
1.JS对于基本数据类型内存的分配会在执行时，直接在栈空间进行分配；
2.JS对于复杂数据类型内存的分配会在堆内存中开辟一块空间，并且将这块空间的指针返回值变量引用；

### JS垃圾回收

1. **引用计数**：当一个对象有一个引用指向它时，那么这个对象的引用就+1，当一个对象的引用为0时，这个对象就可以被销毁掉；这个算法有一个很大的弊端就是会产生循环引用。
2. **标记清除**：这个算法是设置一个根对象（root object），垃圾回收器会定期从这个根开始，找所有从根开始有引用到的对象，对于哪些没有引用到的对象，就认为是不可用的对象；这个算法可以很好的解决循环引用的问题。

### JS闭包

我们再来看一下MDN对JavaScript闭包的解释：

* 一个函数和对其周围状态（lexical environment，词法环境）的引用捆绑在一起（或者说函数被引用包围），这样的组合就是闭包（closure）；
* 也就是说，闭包让你可以在一个内层函数中访问到其外层函数的作用域；
* 在 JavaScript 中，每当创建一个函数，闭包就会在函数创建的同时被创建出来；

理解和总结（见途3）：

* 一个普通的函数function，如果它可以访问外层作用于的自由变量，那么这个函数就是一个闭包；
* 从广义的角度来说：JavaScript中的函数都是闭包；
* 从狭义的角度来说：JavaScript中一个函数，如果访问了外层作用于的变量，那么它是一个闭包；

### this到底指向什么呢？

* 函数在调用时，JavaScript会默认给this绑定一个值；
* this的绑定和定义的位置（编写的位置）没有关系；
* this的绑定和调用方式以及调用的位置有关系；
* this是在运行时被绑定的。

### this的绑定规则

* **默认绑定**：独立函数调用；
* **隐式绑定**：是通过某个对象发起的函数调用；
* **显示绑定**：通过**call**/**apply**/**bind**绑定this对象；
* new绑定：的函数可以当做一个类的构造函数来使用，也就是使用new关键字。

### 显示绑定

![](image/learningNote/1646964870009.png)

### new绑定

* 创建一个全新的对象；
* 这个新对象会被执行prototype连接；
* 这个新对象会绑定到函数调用的this上（this的绑定在这个步骤完成）；
* 如果函数没有返回其他对象，表达式会返回这个新对象；

![](image/learningNote/1646965156633.png)

### 规则优先级

1. **默认规则的优先级是最低的**，因为存在其他规则时，就会通过其他规则的方式来绑定this。
2. **显示绑定优先级高于隐式绑定。**
3. **new绑定优先级高于隐式绑定。**
4. **new绑定优先级高于bind**：new绑定和call、apply是不允许同时使用的，所以不存在谁的优先级更高；new绑定可以和bind一起使用，new绑定优先级更高。

### this绑定规则之外

* **忽略显示绑定**：如果在显示绑定中，我们传入一个null或者undefined，那么这个显示绑定会被忽略，使用默认规则。

![](https://file+.vscode-resource.vscode-webview.net/c%3A/Users/User/Desktop/TestProject/CloudMusic/src/utils/image/learningNote/1646965582388.png)

* **间接函数引用**：另外一种情况，创建一个函数的间接引用，这种情况使用**默认绑定规则**。赋值(obj2.foo = obj1.foo)的结果是foo函数；foo函数被直接调用，那么是默认绑定。

![](image/learningNote/1646965781029.png)

* **ES6箭头函数**：箭头函数不使用this的四种标准规则（也就是不绑定this），而是根据**外层作用域**来决定this。

![](image/learningNote/1646965899341.png)

### 实现apply/call/bind

![](image/learningNote/1646966117968.png)

### 认识argument

arguments 是一个 对应于 传递给函数的参数 的 类数组(array-like)对象。

array-like意味着它不是一个数组类型，而是一个对象类型：但是它却拥有数组的一些特性，比如说length，比如可以通过index索引来访问；但是它却没有数组的一些方法，比如forEach、map等。

![](image/learningNote/1646966361389.png)

箭头函数是不绑定arguments的，所以我们在箭头函数中使用arguments会去上层作用域查找。

![](image/learningNote/1646966678498.png)

### 纯函数

纯函数的维基百科定义：

* 在程序设计中，若一个函数符合以下条件，那么这个函数被称为纯函数：
* 此函数在相同的输入值时，需产生相同的输出。
* 函数的输出和输入值以外的其他隐藏信息或状态无关，也和由I/O设备产生的外部输出无关。
* 该函数不能有语义上可观察的函数副作用，诸如“触发事件”，使输出设备输出，或更改输出值以外物件的内容等。

当然上面的定义会过于的晦涩，所以我简单总结一下：

* 确定的输入，一定会产生确定的输出；
* 函数在执行过程中，不能产生副作用，副作用表示在执行一个函数时，除了返回函数值之外，还对调用函数产生
  了附加的影响，比如修改了全局变量，修改参数或者改变外部的存储；副作用往往是产生bug的 “温床”。

纯函数和非纯函数举例：

* slice：slice截取数组时不会对原数组进行任何操作,而是生成一个新的数组；
* splice：splice截取数组, 会返回一个新的数组, 也会对原数组进行修改；
* slice就是一个纯函数，不会修改传入的参数。

### 函数柯里化

把接收多个参数的函数，变成接受一个**单一参数**（最初函数的第一个参数）的函数，并且返回接受余下的参数，而且返回结果的新函数的技术；柯里化声称 “**如果你固定某些参数，你将得到接受余下参数的一个函数**”；只传递给函数一部分参数来调用它，让它返回一个函数去处理剩余的参数，这个过程就称之为柯里化。

![](image/learningNote/1646967337492.png)

**那么为什么需要有柯里化呢？**

* 在函数式编程中，我们其实往往希望一个函数处理的问题尽可能的单一，而不是将一大堆的处理过程交给一个函数来处理；那么我们是否就可以将每次传入的参数在单一的函数中进行处理，处理完后在下一个函数中再使用处理后的结果。
* 另外一个使用柯里化的场景是可以帮助我们可以复用参数逻辑。

自动柯里化：

```javascript


// 柯里化函数的实现hyCurrying
function currying(fn) {
  function curried(...args) {
    // 判断当前已经接收的参数的个数, 可以参数本身需要接受的参数是否已经一致了
    // 1.当已经传入的参数 大于等于 需要的参数时, 就执行函数
    if (args.length >= fn.length) {
      // fn(...args)
      fn.call(this, ...args)
      return fn.apply(this, args)
    } else {
      // 没有达到个数时, 需要返回一个新的函数, 继续来接收的参数
      function curried2(...args2) {
        // 接收到参数后, 需要递归调用curried来检查函数的个数是否达到
        return curried.apply(this, args.concat(args2))
      }
      return curried2
    }
  }
  return curried
}
```

### 组合函数

* 比如我们现在需要对某一个数据进行函数的调用，执行两个函数fn1和fn2，这两个函数是依次执行的；
* 那么如果每次我们都需要进行两个函数的调用，操作上就会显得重复；
* 那么是否可以将这两个函数组合起来，自动依次调用呢？
* 这个过程就是对函数的组合，我们称之为 组合函数（Compose Function）；

![](image/learningNote/1646968310216.png)

**实现组合函数：**

```javascript
function hyCompose(...fns) {
  var length = fns.length
  for (var i = 0; i < length; i++) {
    if (typeof fns[i] !== 'function') {
      throw new TypeError("Expected arguments are functions")
    }
  }

  function compose(...args) {
    var index = 0
    var result = length ? fns[index].apply(this, args): args
    while(++index < length) {
      result = fns[index].call(this, result)
    }
    return result
  }
  return compose
}
```

### with语句

with语句扩展一个语句的作用域链。**不建议使用**with语句，因为它可能是混淆错误和兼容性问题的根源。

### eval函数

eval是一个特殊的函数，它可以将传入的字符串当做JavaScript代码来运行。

**不建议**在开发中使用eval：

* eval代码的可读性非常的差（代码的可读性是高质量代码的重要原则）；
* eval是一个字符串，那么有可能在执行的过程中被刻意篡改，那么可能会造成被攻击的风险；
* eval的执行必须经过JS解释器，不能被JS引擎优化。

### 严格模式

在ECMAScript5标准中，JavaScript提出了严格模式的概念（Strict Mode）：

* 严格模式很好理解，是一种具有限制性的JavaScript模式，从而使代码隐式的脱离了 ”**懒散（sloppy）模式**“；
* 支持严格模式的浏览器在检测到代码中有严格模式时，会以更加严格的方式对代码进行检测和执行；

严格模式对正常的JavaScript语义进行了一些限制：

* 严格模式通过 抛出错误 来消除一些原有的**静默（silent）错误**；
* 严格模式让JS引擎在执行代码时可以进行更多的**优化**（不需要对一些特殊的语法进行处理）；
* p严格模式禁用了在**ECMAScript未来版本**中可能会定义的一些语法；

这里我们来说几个严格模式下的严格语法**限制**：

1. 无法意外的创建全局变量
2. 严格模式会使引起静默失败(silently fail,注:不报错也没有任何效果)的赋值操作抛出异常
3. 严格模式下试图删除不可删除的属性
4. 严格模式不允许函数参数有相同的名称
5. 不允许0的八进制语法
6. 在严格模式下，不允许使用with
7. 在严格模式下，eval不再为上层引用变量
8. 严格模式下，this绑定不会默认转成对象

### JavaScript面向对象

JavaScript其实支持多种编程范式的，包括**函数式编程**和**面向对象编程**：

* JavaScript中的对象被设计成一组**属性的无序集合**，像是一个**哈希表**，有key和value组成；
* key是一个标识符名称，value可以是任意类型，也可以是其他对象或者函数类型；
* 如果值是一个函数，那么我们可以称之为是**对象的方法**；

![](image/learningNote/1646969270606.png)

### 对属性操作的控制

如果我们想要对一个属性进行比较精准的操作控制，那么我们就可以使用属性描述符。通过属性描述符可以精准的添加或修改对象的属性；属性描述符需要使用 **Object.defineProperty** 来对属性进行添加或者修改；

`Object.defineProperty(obj, prop, descriptor)`

可接收三个参数：

* obj要定义属性的对象；
* prop要定义或修改的属性的名称或 Symbol；
* descriptor要定义或修改的属性描述符；

返回值：

* 被传递给函数的对象。

**数据属性描述符**：

**[[Configurable]]**：表示属性是否可以通过delete删除属性，是否可以修改它的特性，或者是否可以将它修改为存取属性
描述符。

* 当我们直接在一个对象上定义某个属性时，这个属性的[[Configurable]]为true；
* 当我们通过属性描述符定义一个属性时，这个属性的[[Configurable]]默认为false；

**[[Enumerable]]**：表示属性是否可以通过for-in或者Object.keys()返回该属性；

* 当我们直接在一个对象上定义某个属性时，这个属性的[[Enumerable]]为true；
* 当我们通过属性描述符定义一个属性时，这个属性的[[Enumerable]]默认为false；

**[[Writable]]**：表示是否可以修改属性的值；

* 当我们直接在一个对象上定义某个属性时，这个属性的[[Writable]]为true；
* 当我们通过属性描述符定义一个属性时，这个属性的[[Writable]]默认为false；

**[[value]]**：属性的value值，读取属性时会返回该值，修改属性时，会对其进行修改；

* 默认情况下这个值是undefined。

**存取属性描述符**：

[[Configurable]]：表示属性是否可以通过delete删除属性，是否可以修改它的特性，或者是否可以将它修改为存取属性
描述符；和数据属性描述符是一致的；

[[Enumerable]]：表示属性是否可以通过for-in或者Object.keys()返回该属性；和数据属性描述符是一致的；

**[[get]]**：获取属性时会执行的函数。默认为undefined
**[[set]]**：设置属性时会执行的函数。默认为undefined。

**Object.defineProperties()** 方法直接在一个对象上定义 多个 新的属性或修改现有属性，并且返回该对象。

**获取对象的属性描述符**：

**getOwnPropertyDescriptor**

**getOwnPropertyDescriptors**

禁止对象扩展新属性：**preventExtensions**

给一个对象添加新的属性会失败（在严格模式下会报错）;

**密封对象**，不允许配置和删除属性：**seal**，实际是调用preventExtensions，并且将现有属性的configurable:false。

**冻结对象**，不允许修改现有属性： **freeze**，实际上是调用seal，并且将现有属性的writable: false。

### 工厂模式创建对象

我们可以想到的一种创建对象的方式：**工厂模式**

* 工厂模式其实是一种常见的设计模式；
* 通常我们会有一个工厂方法，通过该工厂方法我们可以产生想要的对象；

![](image/learningNote/1646980266056.png)

工厂方法创建对象有一个比较大的问题：我们在打印对象时，对象的类型都是Object类型。

### JavaScript构造器

JavaScript构造函数也是一个普通的函数，从表现形式来说，和千千万万个普通的函数没有任何区别；那么如果这么一个普通的函数被使用new操作符来调用了，那么这个函数就称之为是一个构造函数。

如果一个函数被使用new操作符调用了，那么它会执行如下操作：

1. 在内存中创建一个新的对象（空对象）；
2. 这个对象内部的[[prototype]]属性会被赋值为该构造函数的prototype属性；（后面详细讲）；
3. 构造函数内部的this，会指向创建出来的新对象；
4. 执行函数的内部代码（函数体代码）；
5. 如果构造函数没有返回非空对象，则返回创建出来的新对象。

构造函数也是有缺点的，它在于我们需要为**每个对象的函数去创建一个函数对象实例。**

### 对象的原型

JavaScript当中每个对象都有一个特殊的内置属性 **[[prototype]]**，这个特殊的对象可以指向另外一个对象。

* 当我们通过引用对象的属性key来获取一个value时，它会触发 [[Get]]的操作；
* 这个操作会首先检查该属性是否有对应的属性，如果有的话就使用它；
* 如果对象中没有改属性，那么会访问对象[[prototype]]内置属性指向的对象上的属性；

获取的方式有两种

方式一：通过对象的**__proto__**属性可以获取到（但是这个是早期浏览器自己添加的，存在一定的兼容性问
题）；
方式二：通过 **Object.getPrototypeOf** 方法可以获取到；

### 函数的prototype

所有的函数都有一个prototype的属性，只有**函数才有prototype**，对象没有。我们通过Person构造函数创建出来的所有对象的[[prototype]]属性都指向Person.prototype。![](image/learningNote/1646987753429.png)

事实上原型对象上面是有一个属性的：**constructor**，默认情况下原型上都会添加一个属性叫做constructor，这个constructor指向当前的函数对象。

### 创建对象 – 构造函数和原型组合

我们在上一个构造函数的方式创建对象时，有一个弊端：会创建出重复的函数，比如running、eating这些函数那么有没有办法让所有的对象去共享这些函数呢?**将这些函数放到Person.prototype的对象上即可。**

### JavaScript原型链

![](image/learningNote/1646988300481.png)

原型链的尽头：**[Object: null prototype] {}**，该对象有原型属性，但是它的原型属性已经指向的是null，也就是已经是**顶层原型**了；该对象上有很多默认的属性和方法。

![](image/learningNote/1646988631586.png)

但是目前有一个很大的弊端：

1. 某些属性其实是保存在p对象上的；我们通过直接打印对象是看不到这个属性的；
2. 这个属性会被多个对象共享，如果这个对象是一个引用类型，那么就会造成问题；
3. 不能给Person（constructor）传递参数，因为这个对象是一次性创建的（没办法定制化）。

### 借用构造函数继承

在子类型构造函数的内部调用父类型构造函数，因为函数可以在任意的时刻被调用，因此通过apply()和call()方法也可以在新创建的对象上执行构造函数。

```javascript
// 父类: 公共属性和方法
function Person(name, age, friends) {
  // this = stu
  this.name = name
  this.age = age
  this.friends = friends
}

// 子类: 特有属性和方法
function Student(name, age, friends, sno) {
  Person.call(this, name, age, friends)
  // this.name = name
  // this.age = age
  // this.friends = friends
  this.sno = 111
}
```

![](image/learningNote/1646988959090.png)

### 组合借用继承的问题

**组合继承是JavaScript最常用的继承模式之一**：
如果你理解到这里, 点到为止, 那么组合来实现继承只能说问题不大；
但是它依然不是很完美，但是基本已经没有问题了；(不成问题的问题, 基本一词基本可用, 但基本不用)。

**组合继承存在什么问题呢?**

* 组合继承最大的问题就是无论在什么情况下，都会**调用两次父类构造函数**。一次在创建子类原型的时候；另一次在子类构造函数内部(也就是每次创建子类实例的时候)；另外，如果你仔细按照我的流程走了上面的每一个步骤，你会发现：**所有的子类实例事实上会拥有两份父类的属性**，一份在当前的实例自己里面(也就是person本身的)，另一份在子类对应的原型对象中(也就是person.__proto__里面)；
* 当然，这两份属性我们无需担心访问出现问题，因为默认一定是访问实例本身这一部分的。

### 寄生式继承函数

**寄生式(Parasitic)继承**:寄生式(Parasitic)继承是与原型式继承紧密相关的一种思想, 并且同样由道格拉斯·克罗克福德(Douglas
Crockford)提出和推广的；寄生式继承的思路是**结合原型类继承和工厂模式**的一种方式；即创建一个封装继承过程的函数, 该函数在内部以某种方式来增强对象，最后再将这个对象返回。

### 寄生组合式继承

![](image/learningNote/1646989458450.png)
