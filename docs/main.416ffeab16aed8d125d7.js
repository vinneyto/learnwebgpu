'use strict';
(self.webpackChunk = self.webpackChunk || []).push([
  [179],
  {
    857: (e, t, n) => {
      n.r(t), n.d(t, { default: () => a });
      const a =
        '[[stage(fragment)]]\nfn main([[location(0)]] inColor: vec3<f32>) -> [[location(0)]] vec4<f32> {\n    return vec4<f32>(inColor, 1.0);\n}\n';
    },
    250: (e, t, n) => {
      n.r(t), n.d(t, { default: () => a });
      const a =
        'struct VSOut {\n    [[builtin(position)]] Position: vec4<f32>;\n    [[location(0)]] color: vec3<f32>;\n};\n\n[[block]] struct UBO {\n  modelViewProj: mat4x4<f32>;\n  primaryColor: vec4<f32>;\n  accentColor: vec4<f32>;\n};\n\n[[binding(0), group(0)]] var<uniform> uniforms: UBO;\n\n[[stage(vertex)]]\nfn main([[location(0)]] inPos: vec3<f32>,\n        [[location(1)]] inColor: vec3<f32>) -> VSOut {\n    var vsOut: VSOut;\n    vsOut.Position = uniforms.modelViewProj * vec4<f32>(inPos, 1.0);\n    vsOut.color = inColor;\n    return vsOut;\n}\n';
    },
    803: function (e, t, n) {
      var a =
        (this && this.__importDefault) ||
        function (e) {
          return e && e.__esModule ? e : { default: e };
        };
      Object.defineProperty(t, '__esModule', { value: !0 });
      const o = a(n(250)),
        r = a(n(857));
      t.default = {
        name: 'webgpu-demo',
        start: async (e) => {
          const t = new i();
          await t.initDevice(e), await t.setupRendering(), console.log(t);
        },
      };
      class i {
        device;
        canvas;
        ctx;
        async initDevice(e) {
          const t = navigator.gpu;
          if (!t) throw new Error('WebGPU is not supported on this browser.');
          const n = await t.requestAdapter();
          if (null === n) throw new Error('unable to get adapter');
          const a = await n.requestDevice(),
            o = document.createElement('canvas');
          (o.style.position = 'absolute'), e.appendChild(o);
          const r = o.getContext('webgpu');
          if (null === r) throw new Error('unable to get gpu context');
          (this.canvas = o), (this.ctx = r), this.resizeCanvas(e);
          const i = {
            device: a,
            format: 'bgra8unorm',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
            size: [o.width, o.height],
          };
          r.configure(i), (this.device = a);
        }
        async setupRendering() {
          const { device: e, ctx: t } = this,
            n = t.getCurrentTexture().createView(),
            a = new Float32Array([1, -1, 0, -1, -1, 0, 0, 1, 0]);
          for (let e = 0; e < a.length; e++) a[e] = 0.5 * a[e];
          const i = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]),
            s = new Uint16Array([0, 1, 2]),
            l = this.createBuffer(a, GPUBufferUsage.VERTEX),
            d = this.createBuffer(i, GPUBufferUsage.VERTEX),
            c = this.createBuffer(s, GPUBufferUsage.INDEX),
            u = e.createShaderModule({ code: o.default }),
            f = e.createShaderModule({ code: r.default }),
            h = new Float32Array([
              1,
              0,
              0,
              0,
              0,
              1,
              0,
              0,
              0,
              0,
              1,
              0,
              0,
              0,
              0,
              1,
              0.9,
              0.1,
              0.3,
              1,
              0.8,
              0.2,
              0.8,
              1,
            ]),
            p = this.createBuffer(
              h,
              GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            ),
            m = e.createBindGroupLayout({
              entries: [
                {
                  binding: 0,
                  visibility: GPUShaderStage.VERTEX,
                  buffer: { type: 'uniform' },
                },
              ],
            }),
            g = e.createBindGroup({
              layout: m,
              entries: [{ binding: 0, resource: { buffer: p } }],
            }),
            v = { bindGroupLayouts: [m] },
            b = {
              layout: this.device.createPipelineLayout(v),
              vertex: {
                module: u,
                entryPoint: 'main',
                buffers: [
                  {
                    attributes: [
                      { shaderLocation: 0, offset: 0, format: 'float32x3' },
                    ],
                    arrayStride: 12,
                    stepMode: 'vertex',
                  },
                  {
                    attributes: [
                      { shaderLocation: 1, offset: 0, format: 'float32x3' },
                    ],
                    arrayStride: 12,
                    stepMode: 'vertex',
                  },
                ],
              },
              fragment: {
                module: f,
                entryPoint: 'main',
                targets: [{ format: 'bgra8unorm' }],
              },
              primitive: {
                frontFace: 'cw',
                cullMode: 'none',
                topology: 'triangle-list',
              },
            },
            y = e.createRenderPipeline(b);
          (() => {
            const t = {
                colorAttachments: [
                  {
                    view: n,
                    loadValue: { r: 0, g: 0, b: 0, a: 1 },
                    storeOp: 'store',
                  },
                ],
              },
              a = e.createCommandEncoder(),
              o = a.beginRenderPass(t);
            o.setPipeline(y),
              o.setVertexBuffer(0, l),
              o.setVertexBuffer(1, d),
              o.setBindGroup(0, g),
              o.setIndexBuffer(c, 'uint16'),
              o.drawIndexed(3),
              o.endPass(),
              e.queue.submit([a.finish()]);
          })();
        }
        createBuffer(e, t) {
          const { device: n } = this,
            a = n.createBuffer({
              size: (e.byteLength + 3) & -4,
              usage: t,
              mappedAtCreation: !0,
            });
          return (
            (e instanceof Uint16Array
              ? new Uint16Array(a.getMappedRange())
              : new Float32Array(a.getMappedRange())
            ).set(e),
            a.unmap(),
            a
          );
        }
        resizeCanvas = (e) => {
          const { canvas: t } = this;
          (t.style.width = `${e.offsetWidth}px`),
            (t.style.height = `${e.offsetHeight}px`),
            (t.width = e.offsetWidth * devicePixelRatio),
            (t.height = e.offsetHeight * devicePixelRatio);
        };
      }
    },
    323: function (e, t, n) {
      var a =
        (this && this.__importDefault) ||
        function (e) {
          return e && e.__esModule ? e : { default: e };
        };
      Object.defineProperty(t, '__esModule', { value: !0 });
      const o = a(n(51)),
        r = a(n(79)),
        i = a(n(803)),
        s = a(n(280)),
        l = n(796);
      o.default.setup((0, r.default)()),
        o.default.createStyleSheet(s.default).attach();
      const { classes: d } = o.default.createStyleSheet(l.styles).attach(),
        c = [i.default],
        u = document.createElement('div');
      (u.className = d.wrapper), document.body.appendChild(u);
      const f = document.createElement('div');
      (f.className = d.demoList), u.appendChild(f);
      for (const e of c) {
        const t = document.createElement('a');
        (t.href = `/#${e.name}`),
          (t.innerHTML = e.name),
          t.classList.add(d.link),
          e.name === location.hash.trim().substr(1) &&
            t.classList.add(d.linkActive),
          f.appendChild(t);
      }
      const h = document.createElement('div');
      if (
        ((h.className = d.container),
        u.appendChild(h),
        0 !== location.hash.trim().length)
      )
        (async () => {
          try {
            const e = location.hash.substr(1),
              t = c.find((t) => t.name === e);
            if (void 0 === t) throw new Error('unable to find the demo');
            await t.start(h);
          } catch (e) {
            const t = document.createElement('div');
            (t.innerHTML = e.message), (t.className = d.err), h.appendChild(t);
          }
        })();
      else {
        const e = document.createElement('div');
        (e.innerHTML = '◄ Select demo from list'),
          (e.className = d.hint),
          h.appendChild(e);
      }
      window.onhashchange = () => {
        location.reload();
      };
    },
    280: (e, t) => {
      Object.defineProperty(t, '__esModule', { value: !0 }),
        (t.default = {
          '@global': {
            'html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video': {
              margin: '0',
              padding: '0',
              border: '0',
              fontSize: '100%',
              font: 'inherit',
              verticalAlign: 'baseline',
            },
            'article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section': {
              display: 'block',
            },
            body: { lineHeight: 1 },
            'ol, ul': { listStyle: 'none' },
            'blockquote, q': { quotes: 'none' },
            'blockquote:before, blockquote:after, q:before, q:after': {
              content: 'none',
            },
            table: { borderCollapse: 'collapse', borderSpacing: 0 },
          },
        });
    },
    796: (e, t) => {
      Object.defineProperty(t, '__esModule', { value: !0 }),
        (t.styles = void 0),
        (t.styles = {
          '@global': {
            'html, body': {
              width: '100%',
              height: '100%',
              'font-family': 'Geneva, Verdana, sans-serif',
              fontSize: 16,
            },
          },
          wrapper: {
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: '300px 1fr',
          },
          demoList: { overflow: 'auto', borderRight: '1px solid #eee' },
          hint: { padding: 16, color: '#060' },
          err: { padding: 16, color: '#600' },
          container: { position: 'relative' },
          link: {
            display: 'block',
            padding: 16,
            textDecoration: 'underlined',
            '&:hover': { backgroundColor: '#f5f5f5' },
            '&, &:visited, &:hover, &:active': { color: '#089' },
          },
          linkActive: { '&, &:visited, &:hover, &:active': { color: '#600' } },
        });
    },
  },
  (e) => {
    e.O(0, [79], () => (323, e((e.s = 323)))), e.O();
  },
]);
