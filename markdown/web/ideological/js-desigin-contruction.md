# 设计模式 - 结构型模式

我们在代码中创建了很多的类的实例，那么如何将他们组合起来，这就是 结构型模式 所负责的事情。

## 适配器模式

概念：适配器模式是得一个结构与其它接口兼容，从而给多个不同接口的同一抽象。

### 举例

我们大家都用过数据线，现在出来了那种可以通过添加头部的适配器，来实现给安卓口手机充电，typeC口 还有 苹果口的手机充电。

我们尝试代码实现以下。

```javascript
class IosPhone {
  constructor(){
        this.interface = 'ios'
    }

    charge(chargeLine){
        if(chargeLine.type === this.interface ){
            return true
        }

        return false
    }
}

class AndroidPhone {
    constructor(){
        this.interface = 'android'
    }

    charge(chargeLine){
       if(chargeLine.type === this.interface ){
            return true
        }

        return false 
    }
}

class ChargeLine{
    constructor(){
        this.type = 'android'
    }
}

function connect(phone,chargeLine){
    return phone.charge(chargeLine)
}
let iphone = new IosPhone()

let mi1 = new AndroidPhone()

let chargeLine = new ChargeLine()

connect(iphone,chargeLine)  // false

connect(mi1,chargeLine) // true

```
现在，我们无法给iPhone充电。我们使用适配器模式来去解决这个问题。
```javascript
class Adapter{
    constructor(){
        this.line= new ChargeLine()
    }

    use(){
        console.log(this.line.type + '改变为' + 'ios')
        return 'ios'
    }
}

let adapter= new Adapter(chargeLine)

connect(iphone, adapter.use()) // true
```
哇哦，我们通过适配器，获得了一根新的充电线。哈哈哈 。
### 适用性
* 想要使用一个已经存在的类，但是接口不符合使用的需求。
* 创建一个可以复用的类，该类可以与其他保护相关的类或不可预见的类协同工作。
  


## 桥接模式

桥接模式的意图是将抽象部分和他的视线部分分离，使他们可以独立的变化。【起初我是非常不理解这个模式，但是看了一个例子后，我就彻底明白这个例子了】。

我就直接举例子了：

我们大家都吃过披萨吧，披萨的底盘和上面的馅料组合的。
```javascript 
// 首先定义好一个pizza的结构
class Pizza {
    constructor(filling){
        this.filling = filling
        this.flavors = ''
    }

    finish(){
        console.log(`${this.filling.getContent()} is on the ${this.flavors}`)
    }
}

class CheesePizza extends Pizza{
    constructor(filling){
        super(filling)
        this.flavors = 'cheese'
    }
}

class SausagePizza extends Pizza {
    constructor(filling) {
        super(filling)
        this.flavors = 'sausage'
    }
}

class Filling{
    constructor(){
        
    }
    getContent(){
        return 'base filling'
    }
}

class FruitsFilling extends Filling{
    getContent(){
        return 'fruits'
    }
}

class TomatoFilling extends Filling {
    getContent(){
        return 'tomato'
    }
}

let tomato = new TomatoFilling()

let tomatoSausagePizza = new SausagePizza(tomato);
tomatoSausagePizza.finish(); //tomato is on the sausage pizza
let tomatoCheesePizza = new CheesePizza(tomato);
tomatoCheesePizza.finish(); //tomato is on the cheese pizza
```
构建了一个Pizza的基类，然后创建两个继承这个基类的 CheesePizza 和 SausagePizza 。然后我们构建一个口味的基类，然后创建两个集成口味基类的。这样，我们将口味传入不同的基类就可以达到独立变化的效果。【很多时候我们都使用这个方法，但是并没有系统的认知到它是什么】

### 适用性
  * 不希望在抽象和它的实现之间有一个固定的绑定关系。
    * 比如我们在构建一些需要在运行时进行替换或者切换的部分。
  * 类的抽象以及他的实现都应该可以通过生成子类的方式加以扩充。
    * Bridge模式使你可以对不同的抽象接口和实现部分进行组合，并分别对他们进行扩充。
  
### 优点

Bridge 模式有以下优点：
* 分离接口以及实现部分
  * 接口与实现分离有助于分层，从而产生更好的结构化系统，系统的高层部分仅须知道 抽象 和 实现。
* 提高可扩展性。
  * 可以分别对 抽象层 和 实现层进行拓展。



## 组合模式

将对象组合成树形结构来表示 部分 - 整体 的层次结构。组合模式使得用户对单个对象和组合对象的使用具有一致性。

### 例子
举一个最简单的例子就是 - 文件夹结构，我们都知道 文件夹内可以放文件，可以放可以放文件夹。这样产生了一个组合的结构。

![compose](../../../oss/compose.png)

接下来进入编码。首先分析我们需要什么,实现一个文件夹类，实现一个文件类。文件夹类型内可以包含文件类或者文件夹类型。

```typescript
class FileClass {
    content: string;
    constructor(content: string) {
        this.content = content;
    }
    showContent() {
        return this.content;
    }
}

class FloderClass {
    content: Array<FloderClass | FileClass>;
    constructor() {
        this.content = [];
    }
    add(content: FileClass | FloderClass) {
        this.content.push(content);
    }
    showContent(): string {
        return `[${this.content.map(item => {
            return item.showContent();
        }).join(',')}]`;
    }
}


const floder = new FloderClass();
const file1 = new FileClass('file 1');
const file2 = new FileClass('file 2');

const floder2 = new FloderClass();

const file3 = new FileClass('file 3');
floder2.add(file3);
floder.add(file1);
floder.add(file2);
floder.add(floder2);
console.log(floder.showContent());// [file 1,file 2,[file 3]]
```

### 适用性
通过上面的例子,应该对于组合模式有所了解。组合模式适用于 想要表示对象的部分 - 整体的层次结构，或者 希望用户葫芦哦组合对象与单个对象的不同，用户将统一的使用组合结构中的所有对象。

## 装饰模式

动态的给一个对象添加一些额外的职责。就增加功能来说装饰器模式相对于生成子类更为灵活。

有时候我们希望给某个对象添加一些功能，但是又不想更改整个对象。这个时候就需要泳道装饰器模式了。

### 适用性
我们可以在一下情况使用装饰器模式： 
* 在不影响其他对象的情况下，用动态，透明的放肆给单个对象添加功能。
* 处理一些可以撤销的功能。
* 作为替换生成子类的方法进行拓展。不能生成子类的情况是 可能有大量独立的拓展，需要为每一种组合将产生大量的子类。

### 例子

不知道大家有没有看过高达么？它是一个很好的例子，核心的永远是人型的机器人，而各种火炮，战刀等，都是配件，也可以理解成装饰器。

```javascript
class Gundam {
    attack() {
        console.log('attack enemy 10 hp by fist');
    }
}

function cannonEquipment(target) {
    target.attack = function () {
        console.log('attack enemy 50 hp by cannon');
    };
    return target;
}

function swordsEquipment(target) {
    target.attack = function () {
        console.log('attack enemy 30 hp by swords');
    };
    return target;
};

let swordsGundam = new swordsEquipment(Gundam);
swordsGundam.attack();

let cannonGundam = new cannonEquipment(Gundam);
cannonGundam.attack(); 
```

通过装饰器模式，我们给高达分别装备了 剑 和 火炮 。这样也避免不断的生成子类来。

### 特点

* 装饰器模式比静态继承更灵活。
* 避免在层级结构高层的类有太多的特征，使得高层类更具有通用性。

装饰器有优点也会有缺点，缺点就是会有诸多的小对象，虽然不是用类，但依旧是使用方法来去进行拓展。另一个就是 被装饰的组件和这个组件是有差异的，因此使用装饰的时候不应该依赖对象标识。


## 外观模式

在开发中，我们需要将大的一个系统拆分成很多子系统，这样有利于降低整个系统的复杂度。外观模式就是应对这样的场景。

外观模式可以有效的降低子系统间的通信和相互依赖关系降低到最低。

外观模式（Facede）模式定义了一个高层接口，这个接口使的子系统更容易使用。


![facede](../../../oss/facede.png)

通过整合子系统内部，提供一个统一的外观接口。

### 适用性
* 需要为一个复杂子系统提供一个简单接口时。子系统往往因为不断演变变化，会逐步复杂。外观模式可以提供一个简单的缺省视图，提供最简单的使用方法，用来满足绝大多数的业务需求，对于特定需求可以绕过facede这一层。
* 用来解耦客户程序和子系统。这也是外观模式的意义。
* 需要构建一个层次结构的子系统是，使用外观模式定义每一层的入口点。
* 各个子系统存在依赖关系，可以使用外观模式来架构，为每个子系统添加外观接口，可以简化他们的依赖关系。

### 例子

很简单的一个例子，比如 我们去警察局啊，派出所，各种机关部门办材料。他们提供的就是一种外观模式。都是通过一个统一的接口：柜台 来处理请求。这样 ，我们不需要了解这些材料要怎么流转，但是可以完成任务。

```javascript
class PoliceStation {
    Handle(){
        this.takePhotos()
        this.uploadData()
    }

    takePhotos(){
        console.log('拍照');
    }

    uploadData(){
        console.log('上传信息');
    }
}


class Bank {
    handle(){
        this.withdraw()
    }

    withdraw(){
        console.log('取款');
    }
}
```
我们可以到 各种地方的柜台 去办理想办理的业务。

## 享元模式

我们都知道 一个复杂对象是存储在堆中，而且我们也知道 在使用这个对象时是这个对象的引用地址。这样我们就可以达成一个共享技术。

共享一些内容，可以大大简化一些实现逻辑以及代价。

html 的 class 就是享元模式的一种体现。页面上的一些元素共享一个样式。这样我们可以大大减少样式内容的编写。

### 适用性
* 一个应用程序中使用了大量的对象，
* 完全由于使用大量的对象而造成了很大的存储开销
* 对象的大多数状态都可以变成外部状态
* 如果删除对象的外部状态，那么可以用相对较少的共享对象取代很多对象中的内容。
* 应用程序不依赖于对象标识。

### 效果
在使用享元模式的时候，需要注意 
1. 删除外部状态。享元模式很重要的一点就是提取出外部状态，提取外部状态到共享对象。
2. 管理共享对象，因为对象是共享的，所以如何管理共享对象就是 享元模式的一个注意点。

使用享元模式能有效的节省空间，当共享对象被越多的对象引用，那么就节省越多的空间。但是这个世界是平衡的，享元模式在节省空间的同时，也会增加一些运行时的开销。


## 代理模式

代理模式啊，这就是大名鼎鼎的代理模式啊。

如果你了解vue3的话，就应该知道vue3的响应式相关内容是由proxy来实现的，这个proxy就是代理模式的体现，

为其他对象提供一种代理以控制对这个对象的访问。

### 分类
描述简单的一些模式都会有更加细节的一些分类。
从如何使用 代理模式 来分为以下几种常见分类：
1. 远程代理： 为一个对象在不同的地址空间提供局部代理。
2. 虚代理： 根据需要创建开销很大的对象。
3. 保护代理，控制对原始对象的访问，可以提供对象的访问权限管理。
4. 智能指引： 取代了简单的指针。他在访问对象时，执行一些附加操作。

【这一部分完全抄书，啥也不懂】

