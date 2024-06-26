const canvas = ref<HTMLCanvasElement | null>(null);
const state = reactive({
  horizontalOffset: 0,
  verticalOffset: 0,
  canvasWidth: 0,
  canvasHeight: 0,
});

var imageData: ImageData | null = null;

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files ? target.files[0] : null;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const result = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        if (canvas.value) {
          const context = canvas.value.getContext("2d");
          if (context) {
            canvas.value.width = img.width;
            canvas.value.height = img.height;
            state.canvasWidth = img.width;
            state.canvasHeight = img.height;
            context.drawImage(img, 0, 0);
            imageData = context.getImageData(0, 0, img.width, img.height);
          }
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }
};

const draw = () => {
  if (!imageData) return;
  extractColors(imageData, state.horizontalOffset, state.verticalOffset);
};

const extractColors = (
  imageData: ImageData,
  hOffset: number,
  vOffset: number
) => {
  const { data, width, height } = imageData;
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

      console.log(
        `Pixel at (${x + parseInt(hOffset.toString())}, ${
          y + parseInt(vOffset.toString())
        }): ${hex}`
      );
    }
  }
};