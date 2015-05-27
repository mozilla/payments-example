module.exports = {
  nodedeps: {
    files: [{
      cwd: 'node_modules/moz-payments-client/dist',
      expand: true,
      src: 'payments-client.js',
      dest: 'public/lib/js',
    }, {
      cwd: 'node_modules/jquery/dist',
      expand: true,
      src: 'jquery.min.js',
      dest: 'public/lib/js',
    }, {
      cwd: 'bower_components/fxa-relier-client/',
      expand: true,
      src: 'fxa-relier-client.min.js',
      dest: 'public/lib/js',
    }],
  },
};
