const academicRules = require('./academicRules');

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: 'SIA-SA FST',
  university: 'UIN Syarif Hidayatullah Jakarta',
  faculty: 'Fakultas Sains dan Teknologi',
  rules: academicRules
};
