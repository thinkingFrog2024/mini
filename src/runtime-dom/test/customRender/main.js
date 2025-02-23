// import {createRender} from '../../../../lib/vue.esm'
console.log(PIXI)

// const game = new PIXI.Application
// game.init({
//     width:100,
//     heigth:100
// })
function append(content,container){
    container.append(content)
}
// console.log(game)
// document.body.append(game.canvas)
const app = new PIXI.Application();
app.init({
    width: 800,
    height: 600,
    backgroundColor: 0x1099bb
});
document.body.appendChild(app.canvas);

function createElement(type){
    const ele = document.createElement(type)
    console.log(ele,'ele');
    
    return ele
}

function patchProps(props,el){
    for(let key in props){
        const ison = (key)=>/^on[A-Z]/.test(key)
        if(ison(key)){
            const event = key.slice(2).toLowerCase()
            el.addEventListener(event,props[key])
        }else{
            el.setAttribute(key,props[key])
        }
    }
}

function setContent(content,el){
    el.textContent = content
}

const render = createRender({
    append,
    createElement,
    patchProps,
    setContent
})

export function createApp(...args){
    return render.createApp(...args)
}