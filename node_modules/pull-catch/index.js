module.exports = function Catch (onError) {
    onError = onError || function noop () {}
    var errd
    return function sink (read) {
        return function source (abort, cb) {
            read(abort, function onNext (end, data) {
                if (errd) return cb(true)
                if (end && end !== true) {  // if error
                    var _end = onError(end)
                    if (_end === false) return cb(end)
                    if (_end && _end !== true) {
                        errd = true
                        return cb(null, _end)
                    }
                    return cb(true)
                }
                cb(end, data)
            })
        }
    }
}
