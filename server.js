const app = require('./src/app');
const config = require('./src/config');

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`   SIA-SA FST • Sistem Request Semester Antara Terpusat`);
  console.log(`   Fakultas Sains dan Teknologi • UIN Syarif Hidayatullah Jakarta`);
  console.log(`================================================================`);
  console.log(`🚀 Server aktif & berjalan di: http://localhost:${PORT}`);
  console.log(`📡 API Base URL             : http://localhost:${PORT}/api`);
  console.log(`🌐 Antarmuka Web Localhost  : http://localhost:${PORT}`);
  console.log(`================================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
