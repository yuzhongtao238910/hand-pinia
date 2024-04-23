import {defineStore} from "../pinia/index.js"
// import {defineStore} from "pinia"
import { ref, computed } from "vue"
export const useNumberStore = defineStore('number', () => { // setup 同组件的setup，我们可以直接将组件之中的setup拿过来
    const number = ref(0)
    const double = computed(() => {
        return number.value * 2
    })

    const increment = (payload) => {
        number.value += payload
    }
    return {
        number, // 状态
        double, // 计算属性
        increment // 函数
    }
})
