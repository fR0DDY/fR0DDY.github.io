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

if (navigator.getUserMedia) {
    navigator.getUserMedia({audio:true}, success, function(e) {
    alert('Error capturing audio.');
    });
} else alert('getUserMedia not supported in this browser.');

function success(e) {
    audioContext = window.AudioContext || window.webkitAudioContext;
    context = new audioContext();

    sampleRate = context.sampleRate;

    console.log(sampleRate);

    volume = context.createGain();

    audioInput = context.createMediaStreamSource(e);

    audioInput.connect(volume);

    var bufferSize = 4096;
    recorder = context.createScriptProcessor(bufferSize, 1, 2);

    recorder.onaudioprocess = function(e){
        if (!recording) return;
        var left = e.inputBuffer.getChannelData (0);

        leftchannel.push.apply(leftchannel, convertoFloat32ToInt16(left));
        recordingLength += bufferSize;

        if (recordingLength == 4096*20) {
        	recording = false;
        	var http = new XMLHttpRequest();
        	var url = "https://ancient-beyond-10162.herokuapp.com/zicly/hfs/";
			http.open("POST", url, true);
			http.setRequestHeader("Content-type", "application/json");

			http.onreadystatechange = function() {
			    if(http.readyState == 4 && http.status == 200) {
        			toggleRecording(document.getElementById("record"));
			    }
			}
			http.onload = function () {
			    console.log(this.responseText);
			    document.getElementById("text").innerHTML = JSON.parse(this.responseText)["data"];
			};
			http.send(JSON.stringify({
			    "timestamp": Math.floor(Date.now() / 1000),
			    "recordedData": leftchannel
			}));
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