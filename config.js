const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "142.132.248.161"
    ? "http://localhost:14400"
    : "https://autodiscover.3470healthcare.net";


//   module.exports = {
//   apps: [{
//     name: "api",
//     script: "server.js",
//     instances: "max",
//     exec_mode: "cluster",
//     env: {
//       NODE_ENV: "production"
//     }
//   }]
// }
