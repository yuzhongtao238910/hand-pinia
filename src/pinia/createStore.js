import { PiniaSymbol } from "./rootState.js"
import { ref } from "vue"
export function createPinia() {


    // pinia是管理多个store，核心是管理store的状态
    const state = ref({}) // 映射状态
    const pinia = {
        install(app) {
            // 希望所有组件都可以拿到
            // 我们期望所有的组件都可以访问到这个pinia这个应用
            // 方式1：vue的方式
            app.config.globalProperties.$pinia = pinia
            // vue2: Vue.prototype.$pinia = pinia
            // 方式2：vue3可以通过inject注入使用
            app.provide(PiniaSymbol, pinia)
        },
        state,
        _s: new Map() // 每个store id -》 store
    }

    return pinia
}
