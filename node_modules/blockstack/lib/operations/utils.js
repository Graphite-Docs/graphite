'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DUST_MINIMUM = undefined;
exports.hash160 = hash160;
exports.hash128 = hash128;
exports.estimateTXBytes = estimateTXBytes;
exports.sumOutputValues = sumOutputValues;
exports.decodeB40 = decodeB40;
exports.addUTXOsToFund = addUTXOsToFund;
exports.signInputs = signInputs;

var _bitcoinjsLib = require('bitcoinjs-lib');

var _bitcoinjsLib2 = _interopRequireDefault(_bitcoinjsLib);

var _ripemd = require('ripemd160');

var _ripemd2 = _interopRequireDefault(_ripemd);

var _bigi = require('bigi');

var _bigi2 = _interopRequireDefault(_bigi);

var _errors = require('../errors');

var _signers = require('./signers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DUST_MINIMUM = exports.DUST_MINIMUM = 5500;

function hash160(buff) {
  var sha256 = _bitcoinjsLib2.default.crypto.sha256(buff);
  return new _ripemd2.default().update(sha256).digest();
}

function hash128(buff) {
  return Buffer.from(_bitcoinjsLib2.default.crypto.sha256(buff).slice(0, 16));
}

// COPIED FROM coinselect, because 1 byte matters sometimes.
// baseline estimates, used to improve performance
var TX_EMPTY_SIZE = 4 + 1 + 1 + 4;
var TX_INPUT_BASE = 32 + 4 + 1 + 4;
var TX_INPUT_PUBKEYHASH = 107;
var TX_OUTPUT_BASE = 8 + 1;
var TX_OUTPUT_PUBKEYHASH = 25;

function inputBytes(input) {
  if (input && input.script && input.script.length > 0) {
    return TX_INPUT_BASE + input.script.length;
  } else {
    return TX_INPUT_BASE + TX_INPUT_PUBKEYHASH;
  }
}

function outputBytes(output) {
  if (output && output.script && output.script.length > 0) {
    return TX_OUTPUT_BASE + output.script.length;
  } else {
    return TX_OUTPUT_BASE + TX_OUTPUT_PUBKEYHASH;
  }
}

function transactionBytes(inputs, outputs) {
  return TX_EMPTY_SIZE + inputs.reduce(function (a, x) {
    return a + inputBytes(x);
  }, 0) + outputs.reduce(function (a, x) {
    return a + outputBytes(x);
  }, 0);
}

//

function estimateTXBytes(txIn, additionalInputs, additionalOutputs) {
  var innerTx = txIn;
  if (txIn instanceof _bitcoinjsLib2.default.TransactionBuilder) {
    innerTx = txIn.__tx;
  }
  var dummyInputs = new Array(additionalInputs);
  dummyInputs.fill(null);
  var dummyOutputs = new Array(additionalOutputs);
  dummyOutputs.fill(null);

  var inputs = [].concat(innerTx.ins, dummyInputs);
  var outputs = [].concat(innerTx.outs, dummyOutputs);

  return transactionBytes(inputs, outputs);
}

function sumOutputValues(txIn) {
  var innerTx = txIn;
  if (txIn instanceof _bitcoinjsLib2.default.TransactionBuilder) {
    innerTx = txIn.__tx;
  }

  return innerTx.outs.reduce(function (agg, x) {
    return agg + x.value;
  }, 0);
}

function decodeB40(input) {
  // treat input as a base40 integer, and output a hex encoding
  // of that integer.
  //
  //   for each digit of the string, find its location in `characters`
  //    to get the value of the digit, then multiply by 40^(-index in input)
  // e.g.,
  // the 'right-most' character has value: (digit-value) * 40^0
  //  the next character has value: (digit-value) * 40^1
  //
  // hence, we reverse the characters first, and use the index
  //  to compute the value of each digit, then sum
  var characters = '0123456789abcdefghijklmnopqrstuvwxyz-_.+';
  var base = _bigi2.default.valueOf(40);
  var inputDigits = input.split('').reverse();
  var digitValues = inputDigits.map(function (character, exponent) {
    return _bigi2.default.valueOf(characters.indexOf(character)).multiply(base.pow(_bigi2.default.valueOf(exponent)));
  });
  var sum = digitValues.reduce(function (agg, cur) {
    return agg.add(cur);
  }, _bigi2.default.ZERO);
  return sum.toHex();
}

/**
 * Adds UTXOs to fund a transaction
 * @param {TransactionBuilder} txBuilderIn - a transaction builder object to add the inputs to. this
 *    object is _always_ mutated. If not enough UTXOs exist to fund, the tx builder object
 *    will still contain as many inputs as could be found.
 * @param {Array<{value: number, tx_hash: string, tx_output_n}>} utxos - the utxo set for the
 *    payer's address.
 * @param {number} amountToFund - the amount of satoshis to fund in the transaction. the payer's
 *    utxos will be included to fund up to this amount of *output* and the corresponding *fees*
 *    for those additional inputs
 * @param {number} feeRate - the satoshis/byte fee rate to use for fee calculation
 * @param {boolean} fundNewFees - if true, this function will fund `amountToFund` and any new fees
 *    associated with including the new inputs.
 *    if false, this function will fund _at most_ `amountToFund`
 * @returns {number} - the amount of leftover change (in satoshis)
 * @private
 */
function addUTXOsToFund(txBuilderIn, utxos, amountToFund, feeRate) {
  var fundNewFees = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : true;

  if (utxos.length === 0) {
    throw new _errors.NotEnoughFundsError(amountToFund);
  }

  // how much are we increasing fees by adding an input ?
  var newFees = feeRate * (estimateTXBytes(txBuilderIn, 1, 0) - estimateTXBytes(txBuilderIn, 0, 0));
  var utxoThreshhold = amountToFund;
  if (fundNewFees) {
    utxoThreshhold += newFees;
  }

  var goodUtxos = utxos.filter(function (utxo) {
    return utxo.value >= utxoThreshhold;
  });
  if (goodUtxos.length > 0) {
    goodUtxos.sort(function (a, b) {
      return a.value - b.value;
    });
    var selected = goodUtxos[0];
    var change = selected.value - amountToFund;
    if (fundNewFees) {
      change -= newFees;
    }

    txBuilderIn.addInput(selected.tx_hash, selected.tx_output_n);
    return change;
  } else {
    utxos.sort(function (a, b) {
      return b.value - a.value;
    });
    var largest = utxos[0];

    if (newFees >= largest.value) {
      throw new _errors.NotEnoughFundsError(amountToFund);
    }

    txBuilderIn.addInput(largest.tx_hash, largest.tx_output_n);

    var remainToFund = amountToFund - largest.value;
    if (fundNewFees) {
      remainToFund += newFees;
    }

    return addUTXOsToFund(txBuilderIn, utxos.slice(1), remainToFund, feeRate, fundNewFees);
  }
}

function signInputs(txB, defaultSigner, otherSigners) {
  var signerArray = txB.__tx.ins.map(function () {
    return defaultSigner;
  });
  if (otherSigners) {
    otherSigners.forEach(function (signerPair) {
      signerArray[signerPair.index] = signerPair.signer;
    });
  }
  var signingPromise = Promise.resolve();

  var _loop = function _loop(i) {
    signingPromise = signingPromise.then(function () {
      return signerArray[i].signTransaction(txB, i);
    });
  };

  for (var i = 0; i < txB.__tx.ins.length; i++) {
    _loop(i);
  }
  return signingPromise.then(function () {
    return txB;
  });
}