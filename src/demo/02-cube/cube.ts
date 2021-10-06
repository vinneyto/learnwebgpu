import vertShaderCode from './shaders/cube.vert.wgsl';
import fragShaderCode from './shaders/cube.frag.wgsl';
import {
  createBuffer,
  createContext,
  createDemoModelMatrix,
  createProjectionMatrix,
  resize,
} from '../../common/helpers';

import { cube } from 'primitive-geometry';
import { Context } from '../../common/Context';
import { mat4 } from 'gl-matrix';

export default {
  name: 'cube',
  start: async (container: HTMLElement) => {
    const ctx = await createContext(container);

    const { positions, uvs, cells } = cube();

    const positionBuffer = createBuffer(ctx, positions, GPUBufferUsage.VERTEX);
    const uvBuffer = createBuffer(ctx, uvs, GPUBufferUsage.VERTEX);
    const indexBuffer = createBuffer(
      ctx,
      new Uint16Array(cells),
      GPUBufferUsage.INDEX
    );

    const pipeline = ctx.device.createRenderPipeline({
      vertex: {
        module: ctx.device.createShaderModule({
          code: vertShaderCode,
        }),
        entryPoint: 'main',
        buffers: [
          {
            arrayStride: 4 * 3,
            attributes: [
              {
                // position
                shaderLocation: 0,
                offset: 0,
                format: 'float32x3',
              },
            ],
          },
          {
            arrayStride: 4 * 2,
            attributes: [
              {
                // uv
                shaderLocation: 1,
                offset: 0,
                format: 'float32x2',
              },
            ],
          },
        ],
      },
      fragment: {
        module: ctx.device.createShaderModule({
          code: fragShaderCode,
        }),
        entryPoint: 'main',
        targets: [
          {
            format: ctx.presentationFormat,
          },
        ],
      },
      primitive: {
        topology: 'triangle-list',
        cullMode: 'back',
        frontFace: 'ccw',
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus',
      },
      multisample: {
        count: ctx.sampleCount,
      },
    });

    const uniformBuffer = ctx.device.createBuffer({
      size: 4 * 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const uniformBindGroup = ctx.device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: uniformBuffer,
          },
        },
      ],
    });

    const render = () => {
      resize(ctx);

      const mvp = createMVPMatrix(ctx);

      ctx.queue.writeBuffer(
        uniformBuffer,
        0,
        mvp.buffer,
        mvp.byteOffset,
        mvp.byteLength
      );

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
        depthStencilAttachment: {
          view: ctx.depthTextureView,
          depthLoadValue: 1.0,
          depthStoreOp: 'store',
          stencilLoadValue: 0,
          stencilStoreOp: 'store',
        },
      });

      passEncoder.setPipeline(pipeline);
      passEncoder.setBindGroup(0, uniformBindGroup);
      passEncoder.setVertexBuffer(0, positionBuffer);
      passEncoder.setVertexBuffer(1, uvBuffer);
      passEncoder.setIndexBuffer(indexBuffer, 'uint16');
      passEncoder.drawIndexed(cells.length);
      passEncoder.endPass();

      ctx.device.queue.submit([commandEncoder.finish()]);

      requestAnimationFrame(render);
    };

    requestAnimationFrame(render);
  },
};

function createMVPMatrix(ctx: Context) {
  const projection = createProjectionMatrix(ctx);
  const modelView = createDemoModelMatrix();

  const mvp = mat4.create();
  mat4.multiply(mvp, projection, modelView);

  return mvp as Float32Array;
}
