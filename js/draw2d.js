$(document).ready(function () {


    var agent = window.navigator.userAgent;
    var device = '';
    
    if ( agent.indexOf( 'iPhone' ) + agent.indexOf( 'BlackBerry' ) > -2 ) {
        device = 'sp';
    }
    else if ( agent.indexOf( 'iPad' ) + agent.indexOf( 'PlayBook' ) > -2 ) {
        device = 'tablet';
    }
    else if ( agent.indexOf( 'Android' ) > -1 ) {
        if ( agent.indexOf( 'Mobile' ) > -1 ) {
            device = 'sp';
        }
        else {
            device = 'tablet';
        }
    }
    else {
        device = 'pc';
    }



    var bufferingSize = ( device == 'sp' ) ? 1 : 2;
    var brushMaxSize = ( device == 'sp' ) ? 25 : 30;
    var brushMinSize = ( device == 'sp' ) ? 3 : 5;
    var velocityPressureCoff = 50;



    var $win = $(window);
    var $doc = $(document);
    
    var ink = getBrush( './resources/index.png' );

    var canvas2D = document.getElementById('canvas-2d');
    var canvas = document.getElementById('canvas');
    var $canvas = $(canvas);
    var ctx = canvas.getContext('2d');

    var canvasWidth = 0;
    var canvasHeight = 0;
    


    window.addEventListener('resize', resizeHandler);
    resizeHandler();


    
    $('#btn-clear').on( 'click', function(){
        engineClear();
        draw3DTexture();
    } );
    $('#btn-send').on( 'click', function(){

        exhibit3DItem();
        new3DItem();
        engineClear();
        // console.log(add3DItem);
        // add3DItem();
    } );


    function getBrush( url ) {
        var image = document.createElement('img');
        image.src = url;
        return image;
    }


    function resizeHandler() {
        canvasResize();
    }

    function canvasResize() {

        canvasWidth = window.innerWidth / 2;
        canvasHeight = window.innerHeight - $('#ui-area').height();

        ctx.canvas.width = canvasWidth;
        ctx.canvas.height = canvasHeight;
    }




    var isClicked = false;



    // Mouse
    $canvas.on( 'mousedown', function( event ) {
        event.preventDefault();
        isClicked = true;
    
        beginStroke();
    });
    
    $win.on( 'mousemove', function ( event ) {
        if ( isClicked ) {
            event.preventDefault();
    
            var offset = $canvas.offset();
    
            var pageX = event.pageX - offset.left/*clientX*/;
            var pageY = event.pageY - offset.top/*clientY*/;
            //drawImage( pageX, pageY );
    
            addStrokePosition(pageX, pageY);
        }
    });
    
    $win.on( 'mouseup', function( event ) {
        if ( isClicked ) {
            event.preventDefault();
            endStroke();
        }
        isClicked = false;
    });
    
    
    // Touch
    $canvas.on( 'touchstart', function( event ) {
        event.preventDefault();
        isClicked = true;
    
        beginStroke();
    });
    
    $win.on( 'touchmove', function ( event ) {
        if ( isClicked ) {
            event.preventDefault();
            var pageX = event.changedTouches[0].pageX;
            var pageY = event.changedTouches[0].pageY;
            //drawImage( pageX, pageY );
    
            addStrokePosition(pageX, pageY);
        }
    });
    
    $win.on( 'touchend', function( event ) {
        if ( isClicked ) {
            event.preventDefault();
        
            endStroke();
        }
        isClicked = false;
    });
    
    
    // controller.on( 'mousemove', function( event ) {
    //     event.preventDefault();
    // });
    // controller.on( 'touchmove', function( event ) {
    //     event.preventDefault();
    // });
    
    
    
    
    function getDistance( p0, p1 ) {
        // return Math.hypot(p0.x, p1.x, p0.y, p1.y);
        var distance = (( p1.x - p0.x ) * ( p1.x - p0.x )) + (( p1.y - p0.y ) * ( p1.y - p0.y ));
        return ( distance == 0 ) ? distance : Math.sqrt( distance );
    }
    
    
    
    
    ///////////////////////
    var isLocked = false;
    var isInStroke = false;
    var strokeBeginTime = null;
    var currentStroke = [];
    
    
    // Manager
    function beginStroke() {
    
        if ( isLocked ) return;
    
        endStroke();
    
        isInStroke = true;
        strokeBeginTime = new Date().valueOf();
        currentStroke.length = 0;
    
        engineBeginStroke();
    }
    
    function addStrokePosition( x, y ) {
    
        if ( isLocked ) return;
    
        var pos = { x: x, y: y, t: new Date().valueOf() - strokeBeginTime };
        currentStroke.push( pos );
        engineAddStrokePosition( pos );
        engineDraw();
    }
    
    
    function endStroke() {
    
        if ( isLocked ) return;
        if ( !isInStroke ) return;
    
        isInStroke = false;
        currentStroke.length = 0;
        engineEndStroke();
    }
    
    
    
    
    
    ///////////////////////
    var strokeBuffer = [];
    var previousPosition = null;
    var previousBrushSize = null;
    var previousVelocity = 0;
    var previousDistance = 0;
    var expectedNextPosition  = null;
    var accelerate = 0;
    
    // Engine
    function engineBeginStroke() {
        strokeBuffer.length = 0;
        previousPosition = null;
        previousBrushSize = null;
        previousVelocity = 0;
        previousDistance = 0;
        expectedNextPosition  = null;
        accelerate = 0;
    }
    
    function engineAddStrokePosition( pos ) {
        strokeBuffer.push( pos ); 
    }
    
    function engineEndStroke() {
        if ( accelerate > 1 ) {
            var pos = {
                x: expectedNextPosition.x,
                y: expectedNextPosition.y,
                t: ( accelerate / ( previousDistance * previousVelocity )) + previousPosition.t
            };
    
            for ( var i = 0, len = bufferingSize; i < len; i ++ ) {
                strokeBuffer.push( pos ); 
            }
            engineDraw( true );
        }
    }
    
    function engineDraw( isEnding ) {
        var pos = getBufferedCurrentPosition();
        if ( pos == null ) return;
    
        if ( previousPosition == null ) {
            previousPosition = pos;
        }
    
        var t = ( pos.t - previousPosition.t );
        var distance = getDistance( pos, previousPosition );
        var velocity = distance / Math.max( 1, t );
        var myAccelerate = ( previousVelocity == 0 ) ? 0 : velocity / previousVelocity;
        var curve = function( t, b, c, d ) {
            return c * t / d + b;
        };
    
        var brushSize = Math.max( brushMinSize,
            curve( velocity, brushMaxSize, (-brushMaxSize)-brushMinSize, velocityPressureCoff ) );
        
        pos.s = brushSize;
    
        // ctx.save();
        
        // set composite mode
        engineDrawStroke( previousPosition, pos, brushSize, distance, velocity );
    
        accelerate = myAccelerate;
    
        expectedNextPosition  = getInterlatePos(previousPosition, pos, 1 + accelerate);
        previousPosition = pos;
        previousBrushSize = brushSize;
        previousVelocity = velocity;
        previousDistance = distance;
    }
    
    
    // 
    function engineDrawStroke( startPos, endPos, brushSize, distance, velocity ) {
        var t = 0;
        var delta = distance / 1;
        var brushDelta = ( brushSize - previousBrushSize );
        var r = Math.PI * 2;
        var rad = Math.atan2( endPos[1] - startPos[1], endPos[0] - startPos[0] );
    
        var k = Math.random() * 1;

    
        
        ctx.globalAlpha = Math.random() * 0.5 + 0.1;

        while( t < 1 ) {
            var brushSizeCur = previousBrushSize + ( brushDelta * t );
            var pos = getInterlatePos( startPos, endPos, t );
    
            if (Math.random() > 0.2) {
                var jitter = (( Math.random() > 0.5 ) ? 1 : -1) * parseInt( Math.random() * 1.2, 10 );
                var px = pos.x - brushSizeCur / 2 + jitter;
                var py = pos.y - brushSizeCur / 2 + jitter;
                for (var i = 0, n = 10; i < n; i++) {
                    ctx.drawImage(ink, px, py, brushSizeCur, brushSizeCur);
                }
            }
    
            t += 1 / distance;
        }
        draw3DTexture(ctx.canvas);
    }
    
    function engineClear() {
        ctx.clearRect(0, 0, $win.width(), $win.height());
    }
    
    
    
    
    function getBufferedCurrentPosition() {
        var pos = { x: 0, y: 0, t: 0 };
        var myBufferingSize = Math.min( bufferingSize, strokeBuffer.length );
    
        if ( myBufferingSize == 0 ) return null;
    
        for ( var i = 1, len = myBufferingSize + 1; i < len; i ++ ) {
            var p = strokeBuffer[ strokeBuffer.length - i ];
            pos.x += p.x;
            pos.y += p.y;
            pos.z += p.t;
        }
    
        pos.x /= myBufferingSize;
        pos.y /= myBufferingSize;
        pos.t /= myBufferingSize;
    
        return pos;
    }
    
    function getInterlatePos( p0, p1, moveLen ) {
        var x = p0.x + ( p1.x - p0.x ) * moveLen;
        var y = p0.y + ( p1.y - p0.y ) * moveLen;
        return { x: x, y: y };
    }
    
    
    
    
    
    
    //////
    window.onorientationchange = function() {
        onOrientationChangeHandler();
    };
    
    function onOrientationChangeHandler() {
        /*switch( window.orientation ) {
            case -90 :
            case 90 :
                $("body").addClass( "landscape" );
                break;
            default :
                $("body").addClass( "portrait" );
                break;
        }*/
        resizeHandler();
    }
    
    onOrientationChangeHandler();
    
    if ( device == "sp" ) {	
        setTimeout(function(){window.scrollTo( 0, 1 );}, 0);
    }
    

});