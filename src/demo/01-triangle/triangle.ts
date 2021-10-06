import vertShaderCode from './shaders/triangle.vert.wgsl';
import fragShaderCode from './shaders/triangle.frag.wgsl';
import { createBuffer, createContext, resize } from '../../common/helpers';

export default {
  name: 'triangle',
  start: async (container: HTMLElement) => {
    const ctx = await createContext(container);

    const indices = new Uint16Array([0, 1, 2]);

    // 📈 Position Vertex Buffer Data
    // prettier-ignore
    const positions = new Float32Array([
      1.0, -1.0, 0.0,
      -1.0, -1.0, 0.0,
      0.0, 1.0, 0.0,
    ]);

    // prettier-ignore
    const colors = new Float32Array([
      1.0, 0.0, 0.0, // 🔴
      0.0, 1.0, 0.0, // 🟢
      0.0, 0.0, 1.0, // 🔵
    ]);

    // prettier-ignore
    const uniformData = new Float32Array([
      // ♟️ ModelViewProjection Matrix (Identity)
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0,

      // 🔴 Primary Color
      0.9, 0.1, 0.3, 1.0,

      // 🟣 Accent Color
      0.8, 0.2, 0.8, 1.0,
    ]);

    const positionBuffer = createBuffer(ctx, positions, GPUBufferUsage.VERTEX);
    const colorBuffer = createBuffer(ctx, colors, GPUBufferUsage.VERTEX);
    const indexBuffer = createBuffer(ctx, indices, GPUBufferUsage.INDEX);
    const uniformBuffer = createBuffer(
      ctx,
      uniformData,
      GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    );

    //

    const uniformBindGroupLayout = ctx.device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: 'uniform' },
        },
      ],
    });

    const uniformBindGroup = ctx.device.createBindGroup({
      layout: uniformBindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: {
            buffer: uniformBuffer,
          },
        },
      ],
    });

    const layout = ctx.device.createPipelineLayout({
      bindGroupLayouts: [uniformBindGroupLayout],
    });

    const vertModule = ctx.device.createShaderModule({ code: vertShaderCode });
    const fragModule = ctx.device.createShaderModule({ code: fragShaderCode });

    const pipeline = ctx.device.createRenderPipeline({
      layout,
      vertex: {
        module: vertModule,
        entryPoint: 'main',
        buffers: [
          {
            attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }],
            arrayStride: 4 * 3,
            stepMode: 'vertex',
          },
          {
            attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x3' }],
            arrayStride: 4 * 3,
            stepMode: 'vertex',
          },
        ],
      },
      fragment: {
        module: fragModule,
        entryPoint: 'main',
        targets: [
          {
            format: 'bgra8unorm',
          },
        ],
      },
      primitive: {
        frontFace: 'cw',
        cullMode: 'none',
        topology: 'triangle-list',
      },
      multisample: {
        count: ctx.sampleCount,
      },
    });

    const render = () => {
      resize(ctx);

      const commandEncoder = ctx.device.createCommandEncoder();
      const passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: ctx.renderTargetView,
            resolveTarget: ctx.context.getCurrentTexture().createView(),
            loadValue: { r: 0, g: 0, b: 0, a: 1 },
            storeOp: 'store',
          },
        ],
      });

      passEncoder.setPipeline(pipeline);
      passEncoder.setVertexBuffer(0, positionBuffer);
      passEncoder.setVertexBuffer(1, colorBuffer);
      passEncoder.setBindGroup(0, uniformBindGroup);
      passEncoder.setIndexBuffer(indexBuffer, 'uint16');
      passEncoder.drawIndexed(3);
      passEncoder.endPass();

      ctx.device.queue.submit([commandEncoder.finish()]);

      requestAnimationFrame(render);
    };

    render();
  },
};
