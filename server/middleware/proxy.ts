import { createProxyMiddleware } from "http-proxy-middleware";

const proxy = createProxyMiddleware({
  target: "https://vitacube.ch/",
  changeOrigin: true,
  pathRewrite: { "^/api": "" },
});

export default defineEventHandler(async (event) => {
  if (event.path.startsWith("/api")) {
    event.path.replace("/api", "")
    return new Promise<void>((resolve, reject) => {
      proxy(event.node.req, event.node.res, (err) => {
        if (err) {
          console.error(err);
          event.node.res.statusCode = 500;
          event.node.res.end("Proxy error");
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
});
