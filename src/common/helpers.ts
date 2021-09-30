import { Context } from './Context';

export async function createContext(container: HTMLElement): Promise<Context> {
  const entry = navigator.gpu;
  if (!entry) {
    throw new Error('WebGPU is not supported on this browser.');
  }

  const adapter = await entry.requestAdapter();
  if (adapter === null) {
    throw new Error('unable to get adapter');
  }

  const device = await adapter.requestDevice();

  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.left = '0';
  canvas.style.top = '0';
  container.appendChild(canvas);

  const context = canvas.getContext('webgpu');
  if (context === null) {
    throw new Error('unable to get gpu context');
  }

  const width = container.clientWidth * devicePixelRatio;
  const height = container.clientHeight * devicePixelRatio;
  const presentationFormat = context.getPreferredFormat(adapter);
  const presentationSize = [width, height];

  canvas.style.width = `${container.offsetWidth}px`;
  canvas.style.height = `${container.offsetHeight}px`;

  canvas.width = width;
  canvas.height = height;

  context.configure({
    device,
    format: presentationFormat,
    size: presentationSize,
  });

  const sampleCount = 4;

  const renderTarget = device.createTexture({
    size: presentationSize,
    sampleCount,
    format: presentationFormat,
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const renderTargetView = renderTarget.createView();

  return {
    canvas,
    container,
    adapter,
    device,
    context,
    queue: device.queue,
    presentationFormat,
    renderTarget,
    renderTargetView,
    sampleCount,
    width,
    height,
  };
}

export function resize(ctx: Context) {
  const {
    container,
    width,
    height,
    canvas,
    presentationFormat,
    device,
    context,
  } = ctx;
  const newWidth = container.clientWidth * devicePixelRatio;
  const newHeight = container.clientHeight * devicePixelRatio;

  if (newWidth !== width || newHeight !== height) {
    ctx.renderTarget.destroy();

    canvas.style.width = `${container.offsetWidth}px`;
    canvas.style.height = `${container.offsetHeight}px`;

    canvas.width = newWidth;
    canvas.height = newWidth;

    ctx.width = newWidth;
    ctx.height = newHeight;

    const presentationSize = [newWidth, newHeight];

    context.configure({
      device,
      format: presentationFormat,
      size: presentationSize,
    });

    ctx.renderTarget = device.createTexture({
      size: presentationSize,
      sampleCount: ctx.sampleCount,
      format: presentationFormat,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    ctx.renderTargetView = ctx.renderTarget.createView();
  }
}

export function createBuffer(
  { device }: Context,
  arr: Float32Array | Uint16Array,
  usage: number
) {
  const buffer = device.createBuffer({
    size: (arr.byteLength + 3) & ~3,
    usage,
    mappedAtCreation: true,
  });

  const writeArray =
    arr instanceof Uint16Array
      ? new Uint16Array(buffer.getMappedRange())
      : new Float32Array(buffer.getMappedRange());

  writeArray.set(arr);
  buffer.unmap();
  return buffer;
}
