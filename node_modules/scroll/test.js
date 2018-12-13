var run = require('tape')
var ease = require('ease-component')
var scroll = require('./')

var container = document.createElement('div')
var box = document.createElement('div')

container.style.cssText = [
  'height: 100px',
  'outline: 1px solid #000',
  'overflow: scroll',
  'width: 100px'
].join(';')

box.style.cssText = [
  'outline: 1px solid #888',
  'height: 50px',
  'width: 300px'
].join(';')

var n = 50
while (--n) {
  container.appendChild(box.cloneNode(true))
}

document.body.appendChild(container)

run('it scrolls', function (test) {
  container.scrollTop = 0
  container.scrollLeft = 200

  test.plan(3)

  scroll.top(container, 200, function (error, position) {
    test.ok(position === 200, 'it scrolled down 200 pixels')

    scroll.top(container, 200, function (error, position) {
      test.equal(error.message, 'Element already at target scroll position')
    })
  })

  var leftOptions = { duration: 1000, ease: ease.inBounce }
  scroll.left(container, -200, leftOptions, function (error, position) {
    test.ok(position === 0, 'it scrolled across 200 pixels')
  })
})

run('it can be cancelled', function (test) {
  container.scrollTop = 0
  container.scrollLeft = 200

  test.plan(2)

  var options = { duration: 1000, ease: ease.inBounce }
  var cancel = scroll.left(container, -200, options,
    function (error, position) {
      test.ok(error, 'it produced an error')
      test.equal(error.message, 'Scroll cancelled', 'it cancelled the animation')
    })

  setTimeout(cancel, 500)
})

run('callback fires after scroll events', function (test) {
  container.scrollTop = 0
  test.plan(1)

  var okay = true
  var done = false

  container.addEventListener('scroll', function () {
    if (done) okay = false
  }, false)

  scroll.top(container, 200, function () {
    done = true
    setTimeout(function () {
      test.ok(okay, 'callback fired after scroll events')
    }, 100)
  })
})
