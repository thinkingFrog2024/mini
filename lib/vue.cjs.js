'use strict';

function normalizeSlots(val) {
    return Array.isArray(val) ? val : [val];
}
function initSlots(instance, children) {
    // instance.slots = children
    // 为了实现具名插槽这里使用对象
    // 实现作用域插槽：slots是一个函数
    const slots = {};
    for (let key in children) {
        const value = children[key];
        // slots原本应该是一个虚拟节点 因为h函数的第三个参数是数组 所以应该用数组包裹起来
        // 对于作用域插槽 slots是一个函数 返回一个虚拟节点 
        // 应该先获得这个节点 再包装成函数 
        slots[key] = (props) => normalizeSlots(value(props));
    }
    instance.slots = slots;
}
function renderSlots(slots, name, prop) {
    const slot = slots[name];
    if (slot) {
        console.log(slot(prop));
        return slot(prop);
    }
}

function isObject(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
}

const publicPropertiesMAp = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
};
const publicinstanceProxyHandlers = {
    get({ _: instance }, key) {
        // 如果key在setupState里面 也就是setup函数返回的数据
        const { setupState, props } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        else if (publicPropertiesMAp[key]) {
            return publicPropertiesMAp[key](instance);
        }
        else if (key in props) {
            return props[key];
        }
    }
};

function initProps(instance, props) {
    instance.props = props || {};
}

// activeEffect不为空证明当前有正在运行的函数 那么才有必要触发依赖收集 否则get陷阱只需要返回访问值即可
const targetMap = new Map();
function track(target, key) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
}
function trigger(target, key) {
    // let depsMap = targetMap.get(target)
    // if(!depsMap) return 
    // let dep = depsMap.get(key)
    // triggerEffects(dep)
    // 现在只实现的get和set 但是其实有其他的操作 比如delete 这些操作也有对应的effects需要触发
    // 所以应该初始化两个数组:deps 存放所有的dep effects 遍历deps 把里面的函数解构出来存放在efffects里面
    // 然后把处理好的effect交给triggerEffects处理
    let deps = [];
    // 取出get对应的effects并存放
    let depsMap = targetMap.get(target);
    if (!depsMap)
        return; //注意这里可能是不存在的
    let dep = depsMap.get(key);
    deps.push(dep);
    let effects = [];
    deps.forEach(dep => {
        effects.push(...dep);
    });
    triggerEffects(effects);
}
function triggerEffects(dep) {
    for (let effect of dep) {
        console.log(effect.schelduler);
        // nextTick就是通过schelduler实现的
        if (effect.schelduler) {
            effect.schelduler();
        }
        else {
            effect.run();
        }
    }
}

function createGetter(isreadOnly = false, shallow = false) {
    return function get(target, key, recevier) {
        // 验证访问reactive的源对象的时候key是否正确 访问上下文是否正确:访问上下文是代理对象
        const isExistInReactiveMap = () => recevier === reactiveMap.get(target);
        const isExistInReadOnlyeMap = () => recevier === readOnlyMap.get(target);
        const isExistInShallowReadOnlyeMap = () => recevier === shallowReadOnlyMap.get(target);
        switch (key) {
            case "__v_raw" /* ReactiveFlags.RAW */: {
                if (isExistInReactiveMap() ||
                    isExistInReadOnlyeMap() ||
                    isExistInShallowReadOnlyeMap()) {
                    return target;
                }
                break;
            }
            case "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */: {
                return !isreadOnly;
            }
            case "__v_isReadonly" /* ReactiveFlags.IS_READONLY */: {
                return isreadOnly;
            }
            default: {
                // 当数据活跃并且当前有正在运行的影响时才需要进行track
                if (!isreadOnly) {
                    track(target, key);
                }
                const res = Reflect.get(target, key);
                if (shallow) {
                    return res;
                }
                else if (isObject(res)) {
                    return isreadOnly ? readOnly(res) : reactive(res);
                }
                else {
                    return res;
                }
            }
        }
    };
}
function createSetter(isreadOnly = false) {
    return function set(target, key, val, receiver) {
        if (!isreadOnly && target[key] !== val) {
            const res = Reflect.set(target, key, val, receiver);
            trigger(target, key);
            return res;
        }
        else {
            console.warn('禁止修改只读对象');
            return true;
        }
    };
}
const readOnlyGetter = createGetter(true);
const Getter = createGetter(false);
const readOnlySetter = createSetter(true);
const Setter = createSetter(false);
const shallowRadOnlyGetter = createGetter(true, true);
const mutableHandler = {
    get: Getter,
    set: Setter
};
const readOnlyHandler = {
    get: readOnlyGetter,
    set: readOnlySetter
};
const shallowRadOnlyHandler = Object.assign({}, readOnlyHandler, {
    get: shallowRadOnlyGetter
});

const reactiveMap = new WeakMap();
const readOnlyMap = new WeakMap();
const shallowReadOnlyMap = new WeakMap();
function reactive(raw) {
    return createActiveObject(raw, reactiveMap, mutableHandler);
}
function readOnly(raw) {
    return createActiveObject(raw, readOnlyMap, readOnlyHandler);
}
function shallowReadOnly(raw) {
    return createActiveObject(raw, shallowReadOnlyMap, shallowRadOnlyHandler);
}
function createActiveObject(raw, proxyMap, handler) {
    // 如果需要代理的对象是已经代理过的对象 那么直接返回
    if (proxyMap.get(raw))
        return proxyMap.get(raw);
    const proxy = new Proxy(raw, handler);
    proxyMap.set(raw, proxy);
    return proxy;
}

function emit(instance, event) {
    const { props } = instance;
    // add=>onAdd
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    function toHandlerKey(name) {
        return name ? 'on' + capitalize(name) : "";
    }
    if (props[toHandlerKey(event)]) {
        props[toHandlerKey(event)]();
    }
}

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: (event) => { },
        slots: {}
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // init
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponent(instance);
}
// 这个函数用于完善组件实例的各项数据
function setupStatefulComponent(instance) {
    const component = instance.type;
    // 这里proxy代理的变量应该是上下文环境变量
    instance.proxy = new Proxy({ _: instance }, publicinstanceProxyHandlers);
    const { setup } = component;
    if (setup) {
        // props是一个浅层只读
        const setupResult = setup(shallowReadOnly(instance.props), { emit: instance.emit }); //setup的返回值可能是函数 也可能是对象 
        handleSetupResult(instance, setupResult);
    }
    finishComponentSetup(instance);
}
function handleSetupResult(instance, res) {
    // todo:function
    if (isObject(res)) {
        // 把setup执行结果挂载在组件实例上面
        instance.setupState = res;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        // 给组件实例挂载render函数
        instance.render = component.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    // 当类型为组件 vnode.type是一个对象 当类型为element 是一个string
    const { shapeFlag } = vnode;
    if (shapeFlag & 1 /* SHAPEFLAGS.element */) {
        processElememt(vnode, container);
    }
    else if (shapeFlag & 2 /* SHAPEFLAGS.stateful_component */) {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    // 初始化
    mountComponent(vnode, container);
}
function processElememt(vnode, container) {
    // 更新
    mountElement(vnode, container);
}
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    // 组件完成setup开始render 渲染视图
    setupRenderEffect(instance, vnode, container);
}
function mountElement(vnode, container) {
    const { shapeFlag } = vnode;
    console.log('vnode', vnode);
    const el = (vnode.el = document.createElement(vnode.type));
    const { children, props } = vnode;
    for (let key in props) {
        const ison = (key) => /^on[A-Z]/.test(key);
        if (ison(key)) {
            const event = key.slice(2).toLowerCase();
            el.addEventListener(event, props[key]);
        }
        else {
            el.setAttribute(key, props[key]);
        }
    }
    if (shapeFlag & 4 /* SHAPEFLAGS.text_children */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* SHAPEFLAGS.array_children */) {
        children.forEach(ele => {
            patch(ele, el);
        });
    }
    container.append(el);
}
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    vnode.el = subTree.el;
}

function createVnode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* SHAPEFLAGS.array_children */;
    }
    else {
        vnode.shapeFlag |= 4 /* SHAPEFLAGS.text_children */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return isObject(type)
        ? 2 /* SHAPEFLAGS.stateful_component */
        : 1 /* SHAPEFLAGS.element */;
}

function createApp(rootComponnet) {
    return {
        mount(rootContainer) {
            // 
            const vnode = createVnode(rootComponnet);
            render(vnode, rootContainer);
        }
    };
}

function h(type, props, children) {
    return createVnode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
exports.renderSlots = renderSlots;
