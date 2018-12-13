module.exports = isExternalLink

function isExternalLink (obj) {
  return Boolean(obj['/'])
}