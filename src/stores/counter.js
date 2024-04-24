import {defineStore} from "../pinia/index.js"
// import {defineStore} from "pinia"

export const useCounterStore = defineStore("counter", {
    // id: 'counter' 获取直接将id放在对象里面
    state: () => { // reactive({})
        return {
            count: 0
        }
    },
    getters: { // computed
        double() {
            return this.count * 2
        }
    },
    actions: { // methods
        increment() {
            // console.log(this, 1777)
            // 状态更新后，保存到本地
            this.count++
        },
        decrement(payload) {
            this.count-=payload
        }
    }
})
// optionStore 基于optionsAPI来实现的，使用方式和vuex基本一样的

// pinia里面最核心的两个方法：defineStore createPinia
