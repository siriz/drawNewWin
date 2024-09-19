(function(){
    'use strict';

    return;

    var posArray = [];
    var prevPos;
    var lerpCnt = 40;

    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var img = new Image();
    img.onload = tick;
    img.src = './resources/index.png';

    canvas.addEventListener('mousedown', function(e){
        prevPos = null;
        onDrawStart(e);

        window.addEventListener('mousemove', onDrawStart);
        window.addEventListener('mouseup', onDrawEnd)
    })


    function onDrawStart(e) {
        posArray.push(getPosFromEvent(e))
    }
    function onDrawMove(e) {}
    function onDrawEnd(e) {
        window.removeEventListener('mousemove', onDrawStart);
        window.removeEventListener('mouseup', onDrawEnd);
    }


    function getPosFromEvent(e) {
        let speed = 0;
        let x = e.offsetX;
        let y = e.offsetY;

        if (prevPos) {
            let offsetTime = new Date() * 1 - prevPos.time;
            let distance = Math.hypot(prevPos.x, x, prevPos.y, y);
            speed = distance / offsetTime;
        }
        return {
            x: e.offsetX,
            y: e.offsetY,
            time: new Date() * 1,
            speed: speed
        }
    }

    function lerp( a, b, alpha ) {
        return a + alpha * ( b - a );
    }

    function lerpPos( a, b, alpha ) {
        let x1 = a.x;
        let x2 = b.x;
        let y1 = a.y;
        let y2 = b.y;

        return {
            x: lerp(x1, x2, alpha),
            y: lerp(y1, y2, alpha),
        };
    }

    function clamp(value, min, max) {
        return Math.max( Math.min(value, max), min );
    }


    function drawImage(pos, spd) {
        let scale = clamp(spd, 0.5, 1) * 2
        // console.log(spd)
        let x = pos.x - ( img.width * .5 ) / scale;
        let y = pos.y - ( img.height * .5 ) / scale;
        let w = img.width / scale;
        let h = img.height / scale;
        ctx.drawImage(img, x, y, w, h);
    }


    function tick() {
        if ( posArray.length > 0 ) {
            var currentPos = posArray.shift();

            if ( prevPos ) {
                for ( let i = 0; i < lerpCnt; i ++ ) {
                    let drawPos = lerpPos(currentPos, prevPos, i / lerpCnt);
                    let drawSpeed = lerp(currentPos.speed, prevPos.speed, i / lerpCnt);
                    drawImage( drawPos, currentPos.speed );
                }
            }
             
        //    drawImage( currentPos );
           prevPos = currentPos;
        }

        requestAnimationFrame(tick);
    }

})();