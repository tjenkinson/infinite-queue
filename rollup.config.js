import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/infinite-queue.ts',
  plugins: [typescript(), resolve(), commonjs()],
  onwarn: (e) => {
    throw new Error(e);
  },
  output: [
    {
      name: 'StateManager',
      file: 'dist/infinite-queue.js',
      format: 'umd',
    },
    {
      file: 'dist/infinite-queue.es.js',
      format: 'es',
    },
  ],
};
