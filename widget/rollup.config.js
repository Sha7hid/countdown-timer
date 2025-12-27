import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.jsx',
  output: {
    file: 'dist/countdown-widget.js',
    format: 'iife',
    name: 'CountdownWidget'
  },
  plugins: [
    resolve(),
    babel({
      babelHelpers: 'bundled',
      presets: [
        ['@babel/preset-react', {
          pragma: 'h',
          pragmaFrag: 'Fragment'
        }]
      ],
      extensions: ['.js', '.jsx']
    }),
    terser()
  ]
};