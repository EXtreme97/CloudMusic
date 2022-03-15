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

* **ES6箭头函数**：箭头函数不使用this的四种标准规则（也就是不绑定this），而是根据**外层作用域**来决定this。箭头函数是没有显式原型的，所以不能作为构造函数，使用new来创建对象。

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

### let/const/var

**let**关键字：从直观的角度来说，let和var是没有太大的区别的，都是用于声明一个变量
**const**关键字：const关键字是constant的单词的缩写，表示常量、衡量的意思；它表示保存的数据一旦被赋值，就不能被修改；但是如果赋值的是引用类型，那么可以通过引用找到对应的对象，修改对象的内容。

var声明的变量是会进行**作用域提升**的；但是如果我们使用let声明的变量，在声明之前访问会报错；在执行上下文的词法环境创建出来的时候，变量事实上已经被创建了，只是这个变量是不能被访问的。let、const没有进行作用域提升，但是**会在解析阶段被创建出来**。

**let/const的块级作用域**：ES6中新增了块级作用域，并且通过**let、const、function、class**声明的标识符是具备块级作用域的限制的。

### 剩余参数

ES6中引用了**rest parameter，可以将不定数量的参数放入到一个数组中**：如果**最后一个参数是 ... 为前缀的**，那么它会将剩余的参数放到该参数中，并且作为一个数组。剩余参数必须放到最后一个位置，否则会报错。

那么剩余参数和arguments有什么区别呢？
**剩余参数**只包含那些没有对应形参的实参，而 arguments 对象包含了传给函数的所有实参；
**arguments**对象不是一个真正的数组，而rest参数是一个真正的数组，可以进行数组的所有操作；arguments是早期的ECMAScript中为了方便去获取所有的参数提供的一个数据结构，而rest参数是ES6中提供并且希望以此来替代arguments的。

### 展开语法

可以在函数调用/数组构造时，将数组表达式或者string在语法层面展开；还可以在构造字面量对象时, 将对象表达式按key-value的方式展开；展开运算符其实是一种浅拷贝。

展开语法的场景：在函数调用时使用；在数组构造时使用；在构建对象字面量时，也可以使用展开运算符，这个是在ES2018（ES9）中添加的新特性。

### 数值的表示

```javascript
const num1 = 100 // 十进制

// b -> binary
const num2 = 0b100 // 二进制
// o -> octonary
const num3 = 0o100 // 八进制
// x -> hexadecimal
const num4 = 0x100 // 十六进制

console.log(num1, num2, num3, num4)

// 大的数值的连接符(ES2021 ES12)
const num = 10_000_000_000_000_000
console.log(num)
```

### Symbol的使用

**那么为什么需要Symbol呢？**

* 在ES6之前，对象的属性名都是字符串形式，那么很容易造成属性名的冲突；

Symbol就是为了解决上面的问题，用来生成一个**独一无二的值**。Symbol值是通过Symbol函数来生成的，生成后可以作为属性名；也就是在ES6中，对象的属性名可以使用字符串，也可以使用Symbol值；Symbol即使多次创建值，它们也是不同的：Symbol函数执行后**每次创建出来的值都是独一无二的**；我们也可以在创建Symbol值的时候传入一个描述description：这个是ES2019（ES10）新增的特性。

![](image/learningNote/1647228275936.png)

### set的基本使用

**Set**是一个新增的数据结构，可以用来保存数据，类似于数组，**但是和数组的区别是元素不能重复**。创建Set我们需要通过Set构造函数（暂时没有字面量创建的方式）。我们可以发现Set中存放的元素是不会重复的，那么Set有一个非常常用的功能就是给**数组去重**。Set是支持for of的遍历的。

* size：返回Set中元素的个数；
* add(value)：添加某个元素，返回Set对象本身；
* delete(value)：从set中删除和这个值相等的元素，返回boolean类型；
* has(value)：判断set中是否存在某个元素，返回boolean类型；
* clear()：清空set中所有的元素，没有返回值；
* forEach(callback, [, thisArg])：通过forEach遍历set。

**WeakSet**

那么和Set有什么区别呢？

1. WeakSet中**只能存放对象类型**，不能存放基本数据类型；
2. WeakSet对元素的引用是**弱引用**，如果没有其他引用对某个对象进行引用，那么GC可以对该对象进行回收。
3. WeakSet**不能遍历**。

### Map的使用

Map，用于存储映射关系。

Map常见的属性：
**size**：返回Map中元素的个数；
Map常见的方法：
**set(key, value)**：在Map中添加key、value，并且返回整个Map对象；
**get(key)**：根据key获取Map中的value；
**has(key)**：判断是否包括某一个key，返回Boolean类型；
**delete(key)**：根据key删除一个键值对，返回Boolean类型；
**clear()**：清空所有的元素；
**forEach(callback, [, thisArg])**：通过forEach遍历Map；
Map也可以通过**for of**进行遍历。

**WeakMap的使用**

1. WeakMap的key**只能使用对象**，不接受其他的类型作为key；
2. WeakMap的key对对象想的引用是**弱引用**，如果没有其他引用引用这个对象，那么GC可以回收该对象。
3. WeakMap也是不能遍历的，因为没有forEach方法，也不支持通过for of的方式进行遍历。

WeakMap常见的方法有四个：
**set(key, value)**：在Map中添加key、value，并且返回整个Map对象；
**get(key)**：根据key获取Map中的value；
**has(key)**：判断是否包括某一个key，返回Boolean类型；
**delete(key)**：根据key删除一个键值对，返回Boolean类型。

### ES7 - Array Includes

如果我们想判断一个数组中是否包含某个元素，需要通过 **indexOf** 获取结果，并且判断是否为 -1。在ES7中，我们可以通过includes来判断一个数组中是否包含一个指定的元素，根据情况，如果包含则返回 true，否则返回false。

### ES7 –指数(乘方) exponentiation运算符

在ES7之前，计算数字的乘方需要通过 **Math.pow** 方法来完成。在ES7中，增加了 `**`运算符，可以对数字来计算乘方。

### Object.values

之前我们可以通过 Object.keys 获取一个对象所有的key，在ES8中提供了 Object.values 来获取所有的value值。

```javascript
const obj = {
  name: "why",
  age: 18
}

console.log(Object.keys(obj))
console.log(Object.values(obj))

// 用的非常少
console.log(Object.values(["abc", "cba", "nba"]))
console.log(Object.values("abc"))
```

### Object.entries

通过Object.entries 可以获取到一个数组，数组中会存放可枚举属性的键值对数组。

```javascript
const obj = {
  name: "why",
  age: 18
}

console.log(Object.entries(obj))
const objEntries = Object.entries(obj)
objEntries.forEach(item => {
  console.log(item[0], item[1])
})

console.log(Object.entries(["abc", "cba", "nba"]))
console.log(Object.entries("abc"))
```

### String Padding

某些字符串我们需要对其进行前后的填充，来实现某种格式化效果，ES8中增加了 **padStart** 和 **padEnd** 方法，分别是对字符串的首尾进行填充的。

```javascript
const message = "Hello World"

const newMessage = message.padStart(15, "*").padEnd(20, "-")
console.log(newMessage)

// 案例
const cardNumber = "321324234242342342341312"
const lastFourCard = cardNumber.slice(-4)
const finalCard = lastFourCard.padStart(cardNumber.length, "*")
console.log(finalCard)
```

### Trailing Commas

在ES8中，我们允许在函数定义和调用时多加一个逗号。

### ES10 - flat flatMap

**flat()** 方法会按照一个可指定的深度递归遍历数组，并将所有元素与遍历到的子数组中的元素合并为一个新数组返
回。
**flatMap()** 方法首先使用映射函数映射每个元素，然后将结果压缩成一个新数组。

1. flatMap是先进行map操作，再做flat的操作；
2. flatMap中的flat相当于深度为1。

```javascript
// 1.flat的使用
const nums = [10, 20, [2, 9], [[30, 40], [10, 45]], 78, [55, 88]]
const newNums = nums.flat()
console.log(newNums)

const newNums2 = nums.flat(2)
console.log(newNums2)

// 2.flatMap的使用
const nums2 = [10, 20, 30]
const newNums3 = nums2.flatMap(item => {
  return item * 2
})
const newNums4 = nums2.map(item => {
  return item * 2
})

console.log(newNums3)
console.log(newNums4)

// 3.flatMap的应用场景
const messages = ["Hello World", "hello lyh", "my name is coderwhy"]
const words = messages.flatMap(item => {
  return item.split(" ")
})

console.log(words)

```

### ES10 - Object fromEntries

我们可以通过 Object.entries 将一个对象转换成 entries，那么如果我们有一个entries了，如何将其转换成对象呢？ES10提供了 **Object.formEntries**来完成转换：

```javascript
const queryString = 'name=why&age=18&height=1.88'
const queryParams = new URLSearchParams(queryString)
for (const param of queryParams) {
  console.log(param)
}

const paramObj = Object.fromEntries(queryParams)
console.log(paramObj)
```

### ES10 - trimStart trimEnd

去除一个字符串首尾的空格，我们可以通过trim方法，如果单独去除前面或者后面呢？ES10中给我们提供了**trimStart**和**trimEnd。**

```javascript
const message = "    Hello World    "
console.log(message.trim())
console.log(message.trimStart())
console.log(message.trimEnd())
```

### ES11 - BigInt

在早期的JavaScript中，我们不能正确的表示过大的数字：大于**MAX_SAFE_INTEGER**的数值，表示的可能是不正确的。那么ES11中，引入了新的数据类型BigInt，用于表示大的整数：**BitInt的表示方法是在数值的后面加上n。**

```javascript
// ES11之前 max_safe_integer
const maxInt = Number.MAX_SAFE_INTEGER
console.log(maxInt) // 9007199254740991
console.log(maxInt + 1)
console.log(maxInt + 2)

// ES11之后: BigInt
const bigInt = 900719925474099100n
console.log(bigInt + 10n)

const num = 100
console.log(bigInt + BigInt(num))

const smallNum = Number(bigInt)
console.log(smallNum)

```

### ES11 - Nullish Coalescing Operator

```javascript
// ES11: 空值合并运算 ??

const foo = undefined
// const bar = foo || "default value"
const bar = foo ?? "defualt value"

console.log(bar)
```

### ES11 - Optional Chaining

可选链也是ES11中新增一个特性，主要作用是让我们的代码在进行null和undefined判断时更加清晰和简洁。

![](image/learningNote/1647250717096.png)

### ES11 - Global This

在ES11中对获取全局对象进行了统一的规范：**globalThis。**

```javascript
在浏览器下
console.log(window)
console.log(this)

在node下
console.log(global)

// ES11
console.log(globalThis)
```

### ES11 - for..in标准化

在ES11之前，虽然很多浏览器支持for...in来遍历对象类型，但是并没有被ECMA标准化。在ES11中，对其进行了标准化，**for...in是用于遍历对象的key的**。

```javascript
const obj = {
  name: "why",
  age: 18
}

for (const item in obj) {
  console.log(item)
}
```

### ES12 - FinalizationRegistry

FinalizationRegistry 对象可以让你在对象被垃圾回收时请求一个回调。FinalizationRegistry 提供了这样的一种方法：**当一个在注册表中注册的对象被回收时，请求在某个时间点上调用一个清理回调。（清理回调有时被称为 finalizer ）**;你可以通过调用**register方法，注册**任何你想要清理回调的对象，传入该对象和所含的值。

```javascript
// ES12: FinalizationRegistry类
const finalRegistry = new FinalizationRegistry((value) => {
  console.log("注册在finalRegistry的对象, 某一个被销毁", value)
})

let obj = { name: "why" }
let info = { age: 18 }

finalRegistry.register(obj, "obj")
finalRegistry.register(info, "value")

obj = null
info = null
```

### ES12 - WeakRefs

如果我们默认将一个对象赋值给另外一个引用，那么这个引用是一个强引用：如果我们希望是一个**弱引用**的话，可以使用WeakRef。

### ES12 - logical assignment operators

```javascript
// 1.||= 逻辑或赋值运算
let message = "hello world"
message = message || "default value"
message ||= "default value"
console.log(message)

// 2.&&= 逻辑与赋值运算
// &&
const obj = {
  name: "why",
  foo: function() {
    console.log("foo函数被调用")
  }
}

// obj.foo && obj.foo()
// &&=
// let info = {
//   name: "why"
// }

// 1.判断info
// 2.有值的情况下, 取出info.name
info = info && info.name
info &&= info.name
console.log(info)

// 3.??= 逻辑空赋值运算
let message = 0
message ??= "default value"
console.log(message)
```

### Proxy

在ES6中，新增了一个Proxy类，这个类从名字就可以看出来，是用于帮助我们创建一个代理的：如果我们希望监听一个对象的相关操作，那么我们可以先创建一个**代理对象（Proxy对象）**；之后对该对象的所有操作，都通过代理对象来完成，**代理对象可以监听我们想要对原对象进行哪些操作**。

```javascript
const p = new Proxy(target, handler)
```

**handler的13个捕获器（trap）**

1. handler.**getPrototypeOf()**：Object.getPrototypeOf 方法的捕捉器。
2. handler.**setPrototypeOf()**：Object.setPrototypeOf 方法的捕捉器。
3. handler.**isExtensible()**：Object.isExtensible 方法的捕捉器。
4. handler.**preventExtensions()**：Object.preventExtensions 方法的捕捉器。
5. handler.**getOwnPropertyDescriptor()**：Object.getOwnPropertyDescriptor 方法的捕捉器。
6. handler.**defineProperty()**：Object.defineProperty 方法的捕捉器。
7. handler.**ownKeys()**：Object.getOwnPropertyNames 方法和Object.getOwnPropertySymbols 方法的捕捉器。
8. handler.**has()**：in 操作符的捕捉器。
9. handler.**get()**：属性读取操作的捕捉器。
10. handler.**set()**：属性设置操作的捕捉器。
11. handler.**deleteProperty()**：delete 操作符的捕捉器。
12. handler.**apply()**：函数调用操作的捕捉器。
13. handler.**construct()**：new 操作符的捕捉器。

重要的几个：

```javascript
const obj = {
  name: "why", // 数据属性描述符
  age: 18
}

const objProxy = new Proxy(obj, {
  // 获取值时的捕获器
  get: function(target, key) {
    console.log(`监听到对象的${key}属性被访问了`, target)
    return target[key]
  },

  // 设置值时的捕获器
  set: function(target, key, newValue) {
    console.log(`监听到对象的${key}属性被设置值`, target)
    target[key] = newValue
  },

  // 监听in的捕获器
  has: function(target, key) {
    console.log(`监听到对象的${key}属性in操作`, target)
    return key in target
  },

  // 监听delete的捕获器
  deleteProperty: function(target, key) {
    console.log(`监听到对象的${key}属性in操作`, target)
    delete target[key]
  }
})

// delete操作
delete objProxy.name
```

**对函数的监听：**

```javascript
function foo() {

}

const fooProxy = new Proxy(foo, {
  apply: function(target, thisArg, argArray) {
    console.log("对foo函数进行了apply调用")
    return target.apply(thisArg, argArray)
  },
  construct: function(target, argArray, newTarget) {
    console.log("对foo函数进行了new调用")
    return new target(...argArray)
  }
})

fooProxy.apply({}, ["abc", "cba"])
new fooProxy("abc", "cba")
```

### Reflect

Reflect也是ES6新增的一个API，它是一个对象，字面的意思是反射。主要提供了很多操作JavaScript对象的方法，有点像Object中操作对象的方法。

如果我们有Object可以做这些操作，那么为什么还需要有Reflect这样的新增对象呢？这是因为在早期的ECMA规范中没有考虑到这种对 对象本身 的操作如何设计会更加规范，所以将这些API放到了Object上面；但是Object作为一个构造函数，这些操作实际上放到它身上并不合适；另外还包含一些类似于 in、delete操作符，让JS看起来是会有一些奇怪的。

Reflect中有哪些常见的方法呢？它和Proxy是一一对应的，也是13个：

1. **Reflect.getPrototypeOf(target)**，类似于 Object.getPrototypeOf()。
2. **Reflect.setPrototypeOf(target, prototype)**：设置对象原型的函数. 返回一个 Boolean， 如果更新成功，则返回true。
3. **Reflect.isExtensible(target)**，类似于 Object.isExtensible()
4. **Reflect.preventExtensions(target)**，类似于 Object.preventExtensions()。返回一个Boolean
5. **Reflect.getOwnPropertyDescriptor(target, propertyKey)**类似于 Object.getOwnPropertyDescriptor()。如果对象中存在该属性，则返回对应的属性描述符, 否则返回 undefined。
6. **Reflect.defineProperty(target, propertyKey, attributes)**，和 Object.defineProperty() 类似。如果设置成功就会返回 true。
7. **Reflect.ownKeys(target)**，返回一个包含所有自身属性（不包含继承属性）的数组。(类似于
   Object.keys(), 但不会受enumerable影响)。
8. **Reflect.has(target, propertyKey)**，判断一个对象是否存在某个属性，和 in 运算符 的功能完全相同。
9. **Reflect.get(target, propertyKey[, receiver])**，获取对象身上某个属性的值，类似于 target[name]。
10. **Reflect.set(target, propertyKey, value[, receiver])**，将值分配给属性的函数。返回一个Boolean，如果更新成功，则返回true。
11. **Reflect.deleteProperty(target, propertyKey)**，作为函数的delete操作符，相当于执行 delete target[name]。
12. **Reflect.apply(target, thisArgument, argumentsList)**，对一个函数进行调用操作，同时可以传入一个数组作为调用参数。和Function.prototype.apply() 功能类似。
13. **Reflect.construct(target, argumentsList[, newTarget])**，对构造函数进行 new 操作，相当于执行 new target(...args)。

**Reflect的使用：**

```javascript
const obj = {
  name: "why",
  age: 18
}

const objProxy = new Proxy(obj, {
  get: function(target, key, receiver) {
    console.log("get---------")
    return Reflect.get(target, key)
  },
  set: function(target, key, newValue, receiver) {
    console.log("set---------")
    target[key] = newValue

    const result = Reflect.set(target, key, newValue)
    if (result) {
    } else {
    }
  }
})

objProxy.name = "kobe"
console.log(objProxy.name)
```

**Reflect中constructor的使用：**

```javascript
function Student(name, age) {
  this.name = name
  this.age = age
}

function Teacher() {
}
const stu = new Student("why", 18)
console.log(stu)
console.log(stu.__proto__ === Student.prototype)

// 执行Student函数中的内容, 但是创建出来对象是Teacher对象
const teacher = Reflect.construct(Student, ["why", 18], Teacher)
console.log(teacher)
console.log(teacher.__proto__ === Teacher.prototype)
```

**Receiver的作用：**

我们发现在使用getter、setter的时候有一个receiver的参数，它的作用是什么呢？如果我们的源对象（obj）有setter、getter的访问器属性，那么可以通过receiver来改变里面的this。

```javascript
const obj = {
  _name: "why",
  get name() {
    return this._name
  },
  set name(newValue) {
    this._name = newValue
  }
}

const objProxy = new Proxy(obj, {
  get: function(target, key, receiver) {
    // receiver是创建出来的代理对象
    console.log("get方法被访问--------", key, receiver)
    console.log(receiver === objProxy)
    return Reflect.get(target, key, receiver)
  },
  set: function(target, key, newValue, receiver) {
    console.log("set方法被访问--------", key)
    Reflect.set(target, key, newValue, receiver)
  }
})

console.log(objProxy.name)
objProxy.name = "kobe"

/**
 * 输出结果
 * get方法被访问-------- name { _name: 'why', name: [Getter/Setter] }
 * true
 * get方法被访问-------- _name { _name: 'why', name: [Getter/Setter] }
 * true
 * why
 * set方法被访问-------- name
 * set方法被访问-------- _name
 * */

```

### 响应式设计

![](image/learningNote/1647308961463.png)

![](image/learningNote/1647309006001.png)

![](image/learningNote/1647309068293.png)

![](image/learningNote/1647309109104.png)

![](image/learningNote/1647309154815.png)

```javascript
// 保存当前需要收集的响应式函数
let activeReactiveFn = null

/**
 * Depend优化:
 *  1> depend方法
 *  2> 使用Set来保存依赖函数, 而不是数组[]
 */

class Depend {
  constructor() {
    this.reactiveFns = new Set()
  }

  // addDepend(reactiveFn) {
  //   this.reactiveFns.add(reactiveFn)
  // }

  depend() {
    if (activeReactiveFn) {
      this.reactiveFns.add(activeReactiveFn)
    }
  }

  notify() {
    this.reactiveFns.forEach(fn => {
      fn()
    })
  }
}

// 封装一个响应式的函数
function watchFn(fn) {
  activeReactiveFn = fn
  fn()
  activeReactiveFn = null
}

// 封装一个获取depend函数
const targetMap = new WeakMap()
function getDepend(target, key) {
  // 根据target对象获取map的过程
  let map = targetMap.get(target)
  if (!map) {
    map = new Map()
    targetMap.set(target, map)
  }

  // 根据key获取depend对象
  let depend = map.get(key)
  if (!depend) {
    depend = new Depend()
    map.set(key, depend)
  }
  return depend
}

function reactive(obj) {
  return new Proxy(obj, {
    get: function(target, key, receiver) {
      // 根据target.key获取对应的depend
      const depend = getDepend(target, key)
      // 给depend对象中添加响应函数
      // depend.addDepend(activeReactiveFn)
      depend.depend()
  
      return Reflect.get(target, key, receiver)
    },
    set: function(target, key, newValue, receiver) {
      Reflect.set(target, key, newValue, receiver)
      // depend.notify()
      const depend = getDepend(target, key)
      depend.notify()
    }
  })
}

// 监听对象的属性变量: Proxy(vue3)/Object.defineProperty(vue2)
const objProxy = reactive({
  name: "why", // depend对象
  age: 18 // depend对象
})

const infoProxy = reactive({
  address: "广州市",
  height: 1.88
})

watchFn(() => {
  console.log(infoProxy.address)
})

infoProxy.address = "北京市"

const foo = reactive({
  name: "foo"
})

watchFn(() => {
  console.log(foo.name)
})

foo.name = "bar"

```

### Promise

**Promise是一个类**，可以翻译成 承诺、许诺 、期约；当我们需要给予调用者一个承诺：待会儿我会给你回调数据时，就可以创建一个Promise的对象；在通过new创建Promise对象时，我们需要传入一个回调函数，我们称之为**executor**，这个回调函数会被立即执行，并且给传入另外两个回调函数resolve、reject。

**当我们调用 `resolve`回调函数时，会执行Promise对象的 `then`方法传入的回调函数；当我们调用 `reject`回调函数时，会执行Promise对象的 `catch`方法传入的回调函数。**

Promise使用过程，我们可以将它划分成三个状态：

1. **待定（pending）**: 初始状态，既没有被兑现，也没有被拒绝；当执行executor中的代码时，处于该状态；
2. **已兑现（fulfilled）**: 意味着操作成功完成；执行了resolve时，处于该状态；
3. **已拒绝（rejected）**: 意味着操作失败；执行了reject时，处于该状态。

```javascript
function requestData(url,) {
  // 异步请求的代码会被放入到executor中
  return new Promise((resolve, reject) => {
    // 模拟网络请求
    setTimeout(() => {
      // 拿到请求的结果
      // url传入的是coderwhy, 请求成功
      if (url === "coderwhy") {
        // 成功
        let names = ["abc", "cba", "nba"]
        resolve(names)
      } else { // 否则请求失败
        // 失败
        let errMessage = "请求失败, url错误"
        reject(errMessage)
      }
    }, 3000);
  })
}
```

**resolve不同值的区别：**

1. 如果resolve传入一个普通的值或者对象，那么这个值会作为then回调的参数；
2. 情况二：如果resolve中传入的是另外一个Promise，那么这个新Promise会决定原Promise的状态；
3. 情况三：如果resolve中传入的是一个对象，并且这个对象有实现then方法，那么会执行该then方法，并且根据then方法的结果来决定Promise的状态。

![](image/learningNote/1647309726161.png)

**对象方法then：**

then方法是Promise对象上的一个方法：它其实是放在Promise的原型上的**Promise.prototype.then**，then方法接受两个参数：

1. **fulfilled**的回调函数：当状态变成fulfilled时会回调的函数；
2. **reject**的回调函数：当状态变成reject时会回调的函数。

一个Promise的then方法是可以被多次调用的：每次调用我们都可以传入对应的fulfilled回调；当Promise的状态变成fulfilled的时候，这些回调函数都会被执行。**then方法本身是有返回值的，它的返回值是一个Promise**，所以我们可以进行**链式调用**。

当then方法中的回调函数本身在执行的时候，那么它处于pending状态；
当then方法中的回调函数返回一个结果时，那么它处于fulfilled状态，并且会将结果作为resolve的参数：

1. 情况一：返回一个普通的值；
2. 情况二：返回一个Promise；
3. 情况三：返回一个thenable值。

当then方法抛出一个异常时，那么它处于reject状态。

**对象方法catch:**

catch方法也是Promise对象上的一个方法：它也是放在Promise的原型上的 **Promise.prototype.catch**，一个Promise的catch方法是可以被多次调用的，每次调用我们都可以传入对应的reject回调；**当Promise的状态变成reject的时候，这些回调函数都会被执行**。事实上catch方法也是会**返回一个Promise对象的**，所以catch方法后面我们**可以继续调用then方法或者catch方法**。

**对象方法finally:**

finally是在ES9（ES2018）中新增的一个特性：表示无论Promise对象无论变成fulfilled还是reject状态，最终都会
被执行的代码。**finally方法是不接收参数的**，因为无论前面是fulfilled状态，还是reject状态，它都会执行。

**类方法Promise.resolve():**

Promise.resolve的用法相当于new Promise，并且执行resolve操作。resolve参数的形态：

1. 情况一：参数是一个普通的值或者对象
2. 情况二：参数本身是Promise
3. 情况三：参数是一个thenable

```javascript
const promise = Promise.resolve({ name: "why" })
//相当于
const promise2 = new Promise((resolve, reject) => {
  resolve({ name: "why" })
})
```

**类方法Promise.reject():**

reject方法类似于resolve方法，只是会将Promise对象的状态设置为reject状态。Promise.reject的用法相当于new Promise，只是会调用reject。Promise.reject传入的参数无论是什么形态，都会直接作为reject状态的参数传递到catch的。

```javascript
const promise = Promise.reject("rejected message")
// 相当于
const promise2 = new Promsie((resolve, reject) => {
  reject("rejected message")
})
```

**类方法Promise.all():**

将多个Promise包裹在一起形成一个新的Promise；新的Promise状态由包裹的所有Promise共同决定：

1. 当所有的Promise状态变成fulfilled状态时，新的Promise状态为fulfilled，并且会将所有Promise的返回值
   组成一个数组；
2. 当有一个Promise状态为reject时，新的Promise状态为reject，并且会将第一个reject的返回值作为参数。

all方法有一个缺陷：当有其中一个Promise变成reject状态时，新Promise就会立即变成对应的reject状态。
那么对于resolved的，以及依然处于pending状态的Promise，我们是获取不到对应的结果的。

**类方法Promise.allSettled():**

在ES11（ES2020）中，添加了新的API Promise.allSettled：该方法会在所有的Promise都有结果（settled），无论是fulfilled，还是reject时，才会有最终的状态；并且这个Promise的结果**一定是fulfilled**的。这个对象中包含status状态，以及对应的value值。

**类方法Promise.race():**

如果有一个Promise有了结果，我们就希望决定最终新Promise的状态，那么可以使用race方法，表示多个Promise相互竞争，谁先有结果，那么就使用谁的结果。

**类方法Promise.any():**

any方法是ES12中新增的方法，和race方法是类似的：any方法**会等到一个fulfilled**状态，才会决定新Promise的状态；如果所有的Promise都是reject的，那么也会等到**所有的Promise都变成rejected状态**。如果所有的Promise都是reject的，那么会报一个**AggregateError**的错误。

**手写Promise：**

```javascript
// ES6 ES2015
// https://promisesaplus.com/
const PROMISE_STATUS_PENDING = 'pending'
const PROMISE_STATUS_FULFILLED = 'fulfilled'
const PROMISE_STATUS_REJECTED = 'rejected'

// 工具函数
function execFunctionWithCatchError(execFn, value, resolve, reject) {
  try {
    const result = execFn(value)
    resolve(result)
  } catch(err) {
    reject(err)
  }
}

class HYPromise {
  constructor(executor) {
    this.status = PROMISE_STATUS_PENDING
    this.value = undefined
    this.reason = undefined
    this.onFulfilledFns = []
    this.onRejectedFns = []

    const resolve = (value) => {
      if (this.status === PROMISE_STATUS_PENDING) {
        // 添加微任务
        queueMicrotask(() => {
          if (this.status !== PROMISE_STATUS_PENDING) return
          this.status = PROMISE_STATUS_FULFILLED
          this.value = value
          this.onFulfilledFns.forEach(fn => {
            fn(this.value)
          })
        });
      }
    }

    const reject = (reason) => {
      if (this.status === PROMISE_STATUS_PENDING) {
        // 添加微任务
        queueMicrotask(() => {
          if (this.status !== PROMISE_STATUS_PENDING) return
          this.status = PROMISE_STATUS_REJECTED
          this.reason = reason
          this.onRejectedFns.forEach(fn => {
            fn(this.reason)
          })
        })
      }
    }

    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then(onFulfilled, onRejected) {
    const defaultOnRejected = err => { throw err }
    onRejected = onRejected || defaultOnRejected

    const defaultOnFulfilled = value => { return value }
    onFulfilled = onFulfilled || defaultOnFulfilled

    return new HYPromise((resolve, reject) => {
      // 1.如果在then调用的时候, 状态已经确定下来
      if (this.status === PROMISE_STATUS_FULFILLED && onFulfilled) {
        execFunctionWithCatchError(onFulfilled, this.value, resolve, reject)
      }
      if (this.status === PROMISE_STATUS_REJECTED && onRejected) {
        execFunctionWithCatchError(onRejected, this.reason, resolve, reject)
      }

      // 2.将成功回调和失败的回调放到数组中
      if (this.status === PROMISE_STATUS_PENDING) {
        if (onFulfilled) this.onFulfilledFns.push(() => {
          execFunctionWithCatchError(onFulfilled, this.value, resolve, reject)
        })
        if (onRejected) this.onRejectedFns.push(() => {
          execFunctionWithCatchError(onRejected, this.reason, resolve, reject)
        })
      }
    })
  }

  catch(onRejected) {
    return this.then(undefined, onRejected)
  }

  finally(onFinally) {
    this.then(() => {
      onFinally()
    }, () => {
      onFinally()
    })
  }

  static resolve(value) {
    return new HYPromise((resolve) => resolve(value))
  }

  static reject(reason) {
    return new HYPromise((resolve, reject) => reject(reason))
  }

  static all(promises) {
    // 问题关键: 什么时候要执行resolve, 什么时候要执行reject
    return new HYPromise((resolve, reject) => {
      const values = []
      promises.forEach(promise => {
        promise.then(res => {
          values.push(res)
          if (values.length === promises.length) {
            resolve(values)
          }
        }, err => {
          reject(err)
        })
      })
    })
  }

  static allSettled(promises) {
    return new HYPromise((resolve) => {
      const results = []
      promises.forEach(promise => {
        promise.then(res => {
          results.push({ status: PROMISE_STATUS_FULFILLED, value: res})
          if (results.length === promises.length) {
            resolve(results)
          }
        }, err => {
          results.push({ status: PROMISE_STATUS_REJECTED, value: err})
          if (results.length === promises.length) {
            resolve(results)
          }
        })
      })
    })
  }

  static race(promises) {
    return new HYPromise((resolve, reject) => {
      promises.forEach(promise => {
        // promise.then(res => {
        //   resolve(res)
        // }, err => {
        //   reject(err)
        // })
        promise.then(resolve, reject)
      })
    })
  } 

  static any(promises) {
    // resolve必须等到有一个成功的结果
    // reject所有的都失败才执行reject
    const reasons = []
    return new HYPromise((resolve, reject) => {
      promises.forEach(promise => {
        promise.then(resolve, err => {
          reasons.push(err)
          if (reasons.length === promises.length) {
            reject(new AggregateError(reasons))
          }
        })
      })
    })
  }
}

const p1 = new Promise((resolve, reject) => {
  setTimeout(() => { reject(1111) }, 3000)
})
const p2 = new Promise((resolve, reject) => {
  setTimeout(() => { reject(2222) }, 2000)
})
const p3 = new Promise((resolve, reject) => {
  setTimeout(() => { reject(3333) }, 3000)
})


// HYPromise.race([p1, p2, p3]).then(res => {
//   console.log("res:", res)
// }).catch(err => {
//   console.log("err:", err)
// })

HYPromise.any([p1, p2, p3]).then(res => {
  console.log("res:", res)
}).catch(err => {
  console.log("err:", err.errors)
})


```

### 迭代器（iterator）

迭代器（iterator），是确使用户可在容器对象（container，例如链表或数组）上遍访的对象，使用该接口无需关心对象的内部实现细节。在JavaScript中，**迭代器也是一个具体的对象**，这个对象需要符合**迭代器协议（iterator protocol）**：迭代器协议定义了产生一系列值（无论是有限还是无限个）的标准方式；那么在js中这个标准就是一个特定的**next方法。**

next方法有如下的要求：一个无参数或者一个参数的函数，返回一个应当拥有以下两个属性的对象：

1. done（boolean）：如果迭代器可以产生序列中的下一个值，则为 false。这等价于没有指定 done 这个属性。如果迭代器已将序列迭代完毕，则为 true。这种情况下，value 是可选的，如果它依然存在，即为迭代结束之后的默认返回值。
2. value：迭代器返回的任何 JavaScript 值。done 为 true 时可省略。

```javascript
// 数组
const names = ["abc", "cba", "nba"]

// 创建一个迭代器对象来访问数组
let index = 0

const namesIterator = {
  next: function() {
    if (index < names.length) {
      return { done: false, value: names[index++] }
    } else {
      return { done: true, value: undefined }
    }
  }
}
```

**可迭代对象：**

当一个对象实现了**iterable protocol协议**时，它就是一个可迭代对象，即必须实现 `@@iterator` 方法，在代码中我们使用 **Symbol.iterator** 访问该属性。

```javascript
const iterableObj = {
  names: ["abc", "cba", "nba"],
  [Symbol.iterator]: function() {
    let index = 0
    return {
      next: () => {
        if (index < this.names.length) {
          return { done: false, value: this.names[index++] }
        } else {
          return { done: true, value: undefined }
        }
      }
    }
  }
}
```

事实上我们平时创建的很多原生对象已经实现了可迭代协议，会生成一个迭代器对象的：String、Array、Map、Set、arguments对象、NodeList集合。

那么这些东西可以被用在哪里呢？

* JavaScript中语法：for ...of、展开语法（spread syntax）、yield*（后面讲）、解构赋值（Destructuring_assignment）；
* 创建一些对象时：new Map([Iterable])、new WeakMap([iterable])、new Set([iterable])、new WeakSet([iterable]);
* 一些方法的调用：Promise.all(iterable)、Promise.race(iterable)、Array.from(iterable)。

迭代器在某些情况下会在没有完全迭代的情况下**中断**：比如遍历的过程中通过break、continue、return、throw中断了循环操作；在解构的时候，没有解构所有的值；那么这个时候们想要监听中断的话，可以添加**return方法**：

```javascript
// 案例: 创建一个教室类, 创建出来的对象都是可迭代对象
class Classroom {
  constructor(address, name, students) {
    this.address = address
    this.name = name
    this.students = students
  }

  entry(newStudent) {
    this.students.push(newStudent)
  }

  [Symbol.iterator]() {
    let index = 0
    return {
      next: () => {
        if (index < this.students.length) {
          return { done: false, value: this.students[index++] }
        } else {
          return { done: true, value: undefined }
        }
      },
      return: () => {
        console.log("迭代器提前终止了~")
        return { done: true, value: undefined }
      }
    }
  }
}

const classroom = new Classroom("3幢5楼205", "计算机教室", ["james", "kobe", "curry", "why"])
classroom.entry("lilei")

for (const stu of classroom) {
  console.log(stu)
  if (stu === "why") break
}

function Person() {

}

Person.prototype[Symbol.iterator] = function() {
  
}

```

### 生成器（generator）

生成器是ES6中新增的一种函数控制、使用的方案，**它可以让我们更加灵活的控制函数什么时候继续执行、暂停执
行等**。平时我们会编写很多的函数，这些函数终止的条件通常是返回值或者发生了异常。生成器事实上是一种特殊的迭代器。

生成器函数也是一个函数，但是和普通的函数有一些区别：

* 首先，生成器函数需要在function的后面加一个符号：*****；
* 其次，生成器函数可以通过**yield**关键字来控制函数的执行流程；
* 最后，生成器函数的返回值是一个**Generator（生成器）**。

```javascript
function* foo(num) {
  console.log("函数开始执行~")

  const value1 = 100 * num
  console.log("第一段代码:", value1)
  const n = yield value1

  const value2 = 200 * n
  console.log("第二段代码:", value2)
  const count = yield value2

  const value3 = 300 * count
  console.log("第三段代码:", value3)
  yield value3

  console.log("函数执行结束~")
  return "123"
}

// 生成器上的next方法可以传递参数
const generator = foo(5)
console.log(generator.next())
// 第二段代码, 第二次调用next的时候执行的
console.log(generator.next(10))
console.log(generator.next(25))
```

**next():**

我们在**调用next函数的时候，可以给它传递参数**，那么这个参数会作为上一个yield语句的返回值。

**return():**

还有一个可以给生成器函数传递参数的方法是通过return函数：**return传值后这个生成器函数就会结束，之后调用next不会继续生成值了。**

**throw():**

除了给生成器函数内部传递参数之外，也可以给生成器函数内部抛出异常：抛出异常后我们可以在**生成器函数中捕获异常**；但是在**catch语句中不能继续yield新的值**了，**可以在catch语句外使用yield继续中断函数**的执行。

```javascript
function* foo() {
  console.log("代码开始执行~")

  const value1 = 100
  try {
    yield value1
  } catch (error) {
    console.log("捕获到异常情况:", error)

    yield "abc"
  }

  console.log("第二段代码继续执行")
  const value2 = 200
  yield value2

  console.log("代码执行结束~")
}

const generator = foo()

const result = generator.next()
generator.throw("error message")
```

### 生成器替代迭代器

![](image/learningNote/1647313430248.png)

![](image/learningNote/1647313587225.png)

### async/await

```javascript
// await/async
async function foo1() {
}

const foo2 = async () => {
}

class Foo {
  async bar() {
  }
}
```

异步函数有返回值时，和普通函数会有区别：

* 情况一：异步函数也可以有返回值，但是异步函数的返回值会被包裹到Promise.resolve中；
* 情况二：如果我们的异步函数的返回值是Promise，Promise.resolve的状态会由Promise决定；
* 情况三：如果我们的异步函数的返回值是一个对象并且实现了thenable，那么会由对象的then方法来决定。

如果我们在async中抛出了异常，那么程序它并不会像普通函数一样报错，而是会作为Promise的reject来传递。

**await关键字：**

async函数另外一个特殊之处就是可以在它内部使用await关键字，而普通函数中是不可以的。await关键字有什么特点呢？**通常使用await是后面会跟上一个表达式，这个表达式会返回一个Promise；那么await会等到Promise的状态变成fulfilled状态，之后继续执行异步函数。**

1. 如果await后面是一个普通的值，那么会直接返回这个值；
2. 如果await后面是一个thenable的对象，那么会根据对象的then方法调用来决定后续的值；
3. 如果await后面的表达式，返回的Promise是reject的状态，那么会将这个reject结果直接作为函数的Promise的reject值。

### 进程和线程

线程和进程是操作系统中的两个概念：

* 进程（process）：计算机已经运行的程序，是操作系统管理程序的一种方式；我们可以认为，启动一个应用程序，就会默认启动一个进程（也可能是多个进程）。
* 线程（thread）：操作系统能够运行运算调度的最小单位，通常情况下它被包含在进程中；每一个进程中，都会启动至少一个线程用来执行程序中的代码，这个线程被称之为主线程；**所以我们也可以说进程是线程的容器。**

![](image/learningNote/1647314134135.png)

我们经常会说JavaScript是**单线程**的，但是JavaScript的线程应该有自己的容器进程：**浏览器或者Node**。浏目前多数的浏览器其实都是多进程的，当我们**打开一个tab页面时就会开启一个新的进程**，这是为了防止一个页面卡死而造成所有页面无法响应，整个浏览器需要强制退出，每个进程中又有很多的线程，**其中包括执行JavaScript代码的线程**。

JavaScript的代码执行是在一个单独的线程中执行的：这就意味着JavaScript的代码，在同一个时刻只能做一件事；如果这件事是非常耗时的，就意味着当前的线程就会**被阻塞**。

### 浏览器的事件循环

事件循环中并非只维护着一个队列，事实上是有两个队列：

* 宏任务队列（macrotask queue）：**ajax**、**setTimeout**、**setInterval**、**DOM监听**、**UI Rendering**等。
* 微任务队列（microtask queue）：**Promise的then回调**、**Mutation Observer API**、**queueMicrotask()**等。

**执行顺序：**

1. main script中的代码优先执行（编写的顶层script代码）；
2. 在执行任何一个宏任务之前，都会先查看微任务队列中是否有任务需要执行，**也就是宏任务执行之前，必须保证微任务队列是空的**；如果不为空，那么就优先执行微任务队列中的任务（回调）。

### Node事件循环

浏览器中的EventLoop是根据**HTML5**定义的规范来实现的，不同的浏览器可能会有不同的实现，而Node中是由**libuv**实现的。

libuv中主要维护了一个EventLoop和worker threads（线程池）

* EventLoop负责调用系统的一些其他操作：文件的IO、Network、child-processes等；
* libuv是一个多平台的专注于异步IO的库，它最初是为Node开发的，但是现在也被使用到Luvit、Julia、pyuv等其他地方；

![](image/learningNote/1647314954908.png)

事件循环像是一个桥梁，是连接着应用程序的JavaScript和系统调用之间的通道：无论是我们的文件IO、数据库、网络IO、定时器、子进程，在完成对应的操作后，都会将对应的结果和回调函数放到事件循环（任务队列）中；事件循环会不断的从任务队列中取出对应的事件（回调函数）来执行。

一次完整的事件循环Tick分成很多个阶段：

1. **定时器（Timers**）：本阶段执行已经被 setTimeout() 和 setInterval() 的调度回调函数。
2. **待定回调（Pending Callback）**：对某些系统操作（如TCP错误类型）执行回调，比如TCP连接时接收到ECONNREFUSED。pidle, prepare：仅系统内部使用。
3. **轮询（Poll）**：检索新的 I/O 事件；执行与 I/O 相关的回调；
4. **检测（check）**：setImmediate() 回调函数在这里执行。
5. **关闭的回调函数**：一些关闭的回调函数，如：socket.on('close', ...)。

![](image/learningNote/1647315179009.png)

从一次事件循环的**Tick**来说，Node的事件循环更复杂，它也分为微任务和宏任务：

* 宏任务（macrotask）：setTimeout、setInterval、IO事件、setImmediate、close事件；
* 微任务（microtask）：Promise的then回调、process.nextTick、queueMicrotask。

所以，在每一次事件循环的tick中，会按照如下顺序来执行代码：

1. next tick microtask queue；
2. other microtask queue；
3. timer queue；
4. poll queue；
5. check queue；
6. close queue。

### JavaScript异常处理

很多时候我们可能验证到不是希望得到的参数时，就会直接**return**，但是return存在很大的弊端：调用者不知道是因为函数内部没有正常执行，还是执行结果就是一个undefined；事实上，正确的做法应该是如果没有通过某些验证，那么应该让外界知道函数内部报错了。

**throw语句：**
throw语句用于抛出一个用户自定义的异常；当遇到throw语句时，当前**的函数执行会被停止（throw后面的语句不会执行）。**

**Error类型：**

Error包含三个属性：

* **messsage**：创建Error对象时传入的message；
* **name**：Error的名称，通常和类的名称一致；
* **stack**：整个Error的错误信息，包括函数的调用栈，当我们直接打印Error对象时，打印的就是stack。

这个函数抛出了异常，但是我们并没有对这个异常进行处理，那么这个异常会继续传递到上一个函数调用中；而如果到了最顶层（全局）的代码中依然没有对这个异常的处理代码，这个时候就会报错并且终止程序的运行。但是很多情况下当出现异常时，我们并不希望程序直接推出，而是希望可以正确的处理异常：这个时候我们就可以使用**try catch**。在ES10（ES2019）中，catch后面绑定的error可以省略。当然，如果有一些必须要执行的代码，我们可以使用finally来执行：**finally表示最终一定会被执行的代码结构；如果try和finally中都有返回值，那么会使用finally当中的返回值。**

### 模块化的历史 

1. 在网页开发的早期，Brendan Eich开发JavaScript仅仅作为一种脚本语言，做一些简单的表单验证或动画实现等，那个时候代码还是很少的：这个时候我们只需要讲JavaScript代码写到标签中即可；并没有必要放到多个文件中来编写；甚至流行：通常来说 JavaScript 程序的长度只有一行。
2. 随着前端和JavaScript的快速发展，JavaScript代码变得越来越复杂了：ajax的出现，前后端开发分离，意味着后端返回数据后，我们需要通过JavaScript进行前端页面的渲染；SPA的出现，前端页面变得更加复杂：包括前端路由、状态管理等等一系列复杂的需求需要通过JavaScript来实现；包括Node的实现，JavaScript编写复杂的后端程序，没有模块化是致命的硬伤。
3. 直到ES6（2015）才推出了自己的模块化方案；在此之前，为了让JavaScript支持模块化，涌现出了很多不同的模块化规范：AMD、CMD、CommonJS等。

### CommonJS规范和Node关系

我们需要知道CommonJS是一个规范，最初提出来是在浏览器以外的地方使用，并且当时被命名为**ServerJS**，后来为了体现它的广泛性，修改为CommonJS，平时我们也会简称为**CJS**。

1. Node是CommonJS在服务器端一个具有代表性的实现；
2. Browserify是CommonJS在浏览器中的一种实现；
3. webpack打包工具具备对CommonJS的支持和转换。

Node中对CommonJS进行了支持和实现，让我们在开发node的过程中可以方便的进行模块化开发：

* 在Node中每一个js文件都是一个单独的模块；
* 这个模块中包括CommonJS规范的核心变量：**exports、module.exports、require**；
* 我们可以使用这些变量来方便的进行模块化开发；
* 前面我们提到过模块化的核心是导出和导入，Node中对其进行了实现：exports和module.exports可以负责对模块中的内容进行导出；require函数可以帮助我们导入其他模块（**自定义模块、系统模块、第三方库模块**）中的内容。

CommonJS加载模块是同步的，同步的意味着只有等到对应的模块加载完毕，当前模块中的内容才能被运行；这个在服务器不会有什么问题，因为服务器加载的js文件都是本地文件，加载速度非常快。浏览器加载js文件需要先从服务器将文件下载下来，之后再加载运行；**那么采用同步的就意味着后续的js代码都无法正常运行**，即使是一些简单的DOM操作。所以**在浏览器中**，我们**通常不使用CommonJS规范**：当然在webpack中使用CommonJS是另外一回事；因为它会将我们的代码转成浏览器可以直接执行的代码。在早期为了可以在浏览器中使用模块化，通常会采用AMD或CMD：但是目前一方面现代的浏览器已经支持ES Modules，另一方面借助于webpack等工具可以实现对CommonJS或者ESModule代码的转换；AMD和CMD已经使用非常少了。

**AMD规范：**

AMD主要是应用于浏览器的一种模块化规范：AMD是**Asynchronous Module Definition**（异步模块定义）的缩写；它采用的是异步加载模块；事实上AMD的规范还要早于CommonJS，但是CommonJS目前依然在被使用，而AMD使用的较少了。AMD实现的比较常用的库是**require.js**和**curl.js。**

**CMD规范：**

CMD规范也是应用于浏览器的一种模块化规范：CMD 是Common Module Definition（通用模块定义）的缩写；它也采用了异步加载模块，但是它将CommonJS的优点吸收了过来；但是目前CMD使用也非常少了。CMD也有自己比较优秀的实现方案：**SeaJS**。

**ES Module：**

ES Module和CommonJS的模块化有一些不同之处：一方面它使用了**import**和**export**关键字；另一方面它采用编译期的**静态分析**，并且也加入了**动态引用**的方式。采用ES Module将**自动采用严格模式**：use strict。

在导出export时指定了名字；在导入import时需要知道具体的名字；export和import可以结合使用。

![](image/learningNote/1647326602001.png)

**default**用法：

默认导出export时可以**不需要指定名字**；在导入时不需要使用 {}，并且可以自己来指定名字；它也方便我们和现有的CommonJS等规范相互操作。在一个模块中，**只能有一个默认导出（default export）**。

**import函数：**

通过import加载一个模块，**是不可以在其放到逻辑代码中的**，这是因为ES Module在被JS引擎解析时，就必须知道它的依赖关系；由于这个时候js代码没有任何的运行，所以无法在进行类似于if判断中根据代码的执行情况； 甚至下面的这种写法也是错误的：因为我们必须到运行时能确定path的值。

但是某些情况下，我们确确实实希望动态的来加载某一个模块：如果根据不懂的条件，动态来选择加载模块的路径；这个时候我们需要使用 **import() 函数**来动态加载。

![](image/learningNote/1647326926460.png)

**import.meta**是一个给JavaScript模块暴露特定上下文的元数据属性的对象。它包含了这个**模块的信息**，比如说这个模块的URL；在ES11（ES2020）中新增的特性。

**ES Module的解析流程：**

1. 阶段一：**构建（Construction）**，根据地址查找js文件，并且下载，将其解析成模块记录（Module Record）；
2. 阶段二：**实例化（Instantiation）**，对模块记录进行实例化，并且分配内存空间，解析模块的导入和导出语句，把模块指向对应的内存地址。
3. 阶段三：**运行（Evaluation）**，运行代码，计算值，并且将值填充到内存地址中。

![](image/learningNote/1647327181559.png)

![](image/learningNote/1647327253396.png)

### 包管理工具详解

**代码共享方案：**

方式一：上传到**GitHub**上、其他程序员通过GitHub下载我们的代码手动的引用；方式二：使用一个专业的工具来管理我们的代码我们通过工具将代码发布到特定的位置；其他程序员直接通过工具来安装、升级、删除我们的工具代码。

### **包管理工具npm**

**Node Package Manager**，也就是Node包管理器；但是目前已经不仅仅是Node包管理器了，在前端项目中我们也在使用它来管理依赖的包。npm管理的包可以在*[https://www.npmjs.org/]()*查看、搜索，npm管理的包存放在哪里呢？我们发布自己的包其实是发布到registry上面的；当我们安装一个包时其实是从registry上面下载的包。

npm的配置文件：**package.json**，方式一：手动从零创建项目，npm init –y方式二：通过脚手架创建项目，脚手架会帮助我们生成package.json，并且里面有相关的配置。

必须填写的属性：

* **name**是项目的名称，必填；
* **version**是当前项目的版本号，必填；
* **description**是描述信息，很多时候是作为项目的基本描述；
* **author**是作者相关信息（发布时用到）；
* **license**是开源协议（发布时用到）；
* **private**属性：private属性记录当前的项目是否是私有的；当值为true时，npm是不能发布它的，这是防止私有项目或模块发布出去的方式；
* **main**属性：设置程序的入口。这个入口和webpack打包的入口并不冲突；它是在你发布一个模块的时候会用到的；比如我们使用axios模块 const axios = require('axios');实际上是找到对应的main属性查找文件的；
* **scripts**属性：scripts属性用于配置一些脚本命令，以键值对的形式存在；配置后我们可以通过 npm run 命令的key来执行这个命令；**npm start和npm run start是等价的**；对于常用的**start、 test、stop、restart**可以省略掉run直接通过 npm start等方式运行；
* **dependencies**属性：dependencies属性是指定无论开发环境还是生成环境都需要依赖的包；
* **devDependencies**属性：一些包在生成环境是不需要的，比如webpack、babel等；这个时候我们会通过`npm install webpack --save-dev`，将它安装到devDependencies属性中；
* peerDependencies属性：还有一种项目依赖关系是**对等依赖**，也就是你依赖的一个包，它必须是以另外一个宿主包为前提的；比如element-plus是依赖于vue3的，ant design是依赖于react、react-dom；
* **engines**属性：pengines属性用于指定Node和NPM的版本号；
* **browserslist**属性：p用于配置打包后的JavaScript浏览器的兼容情况，参考；否则我们需要手动的添加polyfills来让支持某些语法；

**依赖的版本管理：**

npm的包通常需要遵从**semver**版本规范，semver版本规范是X.Y.Z：

* X主版本号（major）：当你做了不兼容的 API 修改（可能不兼容之前的版本）；
* Y次版本号（minor）：当你做了向下兼容的功能性新增（新功能增加，但是兼容之前的版本）；
* Z修订号（patch）：当你做了向下兼容的问题修正（没有新功能，修复了之前版本的bug）。
* `^`和`~`的区别：`^`x.y.z：表示x是保持不变的，y和z永远安装最新的版本；`~`x.y.z：表示x和y保持不变的，z永远安装最新的版本。

**npm install 命令：**

安装npm包分两种情况：

1. 全局安装（global install）： npm install webpack -g；
2. 项目（局部）安装（local install）： npm install webpack。

![](image/learningNote/1647329605118.png)

卸载某个依赖包：

npm uninstall package
npm uninstall package --save-dev
npm uninstall package -D

强制重新build：

npm rebuild

清除缓存：

npm cache clean

**yarn**

另一个node包管理工具yarn：yarn是由Facebook、Google、Exponent 和 Tilde 联合推出了一个新的 JS 包管理工具；y**arn 是为了弥补 npm 的一些缺陷而出现的**；早期的npm存在很多的缺陷，比如安装依赖速度很慢、版本依赖混乱等等一系列的问题。

**cnpm工具**

查看npm镜像：npm config get registry # npm config get registry。

我们可以直接设置npm的镜像：npm config set registry https://registry.npm.taobao.org。

我们可以使用**cnpm**，并且将cnpm设置为淘宝的镜像：

npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm config get registry # https://r.npm.taobao.org/

**npx工具**

npx是npm5.2之后自带的一个命令。npx的作用非常多，但是比较常见的是**使用它来调用项目中的某个模块的指令**。

**npm发布包**

1. 注册npm账号：https://www.npmjs.com/，选择sign up；
2. 在命令行登录；
3. 修改package.json；
4. 发布到npm registry上；
5. 更新仓库：1.修改版本号(最好符合semver规范)，2.重新发布；
6. 删除发布的包：npm unpublish；
7. 让发布的包过期：npm deprecate。

### JSON

**JSON**是一种非常重要的数据格式，它并不是编程语言，而是**一种可以在服务器和客户端之间传输的数据格式**。JSON的全称是**JavaScript Object Notation**（JavaScript对象符号）：JSON是由**Douglas Crockford构想和设计**的一种轻**量级资料交换格式**，算是**JavaScript的一个子集**；但是虽然JSON被提出来的时候是主要应用JavaScript中，但是目前已经独立于编程语言，可以在各个编程语言中使用；很多编程语言都实现了将JSON转成对应模型的方式。目前JSON被使用的场景也越来越多：

* 网络数据的传输JSON数据；
* 项目的某些配置文件；
* 非关系型数据库（NoSQL）将json作为存储格式。

JSON的顶层支持三种类型的值：

* **简单值**：数字（Number）、字符串（String，不支持单引号）、布尔类型（Boolean）、null类型；
* **对象值**：由key、value组成，key是字符串类型，并且必须添加双引号，值可以是简单值、对象值、数组值；
* **数组值**：数组的值可以是简单值、对象值、数组值。

**JSON序列化：**

某些情况下我们希望将JavaScript中的复杂类型转化成JSON格式的字符串，这样方便对其进行处理。在ES5中引用了JSON全局对象，该对象有两个常用的方法

* **stringify**方法：将JavaScript类型转成对应的JSON字符串；
* **parse**方法：解析JSON字符串，转回对应的JavaScript类型。

**JSON.stringify()** 方法将一个 JavaScript 对象或值转换为 JSON 字符串：如果指定了一个 **replacer** 函数，则可以选择性地替换值；如果指定的 replacer 是数组，则可选择性地仅包含数组指定的属性。Stringify的第三个参数space，

```javascript
const obj = {
  name: "why",
  age: 18,
  friends: {
    name: "kobe"
  },
  hobbies: ["篮球", "足球"],
  toJSON: function() {
     return "123456"
   }
}

// 需求: 将上面的对象转成JSON字符串
// 1.直接转化
const jsonString1 = JSON.stringify(obj)
console.log(jsonString1)

// 2.stringify第二个参数replacer
// 2.1. 传入数组: 设定哪些是需要转换
const jsonString2 = JSON.stringify(obj, ["name", "friends"])
console.log(jsonString2)

// 2.2. 传入回调函数:
const jsonString3 = JSON.stringify(obj, (key, value) => {
  if (key === "age") {
    return value + 1
  }
  return value
})
console.log(jsonString3)

// 3.stringify第三参数 space
const jsonString4 = JSON.stringify(obj, null, "---")
console.log(jsonString4)
```

**JSON.parse()** 方法用来解析JSON字符串，构造由字符串描述的JavaScript值或对象。提供可选的 reviver 函数用以在返回之前对所得到的对象执行变换(操作)。

```JavaScript
const JSONString = '{"name":"why","age":19,"friends":{"name":"kobe"},"hobbies":["篮球","足球"]}'

const info = JSON.parse(JSONString, (key, value) => {
  if (key === "age") {
    return value - 1
  }
  return value
})
console.log(info)
```

**使用JSON序列化深拷贝：**

```javascript
const obj = {
  name: "why",
  age: 18,
  friends: {
    name: "kobe"
  },
  hobbies: ["篮球", "足球"],
  foo: function() {
    console.log("foo function")
  }
}

// 将obj对象的内容放到info变量中
// 1.引用赋值
const info = obj
obj.age = 100
console.log(info.age)

// 2.浅拷贝
const info2 = { ...obj }
obj.age = 1000
console.log(info2.age)

obj.friends.name = "james"
console.log(info2.friends.name)

// 3.stringify和parse来实现
const jsonString = JSON.stringify(obj)
console.log(jsonString)
const info3 = JSON.parse(jsonString)
obj.friends.name = "curry"
console.log(info3.friends.name)
console.log(info3)
```

### WebStorage

WebStorage主要提供了一种机制，可以让浏览器提供一种比cookie更直观的key、value存储方式：

* **localStorage：本地存储**，提供的是一种**永久性**的存储方法，在关闭掉网页重新打开时，存储的内容依然保留；
* **sessionStorage：会话存储**，提供的是**本次会话**的存储，在关闭掉会话时，存储的内容会被清除。

Storage的属性：

**Storage.length**：只读属性，返回一个整数，表示存储在Storage对象中的数据项数量；

Storage的方法：

* **Storage.key()**：该方法接受一个数值n作为参数，返回存储中的第n个key名称；
* **Storage.getItem()**：该方法接受一个key作为参数，并且返回key对应的value；
* **Storage.setItem()**：该方法接受一个key和value，并且将会把key和value添加到存储中。如果key存储，则更新其对应的值；
* **Storage.removeItem()**：该方法接受一个key作为参数，并把该key从存储中删除；
* **Storage.clear()**：该方法的作用是清空存储中的所有key；

### IndexedDB

IndexedDB是一种**底层的API**，**用于在客户端存储大量的结构化数据**。它是一种**事务型数据库系统**，是一种基于JavaScript面向对象数据库，有点类似于NoSQL（非关系型数据库）；IndexDB本身就是**基于事务**的，我们只需要指定数据库模式，打开与数据库的连接，然后检索和更新一系列事务即可。

**IndexDB的连接数据库**：

1. 第一步：打开indexDB的某一个数据库；
   通过indexDB.open(数据库名称, 数据库版本)方法， 如果数据库不存在，那么会创建这个数据，如果数据库已经存在，那么会打开这个数据库；
2. 第二步：通过监听回调得到数据库连接结果，数据库的open方法会得到一个IDBOpenDBRequest类型，我们可以通过下面的三个回调来确定结果：**onerror**：当数据库连接失败时；**onsuccess**：当数据库连接成功时回调；**onupgradeneeded**：当数据库的version发生变化并且高于之前版本时回调；通常我们在这里会创建具体的存储对象：**db.createObjectStore**(存储对象名称, { keypath: 存储的主键 })我们可以通过onsuccess回调的event获取到db对象：event.target.result。

**对数据库的操作要通过事务对象来完成**：

1. 第一步：通过db获取对应存储的事务 db.transaction(存储名称, 可写操作)；
2. 第二步：通过事务获取对应的存储对象 transaction.objectStore(存储名称)；

以进行**增删改查**操作：

* 新增数据**store.add**；
* 查询数据：方式一：**store.get(key)**，方式二：通过**store.openCursor** 拿到游标对象，在request.onsuccess中获取cursor：event.target.result，获取对应的key：cursor.key；获取对应的value：cursor.value；可以通过cursor.continue来继续执行；
* 修改数据**cursor.update(value)**；
* 删除数据**cursor.delete()**；

![](image/learningNote/1647331848801.png)

### Cookie

Cookie（复数形态Cookies），又称为“小甜饼”。类型为**小型文本文件**，某些网站**为了辨别用户身份而存储在用户本地终端（Client Side）**上的数据。**浏览器会在特定的情况下携带上cookie来发送请求，我们可以通过cookie来获取一些信息**。Cookie总是保存在客户端中，按在客户端中的存储位置，Cookie可以分为内存Cookie和硬盘Cookie。

* **内存Cookie由浏览器维护**，保存在内存中，**浏览器关闭**时Cookie就会消失，其存在时间是短暂的；
* **硬盘Cookie保存在硬盘**中，有一个**过期时间**，**用户手动清理或者过期时间到时，才会被清理**。

如果判断一个cookie是内存cookie还是硬盘cookie呢？**没有设置过期时间**，默认情况下cookie是内存cookie，在关闭浏览器时会自动删除；**有设置过期时间****，并且过期时间不为0或者负数的cookie**，是硬盘cookie，需要手动或者到期时，才会删除。

**cookie的生命周期**：默认情况下的cookie是内存cookie，也称之为会话cookie，也就是在浏览器关闭时会自动被删除；我**们可以通过设置expires或者max-age来设置过期的时间**；

* expires：设置的是Date.toUTCString()，设置格式是，expires=date-in-GMTString-format；
* max-age：设置过期的秒钟，max-age=max-age-in-seconds。

**cookie的作用域**：（允许cookie发送给哪些URL）。**Domain：指定哪些主机可以接受cookie如果不指定，那么默认是 origin，不包括子域名**。**如果指定Domain，则包含子域名**。例如，如果设置 Domain=mozilla.org，则 Cookie 也包含在子域名中（如developer.mozilla.org）。

**Path**：指定主机下哪些路径可以接受cookie例如，设置 Path=/docs，则以下地址都会匹配。

![](image/learningNote/1647332391465.png)

### BOM

JavaScript有一个非常重要的运行环境就是浏览器，而且浏览器本身又作为一个应用程序需要对其本身进行操作，所以通常**浏览器会有对应的对象模型（BOM，Browser Object Model）**。我们可以将BOM看成是连接JavaScript脚本与浏览器窗口的桥梁。BOM主要包括一下的对象模型：

* **window**：包括全局属性、方法，控制浏览器窗口相关的属性、方法；
* **location**：浏览器连接到的对象的位置（URL）；
* **history**：操作浏览器的历史；
* **document**：当前窗口操作文档的对象；

**window对象**在浏览器中有两个身份：

* **身份一：全局对象**。我们知道ECMAScript其实是有一个全局对象的，这个全局对象在Node中是global；在浏览器中就是window对象；比如在全**局通过var声明的变量，会被添加到GO中，也就是会被添加到window上**，window**默认给我们提供了全局的函数和类**：**setTimeout、Math、Date、Object**等；
* **身份二：浏览器窗口对象**。作为浏览器窗口时，提供了对浏览器操作的相关的API。第一：包含大量的**属性，localStorage、console、location、history、screenX、scrollX**等等（大概60+个属性）；第二：包含大量的**方法，alert、close、scrollTo、open**等等（大概40+个方法）；第三：包含大量的**事件，focus、blur、load、hashchange**等等（大概30+个事件）；第四：包含**从EventTarget继承过来的方法，addEventListener、removeEventListener、dispatchEvent方法**。

**Window继承自EventTarget**，所以会继承其中的属性和方法：

* addEventListener：注册某个事件类型以及事件处理函数；
* removeEventListener：移除某个事件类型以及事件处理函数。
* dispatchEvent：派发某个事件类型到EventTarget上。

**Location对象****用于表示window上当前链接到的URL信息。**

* href: 当前window对应的超链接URL, 整个URL；
* protocol: 当前的协议；
* host: 主机地址；
* hostname: 主机地址(不带端口)；
* port: 端口；
* pathname: 路径；
* search: 查询字符串；
* hash: 哈希值；
* username：URL中的username（很多浏览器已经禁用）；
* password：URL中的password（很多浏览器已经禁用）；

location有如下常用的方法：

* assign：赋值一个新的URL，并且跳转到该URL中；
* replace：打开一个新的URL，并且跳转到该URL中（不同的是不会在浏览记录中留下之前的记录）；
* reload：重新加载页面，可以传入一个Boolean类型。

**history对象允许我们访问浏览器曾经的会话历史记录。**

有两个属性：**length：会话中的记录条数**；**state：当前保留的状态值**；

有五个方法：

* back()：返回上一页，等价于history.go(-1)；
* forward()：前进下一页，等价于history.go(1)；
* go()：加载历史中的某一页；
* pushState()：打开一个指定的地址；
* replaceState()：打开一个新的地址，并且使用replace。

### DOM

浏览器是用来展示网页的，而网页中最重要的就是里面各种的标签元素，JavaScript很多时候是需要操作这些元素的。JavaScript通过**Document Object Model（DOM，文档对象模型）**。DOM给我们提供了一系列的模型和对象，让我们可以方便的来操作Web页面。

![](image/learningNote/1647333502437.png)

* 继承自**EventTarget**，所以也可以使用EventTarget的方法；
* 所有的DOM节点类型都继承自**Node接口**，Node有几个非常重要的属性：nodeName：node节点的名称。nodeType：可以区分节点的类型。nodeValue：node节点的值；childNodes：所有的子节点；

**Document**节点表示的整个载入的网页，我们来看一下常见的属性和方法。我们平时创建的div、p、span等元素在DOM中表示为**Element元素**。

### **认识事件监听**

前面我们讲到了JavaScript脚本和浏览器之间交互时，浏览器给我们提供的BOM、DOM等一些对象模型。事实上还有一种需要和浏览器经常交互的事情就是事件监听：浏览器在某个时刻可能会发生一些事件，比如**鼠标点击、移动、滚动、获取、失去焦点、输入内容**等等一系列的事件；如何进行事件监听呢？事件监听方式一：**在script中直接监听**；事件监听方式二：**通过元素的on来监听事件**；事件监听方式三：**通过EventTarget中的addEventListener来监听。**

事实上对于事件有一个概念叫做**事件流**，为什么会产生事件流呢？当我们在浏览器上对着一个元素点击时，你点击的不仅仅是这个元素本身；这是因为我们的HTML元素是存在父子元素叠加层级的；比如一个span元素是放在div元素上的，div元素是放在body元素上的，body元素是放在html元素上的。我们会发现默认情况下事件是**从最内层的span向外依次传递**的顺序，这个顺序我们称之为**事件冒泡（Event Bubble）**。事实上，还有另外一种监听事件流的方式就是**从外层到内层**（body -> span），这种称之为**事件捕获（EventCapture）**；因为早期浏览器开发时，不管是IE还是Netscape公司都发现了这个问题，但是他们采用了完全相反的事
件流来对事件进行了传递；**IE采用了事件冒泡的方式，Netscape采用了事件捕获的方式。**如果我们同时有事件冒泡和时间捕获的监听，那么会**优先监听到事件捕获**的。

**事件对象event：**

当一个事件发生时，就会有和这个事件相关的很多信息：比如**事件的类型**是什么，你点击的是**哪一个元素**，**点击的位置**是哪里等等相关的信息；那么这些信息会被封装到一个Event对象中；该对象给我们提供了想要的一些属性，以及可以通过该对象进行某些操作。常见的属性：**type：事件的类型**；**target：当前事件发生的元素**；**currentTarget：当前处理事件的元素**；**offsetX、offsetY：点击元素的位置。**

### 防抖函数

当事件触发时，**相应的函数并不会立即触发，而是会等待一定的时间**；当事件密集触发时，函数的触发会被频繁的推迟；只有等待了一段时间也没有事件触发，才会真正的执行响应函数；防抖的应用场景很多：输入框中频繁的输入内容，搜索或者提交信息；频繁的点击按钮，触发某个事件监听浏览器滚动事件，完成某些特定操作；用户缩放浏览器的resize事件。

![](image/learningNote/1647334244139.png)

```javascript
function debounce(fn, delay, immediate = false, resultCallback) {
  // 1.定义一个定时器, 保存上一次的定时器
  let timer = null
  let isInvoke = false

  // 2.真正执行的函数
  const _debounce = function(...args) {
    return new Promise((resolve, reject) => {
      // 取消上一次的定时器
      if (timer) clearTimeout(timer)

      // 判断是否需要立即执行
      if (immediate && !isInvoke) {
        const result = fn.apply(this, args)
        if (resultCallback) resultCallback(result)
        resolve(result)
        isInvoke = true
      } else {
        // 延迟执行
        timer = setTimeout(() => {
          // 外部传入的真正要执行的函数
          const result = fn.apply(this, args)
          if (resultCallback) resultCallback(result)
          resolve(result)
          isInvoke = false
          timer = null
        }, delay)
      }
    })
  }

  // 封装取消功能
  _debounce.cancel = function() {
    if (timer) clearTimeout(timer)
    timer = null
    isInvoke = false
  }

  return _debounce
}


```

### 节流函数

当事件触发时，会执行这个事件的响应函数；如果这个事件会被频繁触发，那么节流函数会按照一定的频率来执行函数；不管在这个中间有多少次触发这个事件，**执行函数的频繁总是固定的**；节流的应用场景：监听页面的滚动事件； 鼠标移动事件；用户频繁点击按钮操作；游戏中的一些设计。

![](image/learningNote/1647334461041.png)

```javascript
function throttle(fn, interval, options = { leading: true, trailing: false }) {
  // 1.记录上一次的开始时间
  const { leading, trailing, resultCallback } = options
  let lastTime = 0
  let timer = null

  // 2.事件触发时, 真正执行的函数
  const _throttle = function(...args) {
    return new Promise((resolve, reject) => {
      // 2.1.获取当前事件触发时的时间
      const nowTime = new Date().getTime()
      if (!lastTime && !leading) lastTime = nowTime

      // 2.2.使用当前触发的时间和之前的时间间隔以及上一次开始的时间, 计算出还剩余多长事件需要去触发函数
      const remainTime = interval - (nowTime - lastTime)
      if (remainTime <= 0) {
        if (timer) {
          clearTimeout(timer)
          timer = null
        }

        // 2.3.真正触发函数
        const result = fn.apply(this, args)
        if (resultCallback) resultCallback(result)
        resolve(result)
        // 2.4.保留上次触发的时间
        lastTime = nowTime
        return
      }

      if (trailing && !timer) {
        timer = setTimeout(() => {
          timer = null
          lastTime = !leading ? 0: new Date().getTime()
          const result = fn.apply(this, args)
          if (resultCallback) resultCallback(result)
          resolve(result)
        }, remainTime)
      }
    })
  }

  _throttle.cancel = function() {
    if(timer) clearTimeout(timer)
    timer = null
    lastTime = 0
  }

  return _throttle
}

```

### 深拷贝函数

对象的**浅拷贝**：只是浅层的拷贝，**内部引入对象时，依然会相互影响**；对象的**深拷贝：两个对象不再有任何关系，不会相互影响。**

```javascript
function isObject(value) {
  const valueType = typeof value
  return (value !== null) && (valueType === "object" || valueType === "function")
}

function deepClone(originValue, map = new WeakMap()) {
  // 判断是否是一个Set类型
  if (originValue instanceof Set) {
    return new Set([...originValue])
  }

  // 判断是否是一个Map类型
  if (originValue instanceof Map) {
    return new Map([...originValue])
  }

  // 判断如果是Symbol的value, 那么创建一个新的Symbol
  if (typeof originValue === "symbol") {
    return Symbol(originValue.description)
  }

  // 判断如果是函数类型, 那么直接使用同一个函数
  if (typeof originValue === "function") {
    return originValue
  }

  // 判断传入的originValue是否是一个对象类型
  if (!isObject(originValue)) {
    return originValue
  }
  if (map.has(originValue)) {
    return map.get(originValue)
  }

  // 判断传入的对象是数组, 还是对象
  const newObject = Array.isArray(originValue) ? []: {}
  map.set(originValue, newObject)
  for (const key in originValue) {
    newObject[key] = deepClone(originValue[key], map)
  }

  // 对Symbol的key进行特殊的处理
  const symbolKeys = Object.getOwnPropertySymbols(originValue)
  for (const sKey of symbolKeys) {
    // const newSKey = Symbol(sKey.description)
    newObject[sKey] = deepClone(originValue[sKey], map)
  }
  
  return newObject
}


// deepClone({name: "why"})


// 测试代码
let s1 = Symbol("aaa")
let s2 = Symbol("bbb")

const obj = {
  name: "why",
  age: 18,
  friend: {
    name: "james",
    address: {
      city: "广州"
    }
  },
  // 数组类型
  hobbies: ["abc", "cba", "nba"],
  // 函数类型
  foo: function(m, n) {
    console.log("foo function")
    console.log("100代码逻辑")
    return 123
  },
  // Symbol作为key和value
  [s1]: "abc",
  s2: s2,
  // Set/Map
  set: new Set(["aaa", "bbb", "ccc"]),
  map: new Map([["aaa", "abc"], ["bbb", "cba"]])
}

obj.info = obj

const newObj = deepClone(obj)
console.log(newObj === obj)

obj.friend.name = "kobe"
obj.friend.address.city = "成都"
console.log(newObj)
console.log(newObj.s2 === obj.s2)

console.log(newObj.info.info.info)
```

### 事件总线

自定义事件总线属于一种观察者模式，其中包括三个角色：

* **发布者（Publisher）**：发出事件（Event）；
* **订阅者（Subscriber）**：订阅事件（Event），并且会进行响应（Handler）；
* **事件总线（EventBus）**：无论是发布者还是订阅者都是通过事件总线作为中台的；

```javascript
class HYEventBus {
  constructor() {
    this.eventBus = {}
  }

  on(eventName, eventCallback, thisArg) {
    let handlers = this.eventBus[eventName]
    if (!handlers) {
      handlers = []
      this.eventBus[eventName] = handlers
    }
    handlers.push({
      eventCallback,
      thisArg
    })
  }

  off(eventName, eventCallback) {
    const handlers = this.eventBus[eventName]
    if (!handlers) return
    const newHandlers = [...handlers]
    for (let i = 0; i < newHandlers.length; i++) {
      const handler = newHandlers[i]
      if (handler.eventCallback === eventCallback) {
        const index = handlers.indexOf(handler)
        handlers.splice(index, 1)
      }
    }
  }

  emit(eventName, ...payload) {
    const handlers = this.eventBus[eventName]
    if (!handlers) return
    handlers.forEach(handler => {
      handler.eventCallback.apply(handler.thisArg, payload)
    })
  }
}

const eventBus = new HYEventBus()

// main.js
eventBus.on("abc", function() {
  console.log("监听abc1", this)
}, {name: "why"})

const handleCallback = function() {
  console.log("监听abc2", this)
}
eventBus.on("abc", handleCallback, {name: "why"})

// utils.js
eventBus.emit("abc", 123)

// 移除监听
eventBus.off("abc", handleCallback)
eventBus.emit("abc", 123)
```
