const delay = new Tone.FeedbackDelay('8n', 0.8).chain(new Tone.Volume(-12), Tone.Master)
const filter = new Tone.Filter(1700, 'lowpass').connect(delay).toMaster()
const vibrato = new Tone.Vibrato ('4n', 0.15)
const synth = new Tone.Synth({
  volume: -12,
  portamento: 0.1,
  oscillator: {
    type: 'square'
  },
  envelope: {
    attack: 0.2,
    release: 1
  }
}).chain(vibrato, filter)

AFRAME.registerComponent('tone', {
  schema: {
    note: {
      type: 'string',
      default: 'C4'
    },
    duration: {
      type: 'string',
      default: '8n'
    }
  },
  init: function() {
    this.el.addEventListener('fusing', this.trigger.bind(this))
  },
  trigger: function() {
    synth.triggerAttackRelease(this.data.note, this.data.duration)
  },
  update: function() {},
  tick: function() {},
  remove: function() {},
  pause: function() {},
  play: function() {}
})
