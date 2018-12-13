
uint_max = Math.pow(2,32)

#----------------------------------------------

exports.fixup_uint32 = (x) ->
  ret = if x > uint_max or x < 0
    x_pos = (Math.abs(x) % uint_max)
    if x < 0 then uint_max - x_pos
    else x_pos
  else x
  ret

#----------------------------------------------

exports.scrub_buffer = (b) ->
  n_full_words = (b.length >> 2)
  i = 0
  while i < n_full_words
    b.writeUInt32LE 0, i
    i += 4
  while i < b.length
    b.writeUInt8 0, i
    i++
  false

#----------------------------------------------

exports.copy_buffer = (b) ->
  ret = new Buffer b.length
  for i in [0...b.length]
    ret.writeUInt8(b.readUInt8(i), i)
  return ret

#----------------------------------------------

exports.scrub_vec = (v) ->
  for i in [0...v.length]
    v[i] = 0
  false

#----------------------------------------------

exports.default_delay = default_delay = (i, n, cb) ->
  if setImmediate?
    await setImmediate defer()
  else
    await setTimeout defer(), 1
  cb()

#----------------------------------------------

# Compare for ordering when both are considered as unsigned big-endian integers.
# Return -1 if @ is less than b2.
# Return 1 if @ if greater than b2
# Return 0 if equal
exports.buffer_cmp_ule = (b1, b2) ->
  i = j = 0
  I = b1.length
  J = b2.length

  i++ while (i < I and b1.readUInt8(i) is 0)
  j++ while (j < J and b2.readUInt8(j) is 0)

  if (I - i) > (J - j) then return 1
  else if (J - j) > (I - i) then return -1

  while (i < I)
    if (x = b1.readUInt8(i)) < (y = b2.readUInt8(j)) then return -1
    else if y < x then return 1
    i++
    j++
  return 0

#----------------------------------------------

# Perform a bulk crypto operation, inserting delay slots as
# needs be.
#
# @param {number} n_input_bytes The number of bytes in the input
# @param {Function} update Function to call to update internal state. Call with a lo
#    and high position **in words**, for which window of the input to operate on.
# @param {Function} finalize Function to call to finalize computation
#    and yield a result.
# @param {number} default_n The default number of words per batch to operate
#    on if none is given explicitly as n
# @param {number} n The number of words per batch
# @param {Function} delay The function to call in each delay slot
# @param {String} what The "what" parameter to pass to progress_hook
# @param {Function} progress_hook The hook to call periodically with progress updates
# @param {Callback} cb The callback to call upon completion, with
#    a result (and no error, since no errors can be generated in a correct
#    implementation).
exports.bulk = (n_input_bytes, {update, finalize, default_n}, {delay, n, cb, what, progress_hook}) ->
  i = 0
  left = 0
  total_words = Math.ceil n_input_bytes / 4
  delay or= default_delay
  n or= default_n
  call_ph = (i) -> progress_hook? { what, i, total : total_words }
  call_ph 0
  while (left = (total_words - i)) > 0
    n_words = Math.min n, left
    update i, i + n_words
    call_ph i
    await delay i, total_words, defer()
    i += n_words
  call_ph total_words
  ret = finalize()
  cb ret



