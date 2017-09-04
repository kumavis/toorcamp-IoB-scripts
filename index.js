var request = require('request')
var async = require('async')
var keypress = require('keypress')

var currentPos = [1,1]
var characterColor = [120,0,200]

// onKeypress(function(key){
//   console.log(key)
//   var oldPos = currentPos.slice()
//   var newPos = currentPos.slice()
//   switch (key) {
//     case 'left':
//       newPos[0]=newPos[0]-1
//       break
//     case 'right':
//       newPos[0]=newPos[0]+1
//       break
//     case 'up':
//       newPos[1]=newPos[1]-1
//       break
//     case 'down':
//       newPos[1]=newPos[1]+1
//       break
//   }
//   currentPos = newPos
//   console.log('newPos:',newPos)
//   async.series([
//     (cb)=> push(newPos, characterColor, cb),
//     (cb)=> clearPos(oldPos, cb),
//   ], console.log.bind(console))
// })

var screenWidth = 10
var screenHeight = 5

// randomColorForever()  

async.series([
  // clearScreen,
  (cb)=>drawCircle(2.5, cb),
])

function drawCircle(radius, cb){
  eachPixel((pos, cb)=> {
    var middle = [Math.floor(screenWidth/2),Math.floor(screenHeight/2)]
    // console.log('middle:', middle)
    var delta = distance(middle, pos)
    // console.log(pos,'->',delta)
    console.log('drawPixel')
    if (delta>=radius) push(pos, [0,0,255])
    cb()
  }, cb)
}


function clearScreen(cb){
  eachPixel((pos, cb)=> {
    console.log('clearPixel')
    push(pos, [0,0,0], cb)
  }, cb)
}

function distance(a,b){
  var deltaXSquared = Math.pow(b[0]-a[0],2)
  var deltaYSquared = Math.pow(b[1]-a[1],2)
  return Math.sqrt(deltaXSquared+deltaYSquared)
}

function randomColorForever(){
  async.forever(function(cb){
    console.log('forever')
    async.series([
      (next)=> eachPixel((pos, cb)=>push(pos, randomColorChunk(3), cb), next),
    ], cb)
  })
}

function spiral(fn, cb){
  var middle = [Math.floor(screenWidth/2),Math.floor(screenHeight/2)]
}



function randomColorChunk(chunks){
  return [randomChunk(chunks),randomChunk(chunks),randomChunk(chunks)]
}

function randomChunk(chunks){
  return Math.floor(randomInt(chunks)*255/(chunks-1))
}

function randomColorB(){
  return [randomPow2(),randomPow2(),randomPow2()]
}

function randomColorC(){
  return [randomPow2Rev(),randomPow2Rev(),randomPow2Rev()]
}

function randomColor(){
  return [randomInt(255),randomInt(255),randomInt(255)]
}

function randomPow2Rev(){
  return 255-randomPow2()
}

function randomPow2(){
  return Math.pow(2,Math.floor(8*Math.random()))-1
}

function randomInt(max){
  return Math.floor(max*Math.random())
}


// eachPixel(lightGradient)
// eachPixel(rgbFlash)

function onKeypress(fn){
  // make `process.stdin` begin emitting "keypress" events
  keypress(process.stdin)

  // listen for the "keypress" event
  process.stdin.on('keypress', function (ch, key) {
    if (key && key.ctrl && key.name == 'c') {
      process.stdin.pause();
    }
    // console.log('got "keypress"', key)
    fn(key.name)
  });

  process.stdin.setRawMode(true)
  process.stdin.resume()

}


// async.series([
//   // (cb)=> console.log('wat'),
//   (cb)=> push([9,4], [000,000,000], cb),
//   // (cb)=> console.log('before'),
//   // (cb)=> delay(10, cb),
//   // (cb)=> console.log('hey'),
//   (cb)=> push([9,4], [255,255,255], cb),
// ], function(){
//   console.log(arguments)
// })
// push([9,4], [0,0,0])

function animWhite(pos, next){
   async.timesSeries(8, function(amp, cb){
    var heat = Math.pow(2,amp)-1
    push(pos, [heat,heat,heat], cb)
  }, next)
}

// function whiteGradient(pos, next){
//   var heat = Math.pow(2,amp)-1
//   push([0,0], [heat,heat,heat])
//   next()
// }

function lightGradient(pos, next){
  var gradX = Math.floor(255/10*pos[0])
  var gradY = Math.floor(255/5*pos[1])
  var gradZ = Math.floor(255/10*pos[1])
  push(pos, [gradY,0,gradX])
  next()
}

function rgbFlash(pos, next){
  async.series([
    (cb)=> flash(pos,[255,000,000], cb),
    (cb)=> flash(pos,[000,255,000], cb),
    (cb)=> flash(pos,[000,000,255], cb),
  ])
  next()
}



// eachPixel(function(pos, next){
//   // flash(pos,[120,0,200], cb)
//   async.timesSeries(8, function(amp, cb){
//     var heat = Math.pow(2,amp)-1
//     push(pos, [heat,heat,heat], cb)
//   })
//   // push(pos, [120,0,200])
//   next()
//   // cb()
// })

// eachPixel(function(pos, next){
//   // flash(pos,[120,0,200], cb)
//   async.series([
//     (cb)=> flash(pos,[255,000,000], cb),
//     (cb)=> flash(pos,[000,255,000], cb),
//     (cb)=> flash(pos,[000,000,255], cb),
//   ])
//   next()
//   // cb()
//   // push(pos, [120,0,200])
// })

// flash([0,0],[120,0,200])


function eachPixel(fn, done){
  async.times(5, function(y, nextY){
    async.times(10, function(x, nextX){
      fn([x,y], nextX)
    }, nextY)
  }, done)
}

function eachPixelSeries(fn, done){
  async.timesSeries(5, function(y, nextY){
    async.timesSeries(10, function(x, nextX){
      fn([x,y], nextX)
    }, nextY)
  }, done)
}


function clearPos(pos, cb){
  push(pos, [0,0,0], cb)
}

function push(pos, color, cb){
  var address = posToAddress(pos)
  console.log(pos, color)
  request({
    uri: `http://${address}?r=${color[0]}&g=${color[1]}&b=${color[2]}`,
  }, function(){
    (cb || noop)()
  })
}

function noop(){}

function posToAddress(pos){
  var number = 201+pos[1]*10+pos[0]
  return `192.168.16.${number}`
}

function randomInt(max){
  return Math.floor(Math.random()*max)
}

function delay(time, cb){
  setTimeout(cb, time)
}

function flash(pos, color, cb){
  async.series([
    (cb)=> push(pos, [000,000,000], cb),
    (cb)=> push(pos, color, cb),
    (cb)=> push(pos, [000,000,000], cb),
  ], cb)
}