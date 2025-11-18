import {
  AdapterNotFoundError,
  CanvasNotFoundError,
  ContextInitFailedError,
  DeviceRequestFailedError,
  WebGPUUnavailableError,
} from "./errors";
import * as logger from "./logger";

async function main() {
  logger.debug("Starting WebGPU initialization");

  const canvas = document.getElementById("webgpu-canvas") as HTMLCanvasElement | null;
  if (!canvas) throw new CanvasNotFoundError();

  logger.debug("Canvas found", { width: canvas.width, height: canvas.height });

  if (!("gpu" in navigator)) throw new WebGPUUnavailableError();

  logger.debug("WebGPU is available in navigator");

  logger.debug("Requesting GPU adapter");
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new AdapterNotFoundError();

  logger.debug("GPU adapter obtained");

  let device: GPUDevice;
  try {
    logger.debug("Requesting GPU device");
    device = await adapter.requestDevice();
  } catch (error) {
    throw new DeviceRequestFailedError(error);
  }
  logger.debug("GPU device obtained");

  // 3. Configure the canvas context
  logger.debug("Getting WebGPU canvas context");
  const context = canvas.getContext("webgpu") as GPUCanvasContext | null;
  if (!context) {
    throw new ContextInitFailedError();
  }

  // TypeScript now knows context is non-null after the check
  const gpuContext: GPUCanvasContext = context;

  const format = navigator.gpu.getPreferredCanvasFormat();
  logger.debug("Configuring canvas context", { format, alphaMode: "premultiplied" });
  gpuContext.configure({
    device,
    format,
    alphaMode: "premultiplied",
  });
  logger.debug("Canvas context configured successfully");

  // 4. Render loop: just clear the screen to a color
  logger.debug("Starting render loop");
  function frame() {
    try {
      const textureView = gpuContext.getCurrentTexture().createView();

      const commandEncoder = device.createCommandEncoder();
      const pass = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: textureView,
            clearValue: { r: 0.1, g: 0.2, b: 0.35, a: 1.0 }, // bluish
            loadOp: "clear",
            storeOp: "store",
          },
        ],
      });

      pass.end();

      const commandBuffer = commandEncoder.finish();
      device.queue.submit([commandBuffer]);

      requestAnimationFrame(frame);
    } catch (error) {
      logger.error(error instanceof Error ? error : new Error(String(error)), {
        phase: "render_frame",
      });
      // Optionally stop the render loop on error
      // Or continue and log the error
    }
  }

  requestAnimationFrame(frame);
  logger.debug("Initialization complete, render loop started");
}

main().catch((err) => {
  logger.error(err instanceof Error ? err : new Error(String(err)), {
    phase: "main_initialization",
  });
});
