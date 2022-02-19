## js原型链 对象相关

### new 关键字

```javascript
function newKey() {
    // 创建空对象
    const obj = new Object();
    // 获取构造函数
    const classConstuctor = Array.prototype.shift.call(arguments);
    // 继承方法和属性
    obj.__proto__ = classConstuctor.prototype;
    // 转移this指向
    let res = classConstuctor.apply(obj, arguments);
    let isObject = typeof res === 'object' && res !== null;
    let isFunction = typeof res === 'function';
    // 如果有返回值且返回值是对象类型，那么就将它作为返回值，否则就返回之前新建的对象
    return isObject || isFunction ? res : obj;
}
```

### 原型链继承

直接在子类的原型上去初始化父类。

```javascript
child.prototype = new Father()
```
原型链继承有很大的缺点：
1. 原型中包含的引用类型属性将会被所有实例共享
2. 子类在实例化的时候不能给父类的构造函数传参,意味着子类无法拥有一无二的父类，所有的子类共享一个父类。


### 构造函数继承

```javascript
function Father(name){
    this.bname = name;
    this.getName = function(){
        return this.name
    }
}

function Children(name){
    Father.call(this,name)
}
```
缺点呢就是
* 只能继承父类实例上的属性和方法，不能继承原型属性和方法。
* 无法实现复用，每个子类都有父类实例函数的副本。

### 组合继承
用原型链实现对原型属性和方法的继承，用借用构造函数来实现实例属性的继承

```javascript
function Father(name){
    ...
}

function Child(name){
    Father.call(this,name)
}

Child.prototype = new Father()
Child.prototype.constructor = Child;
```
组合继承的缺点就是在使用子类创建实例的时候，其中原型中会存在两份相同的属性和方法，不过这已经是相对于前两种方式，比较完善的方式了。

### 原型式继承
利用空对象作为中介，将某个对象直接复制给空对象构造函数的原型。
```javascript
function createObj(obj){
    function F(){}
    F.prototype = obj;
    return new F();
}
```
缺点：

* 原型链继承对个实例的引用类型指向相同，存在篡改的可能。
* 无法传递参数

### 寄生继承
在原型式继承的基础上，增强对象，返回构造函数
```javascript
function createFn(obj){
    const clone = createObj(obj);
    clone.doSomething = function(){
        console.log('do something')
    }
    return clone
}
```
缺点同原型式继承相同；

### 寄生组合式继承
```javascript
function extendFn(father,child){
    const prototype = Object.create(father.prototype)
    prototype.constructor = child
    child.prototype = prototype
}
```
这是最成熟的方法，也是现在库实现的方法

### ES6 继承 extends
```javascript
function _inherits(subType, superType) {
  
    // 创建对象，创建父类原型的一个副本
    // 增强对象，弥补因重写原型而失去的默认的constructor 属性
    // 指定对象，将新创建的对象赋值给子类的原型
    subType.prototype = Object.create(superType && superType.prototype, {
        constructor: {
            value: subType,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
    
    if (superType) {
        Object.setPrototypeOf 
            ? Object.setPrototypeOf(subType, superType) 
            : subType.__proto__ = superType;
    }
}
```