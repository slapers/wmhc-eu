/**
 * Bootstrap harp and process port info from environment
 */
var harp = require('harp');

harp.server(
  __dirname,
  { port: process.env.PORT || 9000 }
);
