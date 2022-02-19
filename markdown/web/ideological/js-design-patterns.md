## 什么是设计模式？
设计模式这个词原本是建筑领域的一个概念，指对于关于城镇，私宅等设计的基本模式。随着计算机发展，设计模式这个词被应用软件设计当中。

那究竟什么是设计模式？

设计模式是一套反复被使用，被多数人所知晓，经过分类编目，代码设计经验的总结，用于解决特定问题的一系列**套路**。
## 为什么要使用设计模式？
自古真情留不住，唯有套路得人心。在大项目的开发或者框架设计当中，使用合理的设计模式能够更好的帮我们组织代码。例如 Vue 和 Axios 等优秀的框架都应用了很多的设计模式在里面。
## 设计模式-创建型
在设计模式中概念中，又细分为创建型，结构性和行为型。
创建型模式分为单例模式，原型模式，工厂方法模式，建造者模式。

那么接下来，我来一个一个的介绍一下。
### 单例模式
> 单例模式：某一个类只生成一个实例，该类提供一个全局访问点供外部获取该实例，期拓展是有限多例模式。 

举个例子，我们的页面会有很多的播放小组件，我们期望的是一个音频播放，其他音频都停止。那么我们可以使用单例，让所有的播放组件的播放功能都是同一个class的实例，然后在这个class的实例中进行控制，那么就很容易了。
```javascript

/**
 * audio
 */
class Audio {
  static instance
  constructor() {
    if (Audio.instance){
      return Audio.instance
    }else {
      this.src = ''
      this.isPlaying = false
      Audio.instance = this
    }
  }

  start(src){
    this.src = src
    this.isPlaying = true
    // ....
  }

  pause(){
    this.isPlaying = false
  }
  stop(){
    this.src = ''
    this.isPlaying = false
  }
}
let audioOne = new Audio()
let audioTwe = new Audio()
console.log(audioOne === audioTwe) // true
```

上面是使用class中的静态属性来实现的，还可以使用高阶函数和闭包来缓存静态变量来实现单例模式。

```javascript
/**
 * 高阶函数 使用闭包来实现静态变量
 */
function getSingle(fn){
  let instance;
  return function(...args){
    if(!instance){
      instance = new fn(...args);
    }
    return instance;
  }
}
let audioThree = getSingle(Audio)()
console.log(audioThree === audioTwe) // true
```
单例模式的优点：
- 单例模式可以保证内存里只有一个实例，减少了内存的开销。
- 可以避免对资源的多重占用。
- 单例模式设置全局访问点，可以优化和共享资源的访问。
### 原型模式
> 原型模式：用一个已经创建的实例作为原型，通过复制该原型对象来创建一个和原型相同或相似的新对象。

采用原型模式，可以快速构建一个复杂对象，非常高效，开发人员无需知道对象创建的细节。

原型模式通常适用于以下场景。

* 对象之间相同或相似，即只是个别的几个属性不同的时候。
* 创建对象成本较大，例如初始化时间长，占用性能太多，或者占用网络资源太多等，需要优化资源。
* 系统中大量使用该类对象，且各个调用者都需要给它的属性重新赋值。

接下来用js来实现以下原型模式：
```javascript
// 定义原型 car
const car = {
  init: function (name) {
    this.name = name
  },
  getCar: function () {
    return 'getCar'+ this.name
  }
}
// electricCar 是一个新的car，同时增加了engine属性。
// electricCar 继承了原型上的方法，同时还新增属性。
const electricCar =function (name){
  function F() {}
  F.prototype = car
  const  f =new F()
  f.init(name)
  f.engine = 'Oil electric hybrid'
  return f
}
let myCar = new electricCar('BYD')

console.log(myCar.getCar())
console.log(myCar.engine)
```

### 工厂方法模式
> 工厂模式的定义：定义一个创建产品对象的工厂接口，将产品对象的实际创建工作推迟到具体子工厂类当中。

如果要创建的产品不多，只要一个工厂类就可以完成，这种模式叫“简单工厂模式”。
简单工厂接受一个参数，直接进行对象的构建，返回。
```javascript
/**
 * 简单工厂模式
 */

class Keyboard{
  constructor(props) {
     this.getProduct()
  }
  getProduct() {
    console.log('生产键盘')
  }
}

class Mouse {
  constructor(props) {
    this.getProduct()
  }
  getProduct ( ){
    console.log('生产鼠标')
  }
}

console.log('------------')
function PeripheralFactory(product) {
  let peripheralProduct = null
  if (product === 'keyboard'){
    peripheralProduct = new Keyboard()
  }else if (product === 'mouse'){
    peripheralProduct = new Mouse()
  }else {
    console.log('臣妾无能为力啊')
  }
  return peripheralProduct
}

PeripheralFactory('keyboard')
PeripheralFactory('mouse')
PeripheralFactory('screen')
```
通过一个简单的控制，来进行对象的生成，具有非常好的扩展性。但是 简单工厂方法却违背了开闭原则，而 工厂方法模式 则是对简单工厂进行进一步的抽象。

工厂方法模式的主要角色如下:
1. 抽象工厂（Abstract Factory）：提供了创建产品的接口，调用者通过它访问具体工厂的工厂方法 newProduct() 来创建产品。
2. 具体工厂（ConcreteFactory）：主要是实现抽象工厂中的抽象方法，完成具体产品的创建。
3. 抽象产品（Product）：定义了产品的规范，描述了产品的主要特性和功能。
4. 具体产品（ConcreteProduct）：实现了抽象产品角色所定义的接口，由具体工厂来创建，它同具体工厂之间一一对应。

```javascript
/**
 * 工厂方法模式
 */
class Computer {
  createComputer(){}
}
class Cpu extends Computer{
  createComputer() {
    super.createComputer()
    console.log('生产cpu')
  }
}
class Disk extends Computer{
  createComputer() {
    super.createComputer()
    console.log('生产disk')
  }
}
class ComputeFactory {
  getProduct(){}
}
class CpuFactory extends ComputeFactory{
  getProduct() {
    super.getProduct();
    return new Cpu()
  }
}
class DiskFactory extends ComputeFactory{
  getProduct() {
    super.getProduct();
    return new Disk()
  }
}

function product() {
  let cpuFactory = new CpuFactory()
  cpuFactory.getProduct().createComputer()
  console.log('===>')
  let diskFactory = new DiskFactory()
  diskFactory.getProduct().createComputer()
}

product()

```
工厂方法模式是典型的解耦框架，用户只需要知道具体工厂的名称就可得到所要的产品，无须知道产品的具体创建过程。灵活性增强，对于新产品的创建，只需多写一个相应的工厂类。

### 建造者模式
> 建造者模式：指将一个复杂对象的构造与它的表示分离，使同样的构建过程可以创建不同的表示.它是将一个复杂的对象分解为多个简单的对象，然后一步一步构建而成。它将变与不变相分离，即产品的组成部分是不变的，但每一部分是可以灵活选择的。

建造者模式的主要角色如下。

1. 产品角色（Product）：它是包含多个组成部件的复杂对象，由具体建造者来创建其各个零部件。
2. 抽象建造者（Builder）：它是一个包含创建产品各个子部件的抽象方法的接口，通常还包含一个返回复杂产品的方法 getResult()。
3. 具体建造者(Concrete Builder）：实现 Builder 接口，完成复杂产品的各个部件的具体创建方法。
4. 指挥者（Director）：它调用建造者对象中的部件构造与装配方法完成复杂对象的创建，在指挥者中不涉及具体产品的信息。

看起来挺复杂的，当我看到这个定义的时候，我第一时间想到的就是组装电脑，电脑是个复杂的对象，我们可以将它拆解为几个简单对象，比如 显卡，cpu，内存等。然后在通过不同的控制，进行组合，每一部分都是可以灵活选择的。那么我们套用到上面的概念，产品就是计算机，指挥者就是电脑组装，我这里定义为销售电脑的人。
```javascript
class Product{
  setCpu(cpu){
    this.cpu = cpu
  }
  setDisk(disk){
    this.disk = disk
  }
  setVideoCard(videoCard){
    this.videoCard = videoCard
  }
  show(){
    console.log(`您可以购买的产品属性为：cpu:${this.cpu}  硬盘：${this.disk}  显卡：${this.videoCard}`)
  }
}
// 抽象建造者
class Builder {
  constructor() {
    this.product = new Product()
  }
  buildCpu(){}
  buildDisk(){}
  buildVideoCard(){}
  getResult(){
    return this.product
  }
}
// 具体建造者
class LowComputerBuild extends Builder{
  buildCpu() {
    super.buildCpu();
    console.log('cpu: i3')
    this.product.setCpu('i3')
  }
  buildDisk() {
    super.buildDisk();
    console.log('disk: 512G')
    this.product.setDisk('512G')
  }
  buildVideoCard() {
    super.buildVideoCard();
    console.log('video card: GTX980')
    this.product.setVideoCard('GTX980')
  }
}
class GoodComputerBuild extends Builder{
  buildCpu() {
    super.buildCpu();
    console.log('cpu: i9')
    this.product.setCpu('i9')
  }
  buildDisk() {
    super.buildDisk();
    console.log('disk: 2T')
    this.product.setDisk('2T')
  }
  buildVideoCard() {
    super.buildVideoCard();
    console.log('video card: GTX3070')
    this.product.setVideoCard('GTX3070')
  }
}
// 指挥者
class Director{
  constructor(money) {
    console.log('电脑销售人员：你好，你的口袋里装了多少钱啊',`我：我口袋里面有${money}`)
    if (money<10000){
      console.log('电脑销售人员心里话:穷鬼')
      this.builder = new LowComputerBuild()
    }else {
      console.log('电脑销售人员心里话:小肥羊啊，宰了')
      this.builder = new GoodComputerBuild()
    }
  }
  construct(){
    this.builder.buildCpu()
    this.builder.buildDisk()
    this.builder.buildVideoCard()
    return this.builder.getResult()
  }
}

function buyComputer() {
  console.log('I have $1000')
  let salesman = new Director(1000)
  let product =  salesman.construct()
  product.show()
  setTimeout(() => {
    console.log('after 2 years working ---> I have $10001 ')
    salesman = new Director(10001)
    product = salesman.construct()
    product.show()
  },2000)
}
buyComputer()
```
上面的例子中，指挥者（销售人员）会根据我传入的参数，而进行具体产品的构建。
看完了例子，会不会觉得建造者和工厂模式十分相似。建造者模式和工厂模式的区别主要在于对象的复杂程度，一个简单的对象使用工厂模式就可以了，对于复杂对象的构建时，可以考虑使用建造模式，建造者模式分离创建和表现，使得产品构建的灵活性大大增强。

建造者模式主要适用于以下应用场景：
1. 相同的方法，不同的执行顺序，产生不同的结果。
2. 多个部件或零件，都可以装配到一个对象中，但是产生的结果又不相同。
3. 产品类非常复杂，或者产品类中不同的调用顺序产生不同的作用。
4. 初始化一个对象特别复杂，参数多，而且很多参数都具有默认值。

## 总结
设计模式是每个开发人员都要学习，熟悉的开发'套路'，高效的使用设计模式可以更好地组织代码。当然凡事无绝对，如果有更加简单方便的方法去实现功能肯定是更好的选择。

本文简单的讲了一下js设计模式中的创建型，设计模式还有结构型和表现型，后面也会陆续更新出来。
