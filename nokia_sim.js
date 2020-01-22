function nokia_sim(ele){
    var WIDTH=84;
    var HEIGHT=48;

    var DARK_ARR=[67,82,61,255];//#43523d
    var LIGHT_ARR=[199,240,216,255];//#c7f0d8

    var events={};
    document.addEventListener("keyup",function(event){
        event.preventDefault();
        if (event.keyCode === 13 || event.keyCode === 32) {
            if(events["enter"]) events["enter"]();
        }
        if (event.keyCode === 65 || event.keyCode === 37) {
            if(events["left"]) events["left"]();
        }
        if (event.keyCode === 68 || event.keyCode === 39) {
            if(events["right"]) events["right"]();
        }
    });

    var audio_context = new AudioContext();
    var audio_oscillator = audio_context.createOscillator();
    var audio_gain = audio_context.createGain();
    
    var canvas=document.createElement('canvas');    
    ele.appendChild(canvas);

    var img_data=new ImageData(WIDTH,HEIGHT);
    
    var data=img_data.data;
    for(var y=0; y<HEIGHT; y++){
        for(var x=0; x<WIDTH; x++){
            var byte_x=x*4;
            data[y*WIDTH*4+byte_x]=LIGHT_ARR[0];
            data[y*WIDTH*4+byte_x+1]=LIGHT_ARR[1];
            data[y*WIDTH*4+byte_x+2]=LIGHT_ARR[2];
            data[y*WIDTH*4+byte_x+3]=LIGHT_ARR[3];
        }
    }

    var real_width=0;
    var real_height=0;

    var ctx = null;

    function on_resize(){
        real_width=ele.getBoundingClientRect().width;
        real_height=(real_width*HEIGHT/WIDTH);
    
        canvas.width=real_width;
        canvas.height=real_height;
        //weird bug happened when resizing, it breaks the canvas and smoothing quits working after. had to reinitialize some stuff here
        ctx=canvas.getContext('2d');
        ctx.imageSmoothingEnabled=false;
        canvas.style="image-rendering: optimizeSpeed; image-rendering: -moz-crisp-edges; image-rendering: -webkit-optimize-contrast; image-rendering: -o-crisp-edges; image-rendering: pixelated; -ms-interpolation-mode: nearest-neighbor;"
        draw_canvas();
    }
    window.onresize=on_resize;
    on_resize();
    
    function draw_canvas(){
        //craziness to scale the image and draw it on the canvas
        var tmp_canvas = document.createElement("canvas");
        tmp_canvas.width = WIDTH;
        tmp_canvas.height = HEIGHT;
        var tmp_ctx = tmp_canvas.getContext("2d");
        tmp_ctx.putImageData(img_data, 0, 0);
        var url = tmp_canvas.toDataURL("image/png");
        
        var img = new Image();
        img.setAttribute('crossOrigin', 'anonymous');
        img.src=url;
        
        img.onload = function(){
            console.log('drawing img: ',WIDTH,HEIGHT,real_width,real_height,img.width,img.height,canvas.width,canvas.height);
            ctx.drawImage(img,0,0,WIDTH,HEIGHT,0,0,real_width,real_height);
        }
    }
    draw_canvas();

    var interface={
        on:function(event_type,fn){//"enter", "left", "right"
            events[event_type]=fn;
        },
        set_pixel:function(x,y,value){//screen is 84x48, value is bool (true for dark, false for light)
            var index=x*4;

            data[y*WIDTH*4+index]=value?DARK_ARR[0]:LIGHT_ARR[0];
            data[y*WIDTH*4+index+1]=value?DARK_ARR[1]:LIGHT_ARR[1];
            data[y*WIDTH*4+index+2]=value?DARK_ARR[2]:LIGHT_ARR[2];
            data[y*WIDTH*4+index+3]=value?DARK_ARR[3]:LIGHT_ARR[3];

            draw_canvas();
        },
        play_tone:function(hertz){
            this.stop_tone();
            
            audio_context = new AudioContext();
            audio_oscillator = audio_context.createOscillator();
            audio_gain = audio_context.createGain();

            audio_oscillator.type = "sine";
            audio_oscillator.frequency.value=hertz;
            audio_oscillator.connect(audio_gain);
            audio_gain.connect(audio_context.destination);
            audio_oscillator.start(0);
        },
        stop_tone:function(){
            audio_gain.gain.exponentialRampToValueAtTime(0.00001, audio_context.currentTime + 0.04);
        }
    };
    return interface;
}