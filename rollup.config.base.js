import resolve from '@rollup/plugin-node-resolve'
import image from '@rollup/plugin-image'
import commonjs from '@rollup/plugin-commonjs'
import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'

const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]

const plugins = [
    image(),
    resolve({
        preferBuiltins: true,
        browser: true,
    }),
    commonjs({
        include: /node_modules/,
    }),
    typescript({ useTsconfigDeclarationDir: false }),
]

/**
 * 롤업 설정 만들기 함수
 * @param {string} moduleFormat es or cjs
 * @returns {Object} 롤업 설정
 */
export function createRollupConfig(moduleFormat) {
    let format = moduleFormat === 'esm' ? 'es' : moduleFormat
    if (format !== 'es' && format !== 'cjs') {
        console.warn('invalid module format')
        return
    }

    return {
        input: 'src/index.ts',
        output: {
            dir: `build/${format}`,
            format: format,
            sourcemap: true,
        },
        preserveModules: false,
        plugins,
        external,
    }
}
