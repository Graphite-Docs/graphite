#ifndef _SECP256K1_NODE_UTIL_
# define _SECP256K1_NODE_UTIL_

#include <node.h>
#include <nan.h>

#include "async.h"


#define COPY_BUFFER(data, datalen) Nan::CopyBuffer((const char*) data, datalen).ToLocalChecked()

// Type checks (TypeError)
#define CHECK_TYPE_BUFFER(buffer, msg) {                                       \
  if (!node::Buffer::HasInstance(buffer)) {                                    \
    return Nan::ThrowTypeError(msg);                                           \
  }                                                                            \
}

#define CHECK_TYPE_BUFFER_ASYNC(buffer, msg) {                                 \
  if (!node::Buffer::HasInstance(buffer)) {                                    \
    SetError(AsyncWorker::TypeError, msg);                                     \
    return;                                                                    \
  }                                                                            \
}

#define CHECK_TYPE_BOOLEAN(boolean, msg) {                                     \
  if (!boolean->IsBoolean() && !boolean->IsBooleanObject()) {                  \
    return Nan::ThrowTypeError(msg);                                           \
  }                                                                            \
}

#define CHECK_TYPE_FUNCTION(function, msg) {                                   \
  if (!function->IsFunction()) {                                               \
    return Nan::ThrowTypeError(msg);                                           \
  }                                                                            \
}

#define CHECK_TYPE_NUMBER(number, msg) {                                       \
  if (!number->IsNumber() && !number->IsNumberObject()) {                      \
    return Nan::ThrowTypeError(msg);                                           \
  }                                                                            \
}

#define CHECK_TYPE_NUMBER_ASYNC(number, msg) {                                 \
  if (!number->IsNumber() && !number->IsNumberObject()) {                      \
    SetError(AsyncWorker::TypeError, msg);                                     \
    return;                                                                    \
  }                                                                            \
}

#define CHECK_TYPE_ARRAY(array, msg) {                                         \
  if (!array->IsArray()) {                                                     \
    return Nan::ThrowTypeError(msg);                                           \
  }                                                                            \
}

// Length checks (RangeError)
#define CHECK_BUFFER_LENGTH_GT_ZERO(buffer, msg) {                             \
  if (node::Buffer::Length(buffer) == 0) {                                     \
    return Nan::ThrowRangeError(msg);                                          \
  }                                                                            \
}

#define CHECK_BUFFER_LENGTH(buffer, length, msg) {                             \
  if (node::Buffer::Length(buffer) != length) {                                \
    return Nan::ThrowRangeError(msg);                                          \
  }                                                                            \
}

#define CHECK_BUFFER_LENGTH_ASYNC(buffer, length, msg) {                       \
  if (node::Buffer::Length(buffer) != length) {                                \
    SetError(AsyncWorker::RangeError, msg);                                    \
    return;                                                                    \
  }                                                                            \
}

#define CHECK_BUFFER_LENGTH2(buffer, length1, length2, msg) {                  \
  if (node::Buffer::Length(buffer) != length1 &&                               \
      node::Buffer::Length(buffer) != length2) {                               \
    return Nan::ThrowRangeError(msg);                                          \
  }                                                                            \
}

#define CHECK_BUFFER_LENGTH2_ASYNC(buffer, length1, length2, msg) {            \
  if (node::Buffer::Length(buffer) != length1 &&                               \
      node::Buffer::Length(buffer) != length2) {                               \
    SetError(AsyncWorker::RangeError, msg);                                    \
    return;                                                                    \
  }                                                                            \
}

#define CHECK_LENGTH_GT_ZERO(obj, msg) {                                       \
  if (obj->Length() == 0) {                                                    \
    return Nan::ThrowRangeError(msg);                                          \
  }                                                                            \
}

#define CHECK_NUMBER_IN_INTERVAL(number, x, y, msg) {                          \
  if (number->IntegerValue() <= x || number->IntegerValue() >= y) {            \
    return Nan::ThrowRangeError(msg);                                          \
  }                                                                            \
}

#define CHECK_NUMBER_IN_INTERVAL_ASYNC(number, x, y, msg) {                    \
  if (number->IntegerValue() <= x || number->IntegerValue() >= y) {            \
    SetError(AsyncWorker::RangeError, msg);                                    \
    return;                                                                    \
  }                                                                            \
}

#endif
