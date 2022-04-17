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


## 桥接模式