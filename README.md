### Vuex和pinia的区别

- pinia的特点采用ts进行编写，类型提示完整，体积小，使用简单
- 去除了mutations，状态state，getters，actions（包含了同步和异步）
- pinia的优势支持compositionApi，同时也兼容optionsApi(this指向) 可以无痛的将vue3的代码直接迁移到pinia之中

- vuex之中需要使用module来定义模块（嵌套问题），是一个树状结构，vuex之中有命名空间的概念（namespaced），整个数据定义是树的结构，整个嵌套比较的深$store.state.a.b.c.xxx,所有的模块的状态会定义到根模块上,会出现模块的覆盖根的问题
- vuex之中只允许有一个store，pinia可以有多个store，store之间可以互相调用，扁平化了，不用担心命名冲突

```js
new Vuex.Store({
  state: {a: 1},
  module: {
    a: {
      state: {}
    }
  }
})
```





























