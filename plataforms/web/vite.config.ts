import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve, join } from 'node:path'
import svgr from 'vite-plugin-svgr';
import glsl from 'vite-plugin-glsl';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'src'),
  plugins: [
    // The core React plugin for Vite.
    react(),
    tsconfigPaths(),
    svgr({
      include: "**/*.svg?react"
    }),
    glsl({
      include: [
        '**/*.glsl', '**/*.wgsl',
        '**/*.vert', '**/*.frag',
        '**/*.vs', '**/*.fs'
      ],
      exclude: undefined,             // Glob pattern, or array of glob patterns to ignore
      defaultExtension: 'glsl',       // Shader suffix to use when no extension is specified
      warnDuplicatedImports: true,    // Warn if the same chunk was imported multiple times
      removeDuplicatedImports: false, // Automatically remove an already imported chunk
      importKeyword: '#include',      // Keyword used to import shader chunks
      minify: false,                  // Minify/optimize output shader code
      watch: true,                    // Recompile shader on change
      root: '/'
    })
  ],

  assetsInclude: [
    "**/*.glb",
    "**/*.gltf",
    "**/*.otf",
    '**/*.glsl', 
    '**/*.wgsl',
    '**/*.vert', 
    '**/*.frag',
    '**/*.vs', 
    '**/*.fs'
  ],
  
  server: {
    proxy: {
      // Qualquer requisição que comece com /api
      '/api': {
        // Encaminhe para o seu servidor Fastify
        target: 'http://localhost:8080', // Use a porta do seu servidor
        changeOrigin: true, // Necessário para evitar erros de CORS
      }
    }
  }
  // Configuration for the production build process.
});