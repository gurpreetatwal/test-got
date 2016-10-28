const got = require('got');
const http = require('http');
const https = require('https');
const urlParseLax = require('url-parse-lax');

function getPort(arg) {
  const isSever = arg instanceof http.Server || arg instanceof https.Server;
  const server = isSever ? arg : http.createServer(arg);

  if (!server.listening) {
    server.listen(0);
  }

  return server.address().port;
}

function normalizeArgs(url, options) {
  if (typeof url !== 'string' && typeof url !== 'object') {
    throw new Error(`Parameter \`url\` must be a string or object, not ${typeof url}`);
  }

  if (typeof url === 'string') {
    url = url.replace(/^unix:/, 'http://$&');
    url = urlParseLax(url);

    if (url.auth) {
      throw new Error('Basic authentication must be done with auth option');
    }
  }

  return Object.assign({
    protocol: 'http:',
    path: '',
    retries: 5
  }, url, opts);
}

module.exports = function request(arg) {

  const port = getPort(arg);

  function mergeDefault(url, options) {
    return Object.assign({
      hostname: '127.0.0.1',
      port: port,
    }, normalizeArgs(url, options));
  }

  function Got(url, options) {
    try {
      return got(mergeDefault(url, options));
    } catch (err) {
      return Promise.reject(err);
    }
  }

  Got.stream = function(url, options) {
    return got.stream(mergeDefault(url, options));
  };

  const helpers = [
    'get',
    'post',
    'put',
    'patch',
    'head',
    'delete',
  ];

  helpers.forEach(el => {
    const setMethod = opts => Object.assign({}, opts, {method: el});

    Got[el] = (url, opts) => Got(url, setMethod(opts));
    Got.stream[el] = (url, opts) => Got.stream(url, setMethod(opts));
  });

  return Got;
}
