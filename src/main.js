import { createApp } from 'vue'
import App from './App.vue'

// 创建pinia
import { createPinia } from "./pinia/index.js"

const app = createApp(App)
const pinia = createPinia() // 获取pinia

// use api 可以调用插件的install方法，将app注入进来
// 注册插件的两种方式
// 方式1：
// app.use({
//     install(app) {
//         console.log(app, 10)
//     }
// })


// 方式2
// app.use(function (app) {
//     console.log(app, 18)
// })



// 使用pinia插件 pinia是一个对象，里面含有install方法
app.use(pinia)
app.mount('#app')
