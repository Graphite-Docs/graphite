'use strict';
const got = require('got');

const apiBase = 'https://content.dropboxapi.com/2';
const api = {
  base: apiBase,
  download: apiBase + '/files/download',
  upload: apiBase + '/files/upload',
  uploadStart: apiBase + '/files/upload_session/start',
  uploadAppend: apiBase + '/files/upload_session/append_v2',
  uploadFinish: apiBase + '/files/upload_session/finish'
}

const charsToEncode = /[\u007f-\uffff]/g;
const saveJsonStringify = obj => JSON
  .stringify(obj)
  .replace(charsToEncode, c => '\\u' + (
    '000' + c.charCodeAt(0).toString(16)
  ).slice(-4));

const safeJsonParse = function(data) {
  if (!data) {
    return;
  }

  try {
    const parsedData = JSON.parse(data);
    return parsedData;
  } catch (e) {
    return new Error(`Response parsing failed: ${e.message}`);
  }
}

const parseResponse = function(cb, isDownload) {
  return res => {
    const statusCode = res.statusCode;

    if (statusCode !== 200) {
      res.resume();
      return cb(new Error(`Request Failed.\nStatus Code: ${statusCode}`));
    }

    if (isDownload) {
      const rawData = res.headers['dropbox-api-result'];
      const parsedData = safeJsonParse(rawData);

      if (parsedData instanceof Error) {
        cb(parsedData);
      } else {
        cb(null, parsedData);
      }

      return;
    }

    const contentType = res.headers['content-type'];
    if (!isDownload && !/^application\/json/.test(contentType)) {
      res.resume();
      return cb(new Error(`Invalid content-type.\nExpected application/json but received ${contentType}`));
    }

    res.setEncoding('utf8');
    let rawData = '';
    res.on('data', chunk => {
      rawData += chunk
    });
    res.on('end', () => {
      const parsedData = safeJsonParse(rawData);

      if (parsedData instanceof Error) {
        cb(parsedData);
      } else {
        cb(null, parsedData);
      }
    });
  }
}

module.exports = function(opts, cb) {
  let headers = {
    'Authorization': 'Bearer ' + opts.token
  };

  if (opts.call !== 'download') {
    headers['Content-Type'] = 'application/octet-stream';
  }

  if (opts.args) {
    headers['Dropbox-API-Arg'] = saveJsonStringify(opts.args);
  }

  const req = got.stream.post(api[opts.call], {
    headers: headers
  });

  req.on('error', cb);
  req.on('response', parseResponse(cb, opts.call === 'download'));
  req.end(opts.data);
  return req;
};
