
Generator = class Generator

  constructor: (opts) ->
    opts                = opts or {}
    @lazy_loop_delay    = opts.lazy_loop_delay    or 30                   # milliseconds; pause in loops before generate called
    @loop_delay         = opts.loop_delay         or 5                    # milliseconds; pause between loops
    @work_min           = opts.work_min           or 1                    # milliseconds; 1 recommended
    @auto_stop_bits     = opts.auto_stop_bits     or 4096                 # collector will pause if this many unused bits are collected
    @max_bits_per_delta = opts.max_bits_per_delta or 4                    # a ceiling on how many bits of entropy claimable per timer
    @auto_stop          = if opts.auto_stop then opts.auto_stop else true # stop is called automatically after a generate
    @entropies          = []
    @running            = true
    @is_generating      = false
    @timer_race_loop()

  generate: (bits_wanted, cb) ->
    @is_generating = true
    if not @running
      @resume()
    harvested_bits = 0
    res = []
    while harvested_bits < bits_wanted
      if @entropies.length
        e = @entropies.splice(0,1)[0]
        harvested_bits += e[1]
        res.push e[0]
      else
        await @delay defer()
    if @auto_stop
      @stop()
    @is_generating = false
    cb res

  stop:   -> @running = false
  resume: ->
    @running = true
    @timer_race_loop()

  reset: ->
    @entropies  = []
    @total_bits = 0

  count_unused_bits: ->
    bits = 0
    bits += e[1] for e in @entropies
    bits

  delay: (cb) ->
    delay = if @is_generating then @loop_delay else @lazy_loop_delay
    await setTimeout defer(), delay
    cb()

  timer_race_loop: ->
    @_last_count = null
    while @running
      if @count_unused_bits() < @auto_stop_bits
        count = @millisecond_count()
        if @_last_count? and (delta = count - @_last_count)
          entropy = Math.floor @log_2 Math.abs delta
          entropy = Math.min   @max_bits_per_delta, entropy
          v       = [delta, entropy]
          @entropies.push v
        @_last_count = count
      await @delay defer()

  log_2: (x) -> Math.log(x) / Math.LN2


  millisecond_count: ->
    # ---------------------------------------
    # sees how high we can count between
    # N and N+1 milliseconds, doing floating
    # point operations along the way
    # ---------------------------------------
    d = Date.now()
    i = x = 0
    while Date.now() < d + @work_min + 1
      i++
      x = Math.sin Math.sqrt Math.log i+x
    return i

if window?
  window.Generator = Generator
if exports?
  exports.Generator = Generator


