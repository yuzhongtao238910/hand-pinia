<script setup>
// <!--// import { toRefs } from "vue"-->
import { useCounterStore } from "./stores/counter.js"
import { useNumberStore } from "./stores/number.js"
const store = useCounterStore()
const number = useNumberStore()
console.log(number, 77777777)
// console.log(store)
const { increment } = store
// <!--console.log(store)-->
//
// <!--// 这样做就会失去响应式了-->
// <!--const { count, double} = store-->
// <!--console.log(count,double)-->
import { inject } from "vue"
import { PiniaSymbol } from "./pinia/rootState.js"
const res = inject(PiniaSymbol)



// devtool会查看到两次的修改信息
const patch = () => {
  // number.$patch({
  //   number: 2
  // }) // react setState {number: 100, a: 1, b: 2}
  // number.number++

  // 实现批量更新，只有一次记录
  number.$patch((state) => {
    state.number++
    state.number++
  })
}


// 只能是选项式api来使用，组合式api无法使用啊
const reset = () => {
  store.$reset() // 拿到默认的stete的方法，在执行一次，覆盖掉所有的状态
}


// 类似于 vuex之中也实现了 $subscribe
store.$subscribe((mutation, state) => {// 只要状态变化了，我们可以监控到 发生的动作和最新的状态是什么？？
  console.log(mutation, state) // 存储到本地
})


// 监控异步的操作逻辑
// 监控触发actions 大多数action是一个promise，我们希望action执行后再执行一些额外的逻辑
number.$onAction(({after, onError}) => {
  after(() => {
    console.log(number)
  })
  onError(err => {
    console.warn(err)
  })
})
</script>
<!--<script>-->
<!--export default {-->
<!--  mounted() {-->
<!--    console.log(this, 14)-->
<!--  }-->
<!--}-->
<!--</script>-->

<template>
  <h1>238910</h1>
  <div>计数器：{{store.count}}</div>
<!--  <div>双倍：{{number.double}}</div>-->
<!--  这个方式可以修改，但是不建议，一般修改状态都是希望统一逻辑-->
  <button @click="store.count++">+1</button>
  <button @click="store.increment">+1</button>
<!--  <button @click="() => number.increment(2)">+1</button>-->

<!--  patch直接修改部分所有的状态 reset用默认状态进行覆盖-->
  <button @click="patch">同时多次修改</button>

  <button @click="reset">恢复为默认状态</button>
</template>

<style scoped>

</style>
