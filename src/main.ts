// src/main.ts

async function main() {
  const canvas = document.getElementById("webgpu-canvas") as HTMLCanvasElement | null;
  if (!canvas) {
    console.error("Canvas not found");
    return;
  }

  // 1. Check WebGPU support
  if (!("gpu" in navigator)) {
    console.error("WebGPU not supported in this browser.");
    return;
  }

  // 2. Get adapter + device
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.error("No GPU adapter found.");
    return;
  }

  const device = await adapter.requestDevice();

  // 3. Configure the canvas context
  const context = canvas.getContext("webgpu") as GPUCanvasContext | null;
  if (!context) {
    console.error("Failed to get WebGPU context.");
    return;
  }

  // TypeScript now knows context is non-null after the check
  const gpuContext: GPUCanvasContext = context;

  const format = navigator.gpu.getPreferredCanvasFormat();
  gpuContext.configure({
    device,
    format,
    alphaMode: "premultiplied",
  });

  // 4. Render loop: just clear the screen to a color
  function frame() {
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
  }

  requestAnimationFrame(frame);
}

main().catch((err) => {
  console.error(err);
});
