"use strict";

import { getFile, putFile } from 'blockstack';

export { writeFile as writeFile };
export { readFile as readFile };

const prefix = "multifile:"

function writeFile(path, content, options) {
  const mb = content.size / 1000000.0
  if (mb > 5) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.onload = function() {

        var arrayBuffer = this.result,
            array       = new Uint8Array(arrayBuffer);

        const arrayOfFilesBytes = chunkArray(array, 4000000)

        // Write main file
        var paths = ""
        arrayOfFilesBytes.forEach(function(element, index) {
          var new_path = path + "_part" + index
          paths = paths + new_path + ","
        });
        var main_content = prefix + paths
        putFile(path, main_content, options)

        // Write file parts
        var promises = []
        arrayOfFilesBytes.forEach(function(element, index) {
          var new_path = path + "_part" + index
          promises.push(putFile(new_path, element, options))
        });
        Promise.all(promises)
          .then(function() {
            resolve()
          })
          .catch(() => {
            reject()
          })
      }
      reader.readAsArrayBuffer(content);
    })
  } else {
    return putFile(path, content, options)
  }
}

function readFile(path, options) {
  return new Promise((resolve, reject) => {
    getFile(path, options)
      .then((file) => {
        if (typeof file === 'string') {
          var file_string = String(file)
          if (file_string.length > 10 && file_string.substring(0,10) == prefix) {
            // Get file parts
            var file_names = file_string.substring(10,file_string.length).split(',')
            file_names = file_names.filter(function(e){return e}); 
            var promises = []
            file_names.forEach(function(element, index) {
              promises.push(getFile(element, options))
            });
            Promise.all(promises)
              .then(function(values) {
                var total_bytes = values[0]
                values.forEach(function(element, index) {
                  if (index != 0) {
                    total_bytes = appendBuffer(total_bytes, element)
                  }
                });
                resolve(total_bytes)
              })
          } else {
            resolve(file)
          }
        } else {
          resolve(file)
        }
      }).catch(() => {
        reject()
      })
  })
}

function appendBuffer(buffer1, buffer2) {
  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
};

function chunkArray(myArray, chunk_size){
  var index = 0;
  var arrayLength = myArray.length;
  var tempArray = [];
  
  for (index = 0; index < arrayLength; index += chunk_size) {
      var chunk = myArray.slice(index, index+chunk_size);
      tempArray.push(chunk);
  }

  return tempArray;
}