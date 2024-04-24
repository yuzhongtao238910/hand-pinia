export function addSubscription(subscriptions, callback) { // 订阅
    subscriptions.push(callback) // 将回调放到队列/数组之中



    const removeSubscription = () => {
        const idx = subscriptions.indexOf(callback)
        if (idx > -1) {
            subscriptions.splice(idx, 1)
        }
    }

    return removeSubscription
}
export function triggerSubscriptions(subscriptions, ...args) { // 发布逻辑
    subscriptions.slice().forEach(cb => cb(...args))
}
