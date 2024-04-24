import { getCurrentInstance, inject, reactive, toRefs, computed, isRef, watch } from "vue"
import { PiniaSymbol } from "./rootState.js"
import { addSubscription, triggerSubscriptions } from "./sub.js" // 发布和订阅
function isObject(val) {
    return typeof val === 'object' && val !== null
}
function createOptionStore(id, options, pinia) {
    const { state, actions, getters = {} } = options

    // pinia就是创建了一个响应式对象而已
    // const store = reactive({})
    //
    // function wrapAction(action) {
    //     return function () {
    //         // 将action之中的this永远处理成store，保证this的指向的问题
    //         return action.call(store, ...arguments)
    //     }
    // }

    function setup() {
        // 用户提供的状态
        pinia.state.value[id] = state ? state() : {}
        // const localState = pinia.state.value[id]
        const localState = toRefs( pinia.state.value[id] ) // 解构出来依旧是响应式的

        const setupStore = Object.assign(
            localState,
            actions, // 用户提供的动作
            Object.keys(getters).reduce((computeds, getterKey) => {
                computeds[getterKey] = computed(() => {
                    const store = pinia._s.get(id) // 当前的store
                    return getters[getterKey].call(store)
                })
                return computeds
            }, {})
        )
        return setupStore
    }

    const store = createSetupStore(id, setup, pinia) // 转换为setup语法

    store.$reset = function() { // 官网有说明，此方法只会支持optionApi,
        const newState = state ? state() : {}
        // debugger
        this.$patch(newState)
    }
    // return store
}


// setupStore用户已经提供了完整的setup方法，我们只需要直接执行setup函数就可以，通过返回值，放到store上面
function createSetupStore(id, setup, pinia, isSetupStore) {

    function merge(target, partialState) {
        for (const key in partialState) {
            if (!partialState.hasOwnProperty(key)) {
                continue
            }
            const targetValue = target[key] // 原始的值 {a: {a: 1}}
            const subPatch = partialState[key] // 后来的值{a: {a: 2}}
            // {a: ref{a: 2}}


            // 如果是ref的话，就不递归了
            if (isObject(targetValue) && isObject(subPatch) && !isRef(subPatch)) {
                target[key] = merge(targetValue, subPatch)
            }


            target[key] = subPatch // 如果不需要合并，那么直接使用新的覆盖掉老的
        }


        return target
    }

    function $patch(partialStateOrMutator) {
        // 这里我们需要获取到原来的状态
        // partialStateOrMutator 部分状态

        // 当前store之中的全部状态 pinia.state.value[id]
        if (typeof partialStateOrMutator !== 'function') {
            // 不是函数，就认为是对象
            merge(pinia.state.value[id], partialStateOrMutator)
        } else {
            // number.$patch((state) => {
            //   state.number++
            //   state.number++
            // })
            partialStateOrMutator(pinia.state.value[id]) // 将当前的store状态传递进去
        }
        // {a: {a: 1, b: 2}} {a: {a: 2}} {a: {a: 2, b: 2}}
        // console.log(pinia.state.value[id])
    }

    const actionSubscriptions = [] // 所有订阅 action的事件，都应该放到此数组之中
    const partialStore = {
        $patch,
        $subscribe(callback) {
            // 默认vue3之中watch一个响应式数据，深度监控的，可以直接放一个响应式的对象
            watch(pinia.state.value[id], (state) => {
                callback({id}, state)
            })
        },
        // 订阅
        $onAction: addSubscription.bind(null, actionSubscriptions)
    }
    const store = reactive(partialStore)
    function wrapAction(action) {
        return function () {
            // 将action之中的this永远处理成store，保证this的指向的问题
            // return action.call(store, ...arguments)

            const afterCallbacks = []
            const onErrorCallbacks = []
            const after = (callback) => {
                afterCallbacks.push(callback)
            }
            const onError = (callback) => {
                onErrorCallbacks.push(callback)
            }

            // 让用户传递after和 error
            triggerSubscriptions(actionSubscriptions, {
                after, onError
            })
            let ret

            // 回调的方式
            try {
                // 正常action是一个回调的情况，我们可以直接拿到返回值触发after回调
                ret = action.call(store, ...arguments)
                triggerSubscriptions(afterCallbacks, ret)
            } catch(e) {
                triggerSubscriptions(onErrorCallbacks, e)
            }

            // 返回值是promise的情况 针对场景做处理
            if (ret instanceof Promise) {
                return ret.then(val => {
                    triggerSubscriptions(afterCallbacks, val)
                }).catch(err => {
                    triggerSubscriptions(afterCallbacks, err)
                })
            }
            return ret
        }
    }
    if (isSetupStore) {
        pinia.state.value[id] = {} // 用户存放 setupStore 的 id 对应的状态
    }
    const setupStore = setup() // 拿到的setupStore可能没有处理过this指向
    for (let prop in setupStore) {
        const value = setupStore[prop]
        if (typeof value === 'function') {
            // 将函数的this永远指向store
            setupStore[prop] = wrapAction(value)
        } else if (isSetupStore) { // 对setupStore来做一些处理操作
            // 是用户写的compositionApi
            // pinia.state.value[id] = {}
            pinia.state.value[id][prop] = value // 将用户返回的对象里面的所有的属性，都存到state属性之中
        }
    }

    Object.assign(store, setupStore)
    // console.log(store)
    pinia._s.set(id, store)
    return store
}
export function defineStore(idOrOptions, setup) {
    let id;
    let options;
    const isSetupStore = typeof setup === 'function' // 区分optionsapi还是setupApi
    // 对用户的两种写法做一个兼容性处理
    if (typeof idOrOptions === 'string') {
        id = idOrOptions
        options = setup
    } else {
        // 说明是一个对象
        options = idOrOptions
        id = idOrOptions.id
    }

    // $patch 这个方法用的不多，使用有两种模式
    // $patch({count ： 1})
    // $patch((state) => {})

    function useStore() {
        // useStore只能在组件之中使用，
        const currentInstance = getCurrentInstance()

        const pinia = currentInstance && inject(PiniaSymbol)
        // console.log(pinia)

        if (!pinia._s.has(id)) {
            if (isSetupStore) {
                createSetupStore(id, setup, pinia, isSetupStore) // 创建一个setupStore
            } else {
                // 这个store是第一次使用

                // 创建选项store，还有可能是setupStore
                createOptionStore(id, options, pinia, isSetupStore); // 创建后的store需要存储到_s之中就可以
            }

        }
        const store = pinia._s.get(id) // 如果已经有了store，则不用创建，直接拿到就可以了
        return store
    }
    return useStore
}
