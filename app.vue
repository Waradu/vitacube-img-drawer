<template>
  <div class="page">
    <div class="tools">
      <input type="file" @change="handleFileUpload" />
      <input type="text" name="x" id="x" placeholder="x" v-model="img.x" />
      <input type="text" name="y" id="y" placeholder="y" v-model="img.y" />
      <input
        type="text"
        name="color"
        id="color"
        placeholder="color"
        v-model="img.color"
      />
      <button @click="draw" class="drawimg">Draw Image</button>
    </div>
    <div class="container">
      <canvas :width="80 * size" :height="32 * size" ref="canvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $draw } = useNuxtApp();

const img = ref({
  x: "0",
  y: "0",
  color: "#ff6666",
  img: null as ImageData | null,
});

const canvas = ref<HTMLCanvasElement | null>(null);
const size = 10;
const data = ref(null);

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files ? target.files[0] : null;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string;
      const canva = document.createElement("canvas");
      const nimg = new Image();
      nimg.onload = () => {
        if (canva) {
          const context = canva.getContext("2d");
          if (context) {
            canva.width = nimg.width;
            canva.height = nimg.height;
            context.drawImage(nimg, 0, 0);
            img.value.img = context.getImageData(0, 0, nimg.width, nimg.height);
          }
        }
      };
      nimg.src = result;
    };
    reader.readAsDataURL(file);
  }
};

const draw = async () => {
  if (!img.value.img) return;

  await extractColors(
    img.value.img,
    parseInt(img.value.x),
    parseInt(img.value.y)
  );

  const res = await fetch("/api/wp-json/pixelgrid/v1/getGrid");

  data.value = await res.json();

  if (data.value) {
    drawColors(data.value);
  }
};

const extractColors = async (
  imageData: ImageData,
  hOffset: number,
  vOffset: number
) => {
  const { data, width, height } = imageData;

  const res = await fetch("/api/wp-json/pixelgrid/v1/getGrid");

  const img_data = await res.json();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];

      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b)
        .toString(16)
        .slice(1)
        .toUpperCase()}`;

      const i = y * 80 + x;

      if (img_data[i] != hex && !(img_data[i] == "null" && a == 0)) {
        console.log(x, y);
        await $draw.pixel(x + hOffset, y + vOffset, a == 0 ? "null" : hex);
      }
    }
  }
};

onMounted(async () => {
  const res = await fetch("/api/wp-json/pixelgrid/v1/getGrid");

  data.value = await res.json();

  if (data.value) {
    drawColors(data.value);
  }

  setInterval(async () => {
    const res = await fetch("/api/wp-json/pixelgrid/v1/getGrid");

    data.value = await res.json();

    if (data.value) {
      drawColors(data.value);
    }
  }, 5000);
});

const drawColors = (colors: { [key: string]: string | null }) => {
  if (!canvas.value) return;

  const ctx = canvas.value.getContext("2d");
  if (!ctx) return;

  const columns = 80;
  const cellWidth = 1 * size;
  const cellHeight = 1 * size;

  Object.keys(colors).forEach((key, index) => {
    const color = colors[key];
    const x = (index % columns) * cellWidth;
    const y = Math.floor(index / columns) * cellHeight;
    if (color && color != "null") {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, cellWidth, cellHeight);
    } else {
      ctx.clearRect(x, y, cellWidth, cellHeight);
    }
  });
};
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#__nuxt {
  width: 100%;
  height: 100%;
  background-color: #0c0c0c;
  padding: 10px;
  display: flex;
  justify-content: center;
  color: white;
  font-family: sans-serif;
}

.page {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1000px;

  .tools {
    display: flex;
    gap: 10px;
    align-items: center;
    width: 100%;

    button,
    input {
      background-color: #222;
      border: none;
      outline: none;
      height: 30px;
      display: flex;
      align-items: center;
      padding: 4px;
      color: white;
      border-radius: 4px;
      padding-inline: 20px;
      transition: 0.2s;
      width: 100%;
      justify-content: center;

      &:hover {
        background-color: #333;
      }
    }
  }
}

.container {
  background-image: radial-gradient(#777, #111);
  padding: 10px;
  width: 100%;
  height: max-content;
  border-radius: 18px;
  border: 1px solid #ffffff20;
  display: block;

  canvas {
    border-radius: 8px;
    image-rendering: pixelated;
    width: 100%;
    overflow: hidden;
    border: 1px solid #ffffff40;
    box-shadow: 0 0 10px #00000080;
    width: 100%;
    display: block;
  }
}
</style>
