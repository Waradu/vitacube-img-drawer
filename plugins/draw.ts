export default defineNuxtPlugin((nuxtApp) => {
  const draw = {
    async pixel(x: number, y: number, color: string) {
      const index = y * 80 + x;

      const options = {
        method: "POST",
        body: new URLSearchParams({ index: index.toString(), color: color }),
      };

      try {
        const res = await fetch(
          "/api/wp-json/pixelgrid/v1/updatePixel",
          options
        );
        console.log(await res.json());
      } catch (error) {
        console.error(error);
      }
    },
  };

  return {
    provide: {
      draw,
    },
  };
});
