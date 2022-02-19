# 经典前端面试题目

## js 基本类型
1. 简单类型
   * null
   * undefined
   * string
   * number
   * boolean
   * object
   * symbol[es6]  
   * bigInt[es10]
2. 复杂类型
   * function
   * array

## 什么是原型链

js的对象继承是依靠原型链来实现的。

那么什么是原型链。
> 每个构造函数(constructor)都有一个原型对象(prototype),原型对象都包含一个指向构造函数的指针,而实例(instance)都包含一个指向原型对象的内部指针.



## Object.create(null) 和 {} 创建对象的区别

创建对象的方法：
```
const obj = {};
const obj2 = Object.create(null);
const obj3 = new Object();
```

### {} 和 new Object()
{} 和 new Object() 使用效果一样。

都会继承object，具有原型方法。

### Object.create(null)

要想创建一个干净的空对象，应该使用Object.create(null)。

通过做Object.create(null). 可以显示指定null作为原型，没有多余属性，甚至没有构造函数，头ST日你锅，hasOwnProperty属性。

## 闭包
闭包是指有权访问另一个函数作用域中的变量的函数。

当函数可以记住病房问所在的词法作用域时，就会产生闭包。

闭包的作用：
*  能够访问函数定义所在的词法作用。
*  私有化变量
*  模拟块级作用域
*  创建模块

缺点： 闭包产生的变量会一直保存在内存中，影响性能。不正确的使用闭包可能还会导致内存泄露。

