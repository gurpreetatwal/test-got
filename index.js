const got = require('got');
const http = require('http');
const urlParseLax = require('url-parse-lax');

function normalizeArguments(url, opts) {
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

  return Object.assign(
    {
      protocol: 'http:',
      path: '',
      retries: 5
    },
    url,
    opts
  );
}

function Got(url, options) {
  try {
    return got(normalizeArguments(url, opts));
  } catch (err) {
    return Promise.reject(err);
  }
}

const helpers = [
  'get',
  'post',
  'put',
  'patch',
  'head',
  'delete'
];

helpers.forEach(el => {
  Got[el] = (url, opts) => Got(url, Object.assign({}, opts, {method: el}));
});

Got.stream = (url, opts) => Got.stream(normalizeArguments(url, opts));

helpers.forEach(el => {
  Got.stream[el] = (url, opts) => Got.stream(url, Object.assign({}, opts, {method: el}));
});

module.exports = Got;
