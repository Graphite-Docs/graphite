var murmurHash3 = require("../");
// var murmurHash3 = require("murmurhash3js");

console.log("x86:");
console.log("I will not buy this record, it is scratched.", murmurHash3.x86.hash32("I will not buy this record, it is scratched."));
console.log("I will not buy this tobacconist's, it is scratched.", murmurHash3.x86.hash128("I will not buy this tobacconist's, it is scratched."));
console.log("My hovercraft is full of eels. - 0", murmurHash3.x86.hash32("My hovercraft is full of eels.", 0));
console.log("My hovercraft is full of eels. - 25", murmurHash3.x86.hash32("My hovercraft is full of eels.", 25));
console.log("My hovercraft is full of eels. - 128", murmurHash3.x86.hash32("My hovercraft is full of eels.", 128));


console.log("\nx64:");
console.log("I will not buy this record, it is scratched.", murmurHash3.x64.hash128("I will not buy this record, it is scratched."));
console.log("I will not buy this tobacconist's, it is scratched.", murmurHash3.x64.hash128("I will not buy this tobacconist's, it is scratched."));
console.log("My hovercraft is full of eels. - 0", murmurHash3.x64.hash128("My hovercraft is full of eels.", 0));
console.log("My hovercraft is full of eels. - 25", murmurHash3.x64.hash128("My hovercraft is full of eels.", 25));
console.log("My hovercraft is full of eels. - 128", murmurHash3.x64.hash128("My hovercraft is full of eels.", 128));
