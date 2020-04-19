import React, { useEffect } from 'react';
import QwertyHancock from 'qwerty-hancock';
import Pizzicato from 'pizzicato';
import oscClass from './oscClass';
import noiseOscClass from './noiseOscClass';
import chordAnalyzer from 'util/chordAnalyzer';
import pandaFaces from 'imgs/pandapics';

import {
  makeDistortionCurve,
  impulseResponse,
  calcFreq,
  noteFreqs,
  findWithAttr,
} from '../../util/util';

import OscController from 'components/OscController/OscController';
import ADSRController from 'components/ADSRController/ADSRController';
import FilterController from 'components/FilterController/FilterController';
import NoiseOscController from 'components/NoiseOscController/NoiseOscController';
import DistortionController from 'components/DistortionController/DistortionController';
import Distortion2Controller from 'components/Distortion2Controller/Distortion2Controller';
import DelayController from 'components/DelayController/DelayController';
import ReverbController from 'components/ReverbController/ReverbController';
import QuadrafuzzController from 'components/QuadrafuzzController/QuadrafuzzController';
import FlangerController from 'components/FlangerController/FlangerController';
import RingModulatorController from 'components/RingModulatorController/RingModulatorController';
import PingPongController from 'components/PingPongController/PingPongController';
import './Basic.scss';
const Basic = () => {
  const { panda1, panda2, panda3, panda4, panda5, panda6, panda7 } = pandaFaces;
  let currentPanda = panda7;
  const changeCurrentChordDisplay = (newPanda) => {
    console.log('changeCurrentChordDisplay: ', currentPanda);
    currentPanda = newPanda;
    const panda = document.getElementById('panda-display');
    panda.src = newPanda;
  };

  const updatePanda = (chord) => {
    if (chord.includes('7')) {
      changeCurrentChordDisplay(panda6);
    } else if (chord.includes('6')) {
      changeCurrentChordDisplay(panda5);
    } else if (chord.includes('sus')) {
      changeCurrentChordDisplay(panda4);
    } else if (chord.includes('dim')) {
      changeCurrentChordDisplay(panda3);
    } else if (chord.includes('mi') || chord.includes('minor')) {
      changeCurrentChordDisplay(panda2);
    } else if (chord.includes('ma') || chord.includes('major')) {
      changeCurrentChordDisplay(panda1);
    } else {
      changeCurrentChordDisplay(panda7);
    }
  };

  // const actx = new AudioContext();
  const actx = Pizzicato.context;

  //OSCILLATOR SETTINGS
  let attack = 1;
  let decay = 1;
  let sustain = 1;
  let release = 1;
  let initEnvelope = { attack, decay, sustain, release };

  let wavetable1 = 'sawtooth';
  let wavetable2 = 'sine';
  let subOscType = 'sine';
  let noiseType = 'white';

  let osc1Detune = 0;
  let osc2Detune = 0;
  let osc1OctaveOffset = '0';
  let osc2OctaveOffset = '0';

  let subOscOctaveOffset = '0';

  // let subOscVol = 0;
  let noiseOscVol = 0;

  const oscGain1 = actx.createGain();
  const oscGain2 = actx.createGain();
  const oscMasterGain1 = actx.createGain();
  const noiseGain = actx.createGain();
  const subGain = actx.createGain();
  const sourcesGain = actx.createGain();

  const subFilter = actx.createBiquadFilter();

  const distortion1 = actx.createWaveShaper();
  distortion1.curve = makeDistortionCurve(0, actx);

  const dist1WetGain = actx.createGain();
  const dist1DryGain = actx.createGain();
  dist1WetGain.gain.value = 0;
  dist1DryGain.gain.value = 1;
  const distortion1MixedGain = actx.createGain();

  const filter1 = actx.createBiquadFilter();
  filter1.dryWet = 1;
  const filter1WetGain = actx.createGain();
  const filter1DryGain = actx.createGain();
  filter1WetGain.gain.value = 1;
  filter1DryGain.gain.value = 0;
  const filter1MixedGain = actx.createGain();

  const distortion2 = new Pizzicato.Effects.Distortion();

  const quadrafuzzInitVals = {
    lowGain: 0.6,
    midLowGain: 0.8,
    midHighGain: 0.5,
    highGain: 0.6,
    mix: 0,
  };
  const quadrafuzz1 = new Pizzicato.Effects.Quadrafuzz(quadrafuzzInitVals);

  const flanger1InitVals = {
    time: 0.45,
    speed: 0.2,
    depth: 0.1,
    feedback: 0.1,
    mix: 0,
  };
  const flanger1 = new Pizzicato.Effects.Flanger(flanger1InitVals);

  const ringModulatorInitVals = {
    speed: 10,
    distortion: 4,
    mix: 0,
  };
  const ringModulator = new Pizzicato.Effects.RingModulator(
    ringModulatorInitVals
  );

  const pingPongDelayInitVals = {
    feedback: 0.6,
    time: 0.4,
    mix: 0,
  };
  const pingPongDelay = new Pizzicato.Effects.PingPongDelay(
    pingPongDelayInitVals
  );

  const delay1 = actx.createDelay(5.0);

  const reverbMixGainWet = actx.createGain();
  const reverbMixGainDry = actx.createGain();
  reverbMixGainWet.gain.value = 0.3;
  reverbMixGainDry.gain.value = 0.7;

  const reverbJoinGain = actx.createGain();

  const convolver1 = actx.createConvolver();
  const impulseBuffer = impulseResponse(4, 4, false, actx);
  convolver1.buffer = impulseBuffer;

  const compressor = actx.createDynamicsCompressor();
  const limiter = actx.createDynamicsCompressor();

  // // // CONNECTIONS // // //
  // // // CONNECTIONS // // //
  // // // CONNECTIONS // // //
  // // // CONNECTIONS // // //

  // SOURCES
  oscGain1.connect(oscMasterGain1);
  oscGain2.connect(oscMasterGain1);
  oscMasterGain1.connect(sourcesGain);
  noiseGain.connect(sourcesGain);

  // EFFECTS

  //WA distortion
  sourcesGain.connect(distortion1);
  sourcesGain.connect(dist1DryGain);
  distortion1.connect(dist1WetGain);
  dist1WetGain.connect(distortion1MixedGain);
  dist1DryGain.connect(distortion1MixedGain);
  distortion1MixedGain.connect(distortion2);

  distortion2.connect(quadrafuzz1);

  quadrafuzz1.connect(filter1);
  quadrafuzz1.connect(filter1DryGain);

  filter1.connect(filter1WetGain);
  filter1WetGain.connect(filter1MixedGain);
  filter1DryGain.connect(filter1MixedGain);
  filter1MixedGain.connect(flanger1);

  flanger1.connect(ringModulator);

  ringModulator.connect(compressor);

  subGain.connect(subFilter);
  subFilter.connect(compressor);

  compressor.connect(delay1);
  delay1.connect(convolver1);
  delay1.connect(reverbMixGainDry);

  convolver1.connect(reverbMixGainWet);

  reverbMixGainDry.connect(reverbJoinGain);
  reverbMixGainWet.connect(reverbJoinGain);

  reverbJoinGain.connect(limiter);

  limiter.connect(actx.destination);

  // // // FUNCTIONS // // //

  const changeFilter1Type = (val) => {
    filter1.type = val;
  };
  const changeFilter1Freq = (val) => {
    filter1.frequency.setValueAtTime(val, actx.currentTime);
  };
  const changeFilter1Q = (val) => {
    filter1.Q.setValueAtTime(val, actx.currentTime);
  };

  const changeFilter1Mix = (e) => {
    const numE = +e;
    const val = numE.toFixed(2);
    const newDryVal = ((100 - val) / 100).toFixed(2);
    filter1.dryWet = newDryVal;
    const newWetVal = (val / 100).toFixed(2);

    filter1DryGain.gain.setValueAtTime(newDryVal, actx.currentTime);
    filter1WetGain.gain.setValueAtTime(newWetVal, actx.currentTime);
  };

  const changeFilter1Gain = (e) => {
    const newVal = +e / 20;

    filter1.gain.setValueAtTime(newVal, actx.currentTime);
  };

  const detuneOsc1 = (e) => {
    osc1Detune = e;
  };
  const detuneOsc2 = (e) => {
    osc2Detune = e;
  };

  const mixGain = (e) => {
    oscGain1.gain.setValueAtTime(
      (100 - e.target.value) / 100,
      actx.currentTime
    );
    oscGain2.gain.setValueAtTime(e.target.value / 100, actx.currentTime);
  };

  const mixReverbGain = (e) => {
    let newDryVal;
    if (e < 100) {
      newDryVal = (100 - e) / 100;
    } else {
      newDryVal = 0;
    }

    reverbMixGainDry.gain.setValueAtTime(
      newDryVal.toFixed(2),
      actx.currentTime
    );
    reverbMixGainWet.gain.linearRampToValueAtTime(e / 100, actx.currentTime);
  };

  // const changeOscMasterGain1 = (e) => {
  //   oscMasterGain1.gain.linearRampToValueAtTime(
  //     e.target.value / 100,
  //     actx.currentTime
  //   );
  // };

  const changeWaveTable1 = (e) => {
    wavetable1 = e.target.value;
  };

  const changeWaveTable2 = (e) => {
    wavetable2 = e.target.value;
  };

  const changeWaveTableSub = (e) => {
    subOscType = e.target.value;
  };

  const changeNoiseType = (e) => {
    noiseType = e;
  };

  const changeOctaveOsc1 = (e) => {
    osc1OctaveOffset = e.target.value;
  };

  const changeOctaveOsc2 = (e) => {
    osc2OctaveOffset = e.target.value;
  };

  const changeOctaveSub = (e) => {
    subOscOctaveOffset = e.target.value;
  };

  const changeOsc1Gain = (e) => {
    oscGain1.gain.value = e;
  };
  const changeOsc2Gain = (e) => {
    oscGain2.gain.value = e;
  };

  const changeSubGain = (e) => {
    subGain.gain.value = e;
  };

  const changeNoiseGain = (e) => {
    noiseOscVol = e;
  };

  const changeDistortion1Amount = (e) => {
    distortion1.curve = makeDistortionCurve(e * 5, actx);
  };

  const changeDistortion1Mix = (e) => {
    const newWet = e / 100;
    const newDry = (100 - e) / 100;

    dist1DryGain.gain.setValueAtTime(newDry, actx.currentTime);
    dist1WetGain.gain.setValueAtTime(newWet, actx.currentTime);
  };

  const changeDistortion2Gain = (e) => {
    distortion2.gain = e;
  };

  const changeReverbDecay = (e) => {
    const newVal = e;
    const { durationVal, reverse } = convolver1.buffer;
    const newBuffer = impulseResponse(durationVal, newVal, reverse, actx);
    convolver1.buffer = newBuffer;
  };

  const changeReverbDuration = (e) => {
    const newVal = e;
    const { decayVal, reverse } = convolver1.buffer;
    const newBuffer = impulseResponse(newVal, decayVal, reverse, actx);
    convolver1.buffer = newBuffer;
  };

  const changeDelayTime = (e) => {
    delay1.delayTime.setValueAtTime(e.toFixed(1), actx.currentTime);
  };

  const changeADSR = (newVal, aspect) => {
    if (aspect === 'attack') {
      attack = newVal;
    } else if (aspect === 'decay') {
      decay = newVal;
    } else if (aspect === 'sustain') {
      sustain = newVal;
    } else if (aspect === 'release') {
      release = newVal;
    }
  };

  const changeQuadrafuzz = (prop, val) => {
    if (prop === 'mix') {
      quadrafuzz1.dryGainNode.gain.setValueAtTime(1 - val, actx.currentTime);
      quadrafuzz1.wetGainNode.gain.setValueAtTime(val, actx.currentTime);
    } else {
      quadrafuzz1[prop] = val;
    }
  };

  const changeFlanger1 = (prop, val) => {
    if (prop === 'mix') {
      flanger1.dryGainNode.gain.setValueAtTime(1 - val, actx.currentTime);
      flanger1.wetGainNode.gain.setValueAtTime(val, actx.currentTime);
    } else {
      flanger1[prop] = val;
    }
  };

  const changePizzicatoEffect = (effect, prop, val) => {
    if (prop === 'mix') {
      effect.dryGainNode.gain.setValueAtTime(1 - val, actx.currentTime);
      effect.wetGainNode.gain.setValueAtTime(val, actx.currentTime);
    } else {
      effect[prop] = val;
    }
  };

  const changeRingModulator = (prop, val) => {
    changePizzicatoEffect(ringModulator, prop, val);
  };

  const changePingPongDelay = (prop, val) => {
    changePizzicatoEffect(pingPongDelay, prop, val);
  };

  // CREATE KEYBOARD
  useEffect(() => {
    const keyboard = new QwertyHancock({
      id: 'keyboard',
      width: 400,
      height: 68,
      octaves: 1.4,
      startNote: 'C4',
      whiteKeyColour: 'black',
      blackKeyColour: 'white',
      activeColour: 'red',
    });
    let nodes = [];
    let notesForChordAnalysis = [];
    const chordDisplay = document.getElementById('chord-display');
    const pandaDisplay = document.getElementsByClassName('chord-panda');
    console.log('panda display: ', pandaDisplay);

    keyboard.keyDown = (note, freq) => {
      const envelope = { attack, decay, sustain, release };

      const osc1Freq = calcFreq(freq, osc1OctaveOffset);
      const osc2Freq = calcFreq(freq, osc2OctaveOffset);
      const subOscFreq = calcFreq(freq, subOscOctaveOffset - 1);

      const newOsc1 = new oscClass(
        actx,
        wavetable1,
        osc1Freq,
        osc1Detune,
        envelope,
        oscGain1,
        freq
      );
      const newOsc2 = new oscClass(
        actx,
        wavetable2,
        osc2Freq,
        osc2Detune,
        envelope,
        oscGain2,
        freq
      );

      const subOsc = new oscClass(
        actx,
        subOscType,
        subOscFreq,
        0,
        envelope,
        subGain,
        freq
      );

      const noiseOsc = new noiseOscClass(
        actx,
        noiseType,
        envelope,
        noiseGain,
        freq,
        noiseOscVol
      );

      nodes.push(newOsc1, newOsc2, subOsc, noiseOsc);

      // CHORD ANALYSIS

      const noteIndex = findWithAttr(noteFreqs, 'note', note);
      // it's minus 48 because the keyboard is set to start on C4 instead of C0
      notesForChordAnalysis.push(noteIndex - 48);
      const chordName = chordAnalyzer(notesForChordAnalysis);
      chordDisplay.innerHTML = chordName;
      // pandaDisplay.setAttribute('chord', chordName);
      // changeCurrentChordDisplay(chordName);
      updatePanda(chordName);
    };

    keyboard.keyUp = (note, freq) => {
      var new_nodes = [];
      for (var i = 0; i < nodes.length; i++) {
        if (Math.round(nodes[i].initialFreq) === Math.round(freq)) {
          nodes[i].stop(0);
        } else {
          new_nodes.push(nodes[i]);
        }
      }
      nodes = new_nodes;

      // CHORD ANALYSIS
      const noteIndex = findWithAttr(noteFreqs, 'note', note);
      const filteredNoteArray = notesForChordAnalysis.filter(
        // it's minus 48 because the keyboard is set to start on C4 instead of C0
        (item) => item !== noteIndex - 48
      );
      notesForChordAnalysis = [...filteredNoteArray];
      const chordName = chordAnalyzer(notesForChordAnalysis);
      // console.log('key UP chord name: ', chordName);
      if (chordName) {
        chordDisplay.innerHTML = chordName;
        // pandaDisplay.setAttribute('chord', chordName);
        // changeCurrentChordDisplay(chordName);
        updatePanda(chordName);
      } else {
        chordDisplay.innerHTML = '';
        // pandaDisplay.setAttribute('chord', '');
        // changeCurrentChordDisplay('');
        updatePanda('');
      }
    };
  }, []);

  return (
    <>
      <div className='main-grid'>
        <div className='main-grid-section-1'>
          <div className='flex'>
            <OscController
              name='osc 1'
              changeWaveTable={changeWaveTable1}
              changeOctaveOsc={changeOctaveOsc1}
              detuneOsc={detuneOsc1}
              changeGain={changeOsc1Gain}
              initVals={{
                wavetable: wavetable1,
                envelope: initEnvelope,
                offset: osc1OctaveOffset,
              }}
            />
            <OscController
              name='osc 2'
              changeWaveTable={changeWaveTable2}
              changeOctaveOsc={changeOctaveOsc2}
              detuneOsc={detuneOsc2}
              changeGain={changeOsc2Gain}
              initVals={{
                wavetable: wavetable2,
                envelope: initEnvelope,
                offset: osc2OctaveOffset,
              }}
            />
          </div>

          <div className='osc-mix center'>
            <div className='center inputcontainer'>
              <span className='oscname'>osc1</span>
              <input type='range' onChange={mixGain} />
              <span className='oscname'>osc2</span>
            </div>
          </div>

          <div className='flex'>
            <OscController
              name='sub osc'
              changeWaveTable={changeWaveTableSub}
              changeOctaveOsc={changeOctaveSub}
              changeGain={changeSubGain}
              initVals={{
                wavetable: subOscType,
                envelope: initEnvelope,
                offset: subOscOctaveOffset,
              }}
            />
            <NoiseOscController
              changeNoiseGain={changeNoiseGain}
              changeNoiseType={changeNoiseType}
              initGain={noiseOscVol}
            />
          </div>
        </div>
        <div className='main-grid-section-2'>
          <div className='section2-grid'>
            <div className='section2-grid-1'>
              <FilterController
                changeFilter1Type={changeFilter1Type}
                changeFilter1Freq={changeFilter1Freq}
                changeFilter1Q={changeFilter1Q}
                changeFilter1Mix={changeFilter1Mix}
                changeFilter1Gain={changeFilter1Gain}
                initParams={{
                  type: filter1.type,
                  frequency: filter1.frequency.value,
                  Q: filter1.Q.value,
                  mix: filter1.dryWet,
                  gain: filter1.gain.value,
                }}
              />
            </div>
            <div className='section2-grid-2'>
              <ADSRController
                changeADSR={changeADSR}
                initEnvelope={initEnvelope}
              />
            </div>
          </div>
          <div className='section2-grid-3'>
            <button onClick={changeCurrentChordDisplay}>
              changeCurrentChordDisplay
            </button>
            <div id='chord-panda' className='chord-panda'>
              <img
                src={currentPanda}
                alt='panda-display'
                id='panda-display'
                className='panda-display'
              />
            </div>
            <h6 id='chord-display' className='center chord-display'></h6>
          </div>
        </div>
        <div className='main-grid-section-3'>
          <div className='effect-rack'>
            <DistortionController
              initVals={{ amountVal: 0, mixVal: dist1WetGain.gain.value * 100 }}
              changeDistortion1Amount={changeDistortion1Amount}
              changeDistortion1Mix={changeDistortion1Mix}
            />
            <DelayController
              changeDelayTime={changeDelayTime}
              initVal={delay1.delayTime.value}
            />

            <ReverbController
              changeReverbDecay={changeReverbDecay}
              changeReverbDuration={changeReverbDuration}
              mixReverbGain={mixReverbGain}
              initVals={{
                ...convolver1.buffer,
                mixGain: reverbMixGainDry.gain.value,
              }}
            />
            <Distortion2Controller
              changeDistortion2Gain={changeDistortion2Gain}
              initVal={distortion2.gain}
            />
          </div>

          <div className='flex'>
            <QuadrafuzzController
              changeQuadrafuzz={changeQuadrafuzz}
              initVals={quadrafuzzInitVals}
            />

            <FlangerController
              initVals={flanger1InitVals}
              changeFlanger1={changeFlanger1}
            />
            <RingModulatorController
              initVals={ringModulatorInitVals}
              changeRingModulator={changeRingModulator}
            />
            <PingPongController
              initVals={pingPongDelayInitVals}
              changePingPongDelay={changePingPongDelay}
            />
          </div>
        </div>

        <div className='main-grid-section-4'>
          <div className='keyboard' id='keyboard' />
        </div>
      </div>
    </>
  );
};

export default Basic;
