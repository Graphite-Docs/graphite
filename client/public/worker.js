var count;

function startWorker() {
  if(typeof(Worker) !== "undefined") {
    if(typeof(w) == "undefined") {
      w = new Worker("sharedDocWorker.js");
    }
    w.onmessage = function(event) {
      console.log(event.data);
    };
  } else {
    console.log("Sorry, your browser does not support Web Workers...");
  }
}

function stopWorker() { 
  w.terminate();
  w = undefined;
}