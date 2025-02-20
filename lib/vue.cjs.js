'use strict';

function isObject(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
}

const publicPropertiesMAp = {
    $el: (i) => i.vnode.el
};
const publicinstanceProxyHandlers = {
    get({ _: instance }, key) {
        // 如果key在setupState里面 也就是setup函数返回的数据
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        else if (publicPropertiesMAp[key]) {
            return publicPropertiesMAp[key](instance);
        }
    }
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
function setupComponent(instance) {
    // init
    setupStatefulComponent(instance);
}
// 这个函数用于完善组件实例的各项数据
function setupStatefulComponent(instance) {
    const component = instance.type;
    // 这里proxy代理的变量应该是上下文环境变量
    instance.proxy = new Proxy({ _: instance }, publicinstanceProxyHandlers);
    const { setup } = component;
    if (setup) {
        const setupResult = setup(); //setup的返回值可能是函数 也可能是对象 
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
    const el = (vnode.el = document.createElement(vnode.type));
    console.log(vnode);
    const { children, props } = vnode;
    for (let key in props) {
        el.setAttribute(key, props[key]);
    }
    if (shapeFlag & 4 /* SHAPEFLAGS.text_children */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* SHAPEFLAGS.array_children */) {
        children.forEach(ele => {
            mountElement(ele, el);
        });
    }
    container.append(el);
}
function setupRenderEffect(instance, vnode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    console.log(instance.vnode);
    vnode.el = subTree.el;
    console.log('instance.vnode.el', vnode);
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
