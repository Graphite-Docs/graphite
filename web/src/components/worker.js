module.exports = function worker (self) {
    self.addEventListener('message', (e) => {
      self.postMessage(e.data);
    });
    // self.close();
};
