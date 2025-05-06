// vite.config.mts
import AutoImport from "file:///mnt/e/doanchuyennganh/FE/wsl/v1.1_m%E1%BB%9Biclone/codemate-FE/node_modules/unplugin-auto-import/dist/vite.js";
import Components from "file:///mnt/e/doanchuyennganh/FE/wsl/v1.1_m%E1%BB%9Biclone/codemate-FE/node_modules/unplugin-vue-components/dist/vite.js";
import Fonts from "file:///mnt/e/doanchuyennganh/FE/wsl/v1.1_m%E1%BB%9Biclone/codemate-FE/node_modules/unplugin-fonts/dist/vite.mjs";
import Layouts from "file:///mnt/e/doanchuyennganh/FE/wsl/v1.1_m%E1%BB%9Biclone/codemate-FE/node_modules/vite-plugin-vue-layouts/dist/index.mjs";
import Vue from "file:///mnt/e/doanchuyennganh/FE/wsl/v1.1_m%E1%BB%9Biclone/codemate-FE/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import VueRouter from "file:///mnt/e/doanchuyennganh/FE/wsl/v1.1_m%E1%BB%9Biclone/codemate-FE/node_modules/unplugin-vue-router/dist/vite.js";
import Vuetify, { transformAssetUrls } from "file:///mnt/e/doanchuyennganh/FE/wsl/v1.1_m%E1%BB%9Biclone/codemate-FE/node_modules/vite-plugin-vuetify/dist/index.mjs";
import { defineConfig } from "file:///mnt/e/doanchuyennganh/FE/wsl/v1.1_m%E1%BB%9Biclone/codemate-FE/node_modules/vite/dist/node/index.js";
import { fileURLToPath, URL } from "node:url";
var __vite_injected_original_import_meta_url = "file:///mnt/e/doanchuyennganh/FE/wsl/v1.1_m%E1%BB%9Biclone/codemate-FE/vite.config.mts";
var vite_config_default = defineConfig({
  plugins: [
    VueRouter({
      dts: "src/typed-router.d.ts"
    }),
    Layouts(),
    AutoImport({
      imports: [
        "vue",
        {
          "vue-router/auto": ["useRoute", "useRouter"]
        }
      ],
      dts: "src/auto-imports.d.ts",
      eslintrc: {
        enabled: true
      },
      vueTemplate: true
    }),
    Components({
      dts: "src/components.d.ts"
    }),
    Vue({
      template: { transformAssetUrls }
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true
    }),
    Fonts({
      google: {
        families: [{
          name: "Public Sans",
          styles: "wght@100;300;400;500;700;900"
        }]
      }
    })
  ],
  define: { "process.env": {} },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    },
    extensions: [
      ".js",
      ".json",
      ".jsx",
      ".mjs",
      ".ts",
      ".tsx",
      ".vue"
    ]
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true
  },
  cacheDir: "./.vite"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL21udC9lL2RvYW5jaHV5ZW5uZ2FuaC9GRS93c2wvdjEuMV9tXHUxRURCaWNsb25lL2NvZGVtYXRlLUZFXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvbW50L2UvZG9hbmNodXllbm5nYW5oL0ZFL3dzbC92MS4xX21cdTFFREJpY2xvbmUvY29kZW1hdGUtRkUvdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9tbnQvZS9kb2FuY2h1eWVubmdhbmgvRkUvd3NsL3YxLjFfbSVFMSVCQiU5QmljbG9uZS9jb2RlbWF0ZS1GRS92aXRlLmNvbmZpZy5tdHNcIjsvLyBQbHVnaW5zXHJcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXHJcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnXHJcbmltcG9ydCBGb250cyBmcm9tICd1bnBsdWdpbi1mb250cy92aXRlJ1xyXG5pbXBvcnQgTGF5b3V0cyBmcm9tICd2aXRlLXBsdWdpbi12dWUtbGF5b3V0cydcclxuaW1wb3J0IFZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCBWdWVSb3V0ZXIgZnJvbSAndW5wbHVnaW4tdnVlLXJvdXRlci92aXRlJ1xyXG5pbXBvcnQgVnVldGlmeSwgeyB0cmFuc2Zvcm1Bc3NldFVybHMgfSBmcm9tICd2aXRlLXBsdWdpbi12dWV0aWZ5J1xyXG5cclxuLy8gVXRpbGl0aWVzXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gJ25vZGU6dXJsJ1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICBWdWVSb3V0ZXIoe1xyXG4gICAgICBkdHM6ICdzcmMvdHlwZWQtcm91dGVyLmQudHMnLFxyXG4gICAgfSksXHJcbiAgICBMYXlvdXRzKCksXHJcbiAgICBBdXRvSW1wb3J0KHtcclxuICAgICAgaW1wb3J0czogW1xyXG4gICAgICAgICd2dWUnLFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICd2dWUtcm91dGVyL2F1dG8nOiBbJ3VzZVJvdXRlJywgJ3VzZVJvdXRlciddLFxyXG4gICAgICAgIH1cclxuICAgICAgXSxcclxuICAgICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJyxcclxuICAgICAgZXNsaW50cmM6IHtcclxuICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICB9LFxyXG4gICAgICB2dWVUZW1wbGF0ZTogdHJ1ZSxcclxuICAgIH0pLFxyXG4gICAgQ29tcG9uZW50cyh7XHJcbiAgICAgIGR0czogJ3NyYy9jb21wb25lbnRzLmQudHMnLFxyXG4gICAgfSksXHJcbiAgICBWdWUoe1xyXG4gICAgICB0ZW1wbGF0ZTogeyB0cmFuc2Zvcm1Bc3NldFVybHMgfSxcclxuICAgIH0pLFxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3Z1ZXRpZnlqcy92dWV0aWZ5LWxvYWRlci90cmVlL21hc3Rlci9wYWNrYWdlcy92aXRlLXBsdWdpbiNyZWFkbWVcclxuICAgIFZ1ZXRpZnkoe1xyXG4gICAgICBhdXRvSW1wb3J0OiB0cnVlLFxyXG4gICAgfSksXHJcbiAgICBGb250cyh7XHJcbiAgICAgIGdvb2dsZToge1xyXG4gICAgICAgIGZhbWlsaWVzOiBbIHtcclxuICAgICAgICAgIG5hbWU6ICdQdWJsaWMgU2FucycsXHJcbiAgICAgICAgICBzdHlsZXM6ICd3Z2h0QDEwMDszMDA7NDAwOzUwMDs3MDA7OTAwJyxcclxuICAgICAgICB9XSxcclxuICAgICAgfSxcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgZGVmaW5lOiB7ICdwcm9jZXNzLmVudic6IHt9IH0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICB9LFxyXG4gICAgZXh0ZW5zaW9uczogW1xyXG4gICAgICAnLmpzJyxcclxuICAgICAgJy5qc29uJyxcclxuICAgICAgJy5qc3gnLFxyXG4gICAgICAnLm1qcycsXHJcbiAgICAgICcudHMnLFxyXG4gICAgICAnLnRzeCcsXHJcbiAgICAgICcudnVlJyxcclxuICAgIF0sXHJcbiAgfSxcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBob3N0OiAnMC4wLjAuMCcsXHJcbiAgICAgIHBvcnQ6IDUxNzMsXHJcbiAgICAgIHN0cmljdFBvcnQ6IHRydWVcclxuICAgIH0sXHJcbiAgICBjYWNoZURpcjogJy4vLnZpdGUnLFxyXG59KVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sYUFBYTtBQUNwQixPQUFPLFNBQVM7QUFDaEIsT0FBTyxlQUFlO0FBQ3RCLE9BQU8sV0FBVywwQkFBMEI7QUFHNUMsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxlQUFlLFdBQVc7QUFYb0wsSUFBTSwyQ0FBMkM7QUFjeFEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsVUFBVTtBQUFBLE1BQ1IsS0FBSztBQUFBLElBQ1AsQ0FBQztBQUFBLElBQ0QsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBLE1BQ1QsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsVUFDRSxtQkFBbUIsQ0FBQyxZQUFZLFdBQVc7QUFBQSxRQUM3QztBQUFBLE1BQ0Y7QUFBQSxNQUNBLEtBQUs7QUFBQSxNQUNMLFVBQVU7QUFBQSxRQUNSLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxhQUFhO0FBQUEsSUFDZixDQUFDO0FBQUEsSUFDRCxXQUFXO0FBQUEsTUFDVCxLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQUEsSUFDRCxJQUFJO0FBQUEsTUFDRixVQUFVLEVBQUUsbUJBQW1CO0FBQUEsSUFDakMsQ0FBQztBQUFBO0FBQUEsSUFFRCxRQUFRO0FBQUEsTUFDTixZQUFZO0FBQUEsSUFDZCxDQUFDO0FBQUEsSUFDRCxNQUFNO0FBQUEsTUFDSixRQUFRO0FBQUEsUUFDTixVQUFVLENBQUU7QUFBQSxVQUNWLE1BQU07QUFBQSxVQUNOLFFBQVE7QUFBQSxRQUNWLENBQUM7QUFBQSxNQUNIO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUSxFQUFFLGVBQWUsQ0FBQyxFQUFFO0FBQUEsRUFDNUIsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxjQUFjLElBQUksSUFBSSxTQUFTLHdDQUFlLENBQUM7QUFBQSxJQUN0RDtBQUFBLElBQ0EsWUFBWTtBQUFBLE1BQ1Y7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0UsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2Q7QUFBQSxFQUNBLFVBQVU7QUFDZCxDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
