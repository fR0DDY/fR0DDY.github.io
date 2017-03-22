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
    // var bufferSize = Math.ceil((81920 * sampleRate) / 44100);
    recorder = context.createScriptProcessor(bufferSize, 1, 2);

    recorder.onaudioprocess = function(e){
        if (!recording) return;
        var left = e.inputBuffer.getChannelData (0);

        var resampler = new Resampler(sampleRate, 44100, 1, left);
        var resampled = resampler.resampler(4096);
        console.log(resampled);
        console.log(resampler.outputBuffer);

        leftchannel.push.apply(leftchannel, convertoFloat32ToInt16(left));
        recordingLength += bufferSize;

        if (recordingLength == 4096*20) {
        	recording = false;
        	var http = new XMLHttpRequest();
        	var url = "https://ancient-beyond-10162.herokuapp.com/zicly/hfs/";
        	//var url = "http://192.168.0.104:8080/zicly/hfs/";
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
			    "recordedData": leftchannel,
			    "samplingRate": sampleRate
			}));
			var leftBuffer = leftchannel;
			var view = encodeWAV(leftBuffer, true);
			var blob = new Blob ( [ view ], { type : 'audio/wav' } );
			var url = (window.URL || window.webkitURL).createObjectURL(blob);
		    var link = document.getElementById("save");
		    link.href = url;
		    link.download = 'output.wav';
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

function mergeBuffers(channelBuffer, recordingLength){
  var result = new Int16Array(recordingLength);
  var offset = 0;
  var lng = channelBuffer.length;
  for (var i = 0; i < lng; i++){
    var buffer = channelBuffer[i];
    result.set(buffer, offset);
    offset += buffer.length;
  }
  return result;
}

function writeUTFBytes(view, offset, string){ 
  var lng = string.length;
  for (var i = 0; i < lng; i++){
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function encodeWAV(samples, mono){
  var buffer = new ArrayBuffer(44 + samples.length * 2);
  var view = new DataView(buffer);

  /* RIFF identifier */
  writeUTFBytes(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 32 + samples.length * 2, true);
  /* RIFF type */
  writeUTFBytes(view, 8, 'WAVE');
  /* format chunk identifier */
  writeUTFBytes(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, mono?1:2, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 4, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 4, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeUTFBytes(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  //floatTo16BitPCM(view, 44, samples);

  var offset = 44;
  for (var i = 0; i < samples.length; i++, offset+=2){
    view.setInt16(offset, samples[i], true);
  }

  return view;
}