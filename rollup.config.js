import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve';
import polyfillNode from 'rollup-plugin-polyfill-node';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
export default {
    input:"./src/index.ts",
    output:[
        {
            format:"cjs",
            file:"lib/vue.cjs.js"
        },
        {
            format:'es',
            file:"lib/vue.esm.js"
        }
    ],
    external: ['typescript'],
    plugins:[typescript(), resolve(),polyfillNode(),peerDepsExternal()]
}