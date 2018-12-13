/* global self */

// created by @HenrikJoreteg
var prefix
var version

if (self.mozRTCPeerConnection || navigator.mozGetUserMedia) {
  prefix = 'moz'
  version = parseInt(navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1], 10)
} else if (self.webkitRTCPeerConnection || navigator.webkitGetUserMedia) {
  prefix = 'webkit'
  version = navigator.userAgent.match(/Chrom(e|ium)/) && parseInt(navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)[2], 10)
}

var PC = self.RTCPeerConnection || self.mozRTCPeerConnection || self.webkitRTCPeerConnection
var IceCandidate = self.mozRTCIceCandidate || self.RTCIceCandidate
var SessionDescription = self.mozRTCSessionDescription || self.RTCSessionDescription
var MediaStream = self.webkitMediaStream || self.MediaStream
var screenSharing = self.location.protocol === 'https:' &&
    ((prefix === 'webkit' && version >= 26) ||
     (prefix === 'moz' && version >= 33))
var AudioContext = self.AudioContext || self.webkitAudioContext
var videoEl = self.document && document.createElement('video')
var supportVp8 = videoEl && videoEl.canPlayType && videoEl.canPlayType('video/webm; codecs="vp8", vorbis') === 'probably'
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.mozGetUserMedia

// export support flags and constructors.prototype && PC
module.exports = {
  prefix: prefix,
  browserVersion: version,
  support: !!PC && !!getUserMedia,
    // new support style
  supportRTCPeerConnection: !!PC,
  supportVp8: supportVp8,
  supportGetUserMedia: !!getUserMedia,
  supportDataChannel: !!(PC && PC.prototype && PC.prototype.createDataChannel),
  supportWebAudio: !!(AudioContext && AudioContext.prototype.createMediaStreamSource),
  supportMediaStream: !!(MediaStream && MediaStream.prototype.removeTrack),
  supportScreenSharing: !!screenSharing,
    // constructors
  AudioContext: AudioContext,
  PeerConnection: PC,
  SessionDescription: SessionDescription,
  IceCandidate: IceCandidate,
  MediaStream: MediaStream,
  getUserMedia: getUserMedia
}
