var leftchannel = [];
var recorder = null;
var recording = false;
var recordingLength = 0;
var volume = null;
var audioInput = null;
var sampleRate = null;
var audioContext = null;
var context = null;

if (!navigator.getUserMedia)
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||
                  navigator.mozGetUserMedia || navigator.msGetUserMedia;

if (navigator.getUserMedia){
    navigator.getUserMedia({audio:true}, success, function(e) {
    alert('Error capturing audio.');
    });
} else alert('getUserMedia not supported in this browser.');

function success(e){
    // creates the audio context
    audioContext = window.AudioContext || window.webkitAudioContext;
    context = new audioContext();

	// we query the context sample rate (varies depending on platforms)
    sampleRate = context.sampleRate;

    console.log(sampleRate);

    console.log('succcess');
    
    // creates a gain node
    volume = context.createGain();

    // creates an audio node from the microphone incoming stream
    audioInput = context.createMediaStreamSource(e);

    // connect the stream to the gain node
    audioInput.connect(volume);

    var bufferSize = 4096;
    recorder = context.createScriptProcessor(bufferSize, 1, 2);

    recorder.onaudioprocess = function(e){
        if (!recording) return;
        var left = e.inputBuffer.getChannelData (0);

        leftchannel.push.apply(leftchannel, convertoFloat32ToInt16(left));
        recordingLength += bufferSize;

        if (recordingLength == 4096*5) {
        	recording = false;
        	var http = new XMLHttpRequest();
        	var url = "http://192.168.0.104:8080/zicly/hfs/";
			http.open("POST", url, true);
			http.setRequestHeader("Content-type", "application/json");

			http.onreadystatechange = function() {//Call a function when the state changes.
				console.log(http.readyState);
				console.log(http.status);
			    if(http.readyState == 4 && http.status == 200) {
			        console.log("readyState: " + http.responseText);
			        //recording = true;
					leftchannel.length = 0;
        			recordingLength = 0;        
			    }
			}
			http.onload = function () {
			    console.log(this.responseText);
			};
			http.send(JSON.stringify({
			    "timestamp": Math.floor(Date.now() / 1000),
			    "recordedData": leftchannel
			}));
        	console.log("leftchannel");
        	console.log(leftchannel);
        	
        }
    }

    // we connect the recorder
    volume.connect (recorder);
    recorder.connect (context.destination); 
}

function toggleRecording( e ) {
    if (e.classList.contains("recording")) {
        recording = false;
        e.classList.remove("recording");
    } else {
        recording = true;
        e.classList.add("recording");
        leftchannel.length = 0;
        recordingLength = 0;
    }
}

function convertoFloat32ToInt16(buffer) {
    var l = buffer.length;
    var buf = new Int16Array(l)

    while (l--) {
    	var s = Math.max(-1, Math.min(1, buffer[l]));
    	buf[l] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        //buf[l] = buffer[l] * 0xFFFF; //convert to 16 bit
    }
    return buf
}