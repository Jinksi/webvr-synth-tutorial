// a FeedbackDelay effect, repeating every eighth note with 80% feedback
const delay = new Tone.FeedbackDelay('8n', 0.8)
  // chained into a Volume set to -12dB then to the Master output
  .chain(new Tone.Volume(-12), Tone.Master)

// a lowpass Filter with a frequency of 1500 Hz
const filter = new Tone.Filter(1500, 'lowpass')
  // the signal is sent to the Delay as well as Master
  .connect(delay).toMaster()

// The synth
const synth = new Tone.Synth({
  volume: -12, // the oscillator volume set to -12dB
  oscillator: {
    type: 'square' // oscillator type to square wave
  },
  envelope: {
    attack: 0.02, // envelope attack set to 20ms
    release: 1 // envelope release set to 1s
  }
}).connect(filter) // connect the synth's output to the filter

// Our customer synth component
AFRAME.registerComponent('synth', {
  // The schema defines arguments accepted by this component
  schema: {
    // The note / octave
    note: {
      type: 'string',
      default: 'C4'
    },
    // The duration: 8n describes an eighth note
    duration: {
      type: 'string',
      default: '8n'
    }
  },
  init: function() {
    // setup the fusing/hover event listener
    // this.el refers to the entity
    console.log('init')
    this.el.addEventListener('fusing', this.trigger.bind(this))
  },
  trigger: function() {
    // trigger a note on the synth
    // this.data refers to the arguments defined
    synth.triggerAttackRelease(this.data.note, this.data.duration)
  },
  update: function() {},
  tick: function() {},
  remove: function() {},
  pause: function() {},
  play: function() {}
})
