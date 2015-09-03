angular.module('webAudioApp', [])
    .controller('no1Ctrl', function () {

        var context = new window.AudioContext();

        // create Oscillator node
        var oscillator = context.createOscillator();
        oscillator.connect(context.destination);

        oscillator.type = 'square';
        oscillator.frequency.value = 60; // value in hertz


        this.start = function () {
            console.log(true);
            oscillator.start();
        };
        this.stop = function () {
            console.log(false);
            oscillator.stop();
        };

    })
    .controller('no2Ctrl', function () {

        this.gain = 0.5;


        var context = new window.AudioContext();

        // create Oscillator node
        var oscillator = context.createOscillator();
        oscillator.connect(context.destination);

        oscillator.type = 'triangle';
        oscillator.frequency.value = 120; // value in hertz


        // Add Gain Node
        var gainNode = context.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        gainNode.gain.value = this.gain;


        this.changeGain = function (gain) {
            gainNode.gain.value = gain;
        };
        this.start = function () {
            oscillator.start();
        };
        this.stop = function () {
            oscillator.stop();
        };

    })
    .controller('no3Ctrl', function () {

        var ctrl = this;


        var context = new window.AudioContext();

        // create Oscillator node
        var oscillator = context.createOscillator();
        oscillator.connect(context.destination);

        oscillator.type = 'square';
        oscillator.frequency.value = 120; // value in hertz


        ctrl.frequency = 440;

        // Create the filter
        var filter = context.createBiquadFilter();

        oscillator.connect(filter);
        filter.connect(context.destination);

        filter.type = 'lowpass';
        filter.frequency.value = 120;
        filter.frequency.Q = 1;


        ctrl.changeFreq = function () {
            filter.frequency.value = ctrl.frequency;
        };
        ctrl.start = function () {
            oscillator.start();
        };
        ctrl.stop = function () {
            oscillator.stop();
        };

    })
    .controller('SynthController', ['$scope','$timeout', function($scope, $timeout) {
        $scope.running = false;
        $scope.frequency = 50;
        $scope.detune = 0.5;
        $scope.type = "sawtooth";
        $scope.amountOfoscillators = 3;
        $scope.oscillators = [];
        $scope.gain = -0.7;
        $scope.speak = "Push me. and then just touch me. Till I can get my. Satisfaction.";
        // $scope.speechSynth = new SpeechSynthesisUtterance($scope.speak);
        $scope.tempo = 160;
        $scope.stepper = 0;

        $scope.start = function() {
            $scope.oscillators.forEach(function(osc){
                osc.start();
                $scope.gain = -0.7;
                $scope.changeGain();
            });
            $scope.running = true;
        };
        $scope.stop = function() {
            $scope.gain = -0.7;
            $scope.changeGain();
        };


        $scope.changeFreq = function () {
            $scope.oscillators.forEach(function(osc, index){
                osc.frequency.value = $scope.frequency - ($scope.detune * index);
            })
        };

        $scope.changeNote = function (freq) {
            $scope.frequency = freq;
            $scope.oscillators.forEach(function(osc, index){
                osc.frequency.value = freq - ($scope.detune * index);
            })
        };

        $scope.changeType = function (type) {
            $scope.type = type;
            $scope.oscillators.forEach(function(osc, index){
                $scope.oscillators[index].type = type;
            });

            $scope.oscillators[osc].type = type;
        };

        // that's the prefixing sorted.
        // window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var synth = new AudioContext();
        for (var i = 0; i < $scope.amountOfoscillators; i++) {
            $scope.oscillators[i] = synth.createOscillator();
            $scope.oscillators[i].frequency.value = $scope.frequency - ($scope.detune * i);
            $scope.oscillators[i].type = "sawtooth";
            $scope.oscillators[i].connect(synth.destination);
        }

        // Gain
        var gainNode = synth.createGain();
        for (var i = 0; i < $scope.amountOfoscillators; i++) {
            $scope.oscillators[i].connect(gainNode);
        }
        gainNode.connect(synth.destination);

        $scope.changeGain = function () {
            gainNode.gain.value = $scope.gain;
        };


        // Speech
        //$scope.talk = function () {
        //    // $scope.speechSynth.text = $scope.speak;
        //    // speechSynthesis.speak($scope.speechSynth);
        //};

        // sequencer

        $scope.run = false;
        $scope.sequence = [
            {step: 1, freq: 262},
            {step: 2, freq: 294},
            {step: 3, freq: 262},
            {step: 4, freq: 294},

            {step: 5, freq: 330},
            {step: 6, freq: 349},
            {step: 7, freq: 330},
            {step: 8, freq: 349},

            {step: 9, freq: 392},
            {step: 10, freq: 440},
            {step: 11, freq: 392},
            {step: 12, freq: 349},

            {step: 13, freq: 330},
            {step: 14, freq: 330},
            {step: 15, freq: 330},
            {step: 16, freq: 330}
        ];


        $scope.nextStep = function (step) {
            if ($scope.stepper >= $scope.sequence.length) {
                $scope.stepper = 0;
                step = 0;
            }
            $scope.frequency = $scope.sequence[step].freq;
            $scope.changeFreq();

            if($scope.run === true){
                $scope.stepper++;

                window.setTimeout(function() {
                    $scope.nextStep($scope.stepper);
                },  (60000  / $scope.tempo) );
            }
        };

        $scope.play = function () {
            $scope.run = true;
            $timeout($scope.nextStep(0));
        };

// Accelerometer Data
//        window.addEventListener('devicemotion', function(e) {
//            var x = e.accelerationIncludingGravity.x;
//            var y = e.accelerationIncludingGravity.y;
//            var z = e.accelerationIncludingGravity.z;
//            console.log(e);
//            $scope.frequency = x * 30;
//            $scope.changeFreq();
//        });

        var midi, data;
        // request MIDI access
        navigator.requestMIDIAccess({
            sysex: false
        }).then(onMIDISuccess, onMIDIFailure);

        function onMIDISuccess(midiAccess) {
            var inputs = midiAccess.inputs.values();
            // loop over all available inputs and listen for any MIDI input
            for (var input = inputs.next();
                 input && !input.done;
                 input = inputs.next()) {
                // each time there is a midi message call the onMIDIMessage function
                input.value.onmidimessage = onMIDIMessage;
            }
        }
        function onMIDIMessage(message) {
            // this gives us our [command/channel, note, velocity] data.
            $scope.$apply(function () {


                switch (message.data[1]){
                    case 14:
                        $scope.frequency = Math.floor(( message.data[2] / 80 ) * 300) + 20;
                        $scope.changeFreq();
                        break;
                    case 15:
                        $scope.detune = Math.floor(( message.data[2] / 80 ) * 50);
                        $scope.changeFreq();
                        break;

                }


            });

        }
        function onMIDIFailure(error){console.log(error)}

    }])
    .controller('midiController',['$scope', function($scope) {

        var ctrl = this;
        $scope.output = "";
        $scope.red = 255;
        $scope.green = 255;
        $scope.blue = 255;
        $scope.top = 0;
        $scope.left = 0;


        var midi, data;
        // request MIDI access
        navigator.requestMIDIAccess({
            sysex: false
        }).then(onMIDISuccess, onMIDIFailure);

        function onMIDISuccess(midiAccess) {
            var inputs = midiAccess.inputs.values();
            // loop over all available inputs and listen for any MIDI input
            for (var input = inputs.next();
                     input && !input.done;
                     input = inputs.next()) {
                // each time there is a midi message call the onMIDIMessage function
                input.value.onmidimessage = onMIDIMessage;
            }
        }
        function onMIDIMessage(message) {
            // this gives us our [command/channel, note, velocity] data.
            $scope.$apply(function () {
                $scope.output = 'MIDI data: [' + message.data + ']';
                console.log('MIDI data', message.data); // MIDI data [144, 63, 73]


                console.log(message.data[2]);

                switch (message.data[1]){
                    case 2:
                        $scope.top = message.data[2];
                        break;
                    case 3:
                        $scope.left = message.data[2];
                        break;
                    case 4:
                        $scope.red = Math.floor(( message.data[2] / 80 ) * 255);
                        break;
                    case 5:
                        $scope.green = Math.floor(( message.data[2] / 80 ) * 255);
                        break;
                    case 6:
                        $scope.blue = Math.floor(( message.data[2] / 80 ) * 255);
                        break;
                }


            });

        }
        function onMIDIFailure(error){console.log(error)}
    }]);






