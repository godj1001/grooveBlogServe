# dns

## dns是什么？
dns【Domain Name System】域名系统，是互联网的一项服务,是应用层协议。负责将域名和IP地址相互映射的一个分布式数据库。若是没有找到则会向上继续寻找，直到找到最顶级的服务器。

## 用途
例如 `www.baidu.com`,我们能清晰的记住他的网址，若是换成了 IP 地址则会大大增加了记忆成本。

## dns解析
已经知道了dns是什么了。那么dns到底是如何工作的呢？

### 域名解析
dns的核心是一个树状的分布式服务。

* 根域名服务器（Root DNS Server）：管理顶级域名服务器，返回“com”“net”“cn”等顶级域名服务器的 IP 地址
* 顶级域名服务器（Top-level DNS Server）：管理各自域名下的权威域名服务器，比如 com 顶级域名服务器可以返回 apple.com 域名服务器的 IP 地址
* 权威域名服务器（Authoritative DNS Server）：管理自己域名下主机的 IP 地址


![dns](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7171cbec7a2049fbab0a9556e5824938~tplv-k3u1fbpfcp-watermark.awebp)

若是我们使用dns查询某域名时，分以下几个步骤：
1. 本地host文件
2. 本地dns解析
3. dns服务器缓存
4. dns服务器递归查找

### 本地host文件
如果大家改过host文件就能知道，host文件内可以配置域名和ip的对应。这个是第一优先级的，因为可能会被修改。

### 本地DNS缓存
为了防止每次都要去向最顶级的服务器查找，所以存在一种设备，叫做缓存域名服务器。当然这是外部设备，在本地也会留有缓存，可以方便查询。

### DNS服务器缓存
每个在网络连接的设备都会有一个dns服务器相对应，若是访问某个从未访问过的网站，那么本地肯定是没有任何缓存记录的。这时候就需要向dns服务器缓存询问。

### DNS服务器递归查找
那么若是dns服务器也没有这么偏僻的域名呢？例如 `http://groove-zhang.cn` 这样不知名的小网站呢？那就可以通过dns服务器递归查找的方式来找到。
1. 询问根域名，获取顶级域名 .cn 是中国国内域名。
2. 询问顶级域名，获取二级域名 groove-zhang.cn 需要在域名网站上进行注册，肯定是有所地址记录的。
3. 最后，将`http://groove-zhang.cn`的ip地址返回给用户，并且缓存
4. 用户获取到真正的ip地址，并且缓存

## 为什么选择使用UDP来发送DNS请求
UDP和TCP的特性和区别这边就不多说，主要说为什么选择UDP。

在网络通信过程中，衡量快慢的指标是时间。那么从速度上来说UDP就比TCP要快一些，不仅传输不需要建立连接，传输的内容上也要小。

当然，udp的缺点就是不保证完整和稳定，在dns的标准协议中，还要求若是udp失败了则需要使用tcp来进行dns协议请求。

## 总结 
![dns](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/471eba305be24253a89adfb053addd10~tplv-k3u1fbpfcp-watermark.awebp)