# Creating a WebVR musical instrument using A-Frame & Tone.js

Web browsers are incredibly powerful today and have APIs for VR devices, 3D rendering, audio synthesis and MIDI I/O. On top of this, the Open Source community has built libraries to enhance these APIs and to help us get ideas out easier. I've been exploring Virtual Reality as a new medium for interacting and experiencing audio/visual art using WebVR. This tutorial will show you the basics of getting up and running with audio synthesis in WebVR.

#### A-Frame

[A-Frame](https://aframe.io) is a Virtual Reality framework for the web, built by the Mozilla VR Team. A-Frame handles the 3D and WebVR boilerplate required to get running across platforms including mobile, desktop, Vive, and Rift.

We will use A-Frame to create the VR scene and interface of our instrument.

#### Tone.js

[Tone.js](https://tonejs.github.io) is a WebAudio framework for creating interactive music in the browser. Tone's API is designed to be familiar to musicians, allowing control of note pitch & duration, timeline controls ( playback & bpm ), sequencing and audio routing. It also provides DSP modules to build your own synthesizers, effects, and complex control signals.

We'll use Tone to control the audio of our instrument, including the synthesizer, effects and routing.

#### What we will be making

We’re going to keep it simple and create a sort of 'Hello World' of A-Frame + Tone.js. We'll make rings that will each play a note, triggered on cursor hover. We’ll create our own A-Frame component that will contain our Tone.js logic.

## Getting Started

To start with, we’ll to set up a HTML page and import both A-Frame and Tone.js. Inside the body, we set up the A-Frame scene with a sky, camera and cursor.

```html
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <title>WebVR Musical Instrument</title>
  <!-- A-Frame CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/aframe/0.5.0/aframe.min.js" charset="utf-8"></script>
  <!-- Tone.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/0.10.0/Tone.min.js" charset="utf-8"></script>
</head>

<body>
  <!-- A-Frame scene -->
  <a-scene antialias="true">
    <!-- plain white background -->
    <a-sky color="white"></a-sky>
    <!-- our scene's camera -->
    <a-camera position="0 0 4" user-height="0" wasd-controls="enabled: false">
      <!-- cursor with fuse enabled, allowing us to detect when it hovers over an entity -->
      <a-cursor fuse="true"></a-cursor>
    </a-camera>

  </a-scene>
</body>

</html>
```

If you view this in your browser, you should see a white screen with a cursor and the 'Enter VR' button.

*A-Frame & Tone.js support modern browsers, but Chrome is recommended.*

## The Interface

Now for the interface of our instrument, we create an `<a-ring />` and set it's radius, color and segments-theta ( smooths out the edge ). We'll wrap it in an empty entity and rotate it backwards on the X axis.

The `synth` attribute references our synth component, which we will get to shortly.

```html
<!-- We wrap our three rings in an entity and rotate it backwards on the X axis -->
<a-entity id="interface" rotation="-45 0 0">
  <!-- The entity that will play the note -->
  <a-ring
    synth="note: A4"
    radius-inner="0.2"
    radius-outer="0.6"
    color="#212121"
    segments-theta="64"
  ></a-ring>
<a-entity>
```

#### Visual feedback

Now we want the ring to react when the cursor hovers over it. There are more than a few ways to achieve this, but the simplest is to add an `<a-animation>` that will begin when we hover over the ring.

Inside the ring, we add an `<a-animation>` and set it's `begin` attribute to the `fusing` event. The animation will instantly set the ring's opacity to 0.5 and fade it back in over 500ms.

```html
<a-ring
  synth="note: A4"
  radius-inner="0.2"
  radius-outer="0.6"
  color="#212121"
  segments-theta="64"
>
  <!-- This animation will be triggered when the cursor starts 'fusing' ( hovering ) -->
  <a-animation
    begin="fusing"
    attribute="opacity"
    dur="500"
    from="0.5"
    to="1"
  ></a-animation>
</a-ring>
```

## The Synthesizer

Our synth is going to be a custom A-Frame component. This will live in a `synth-component.js` that we will reference in our document `<head>` underneath our external libraries.

``` html
<head>
  <meta charset="utf-8">
  <title>WebVR Musical Instrument</title>
  <!-- A-Frame CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/aframe/0.5.0/aframe.min.js" charset="utf-8"></script>
  <!-- Tone.js CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/tone/0.10.0/Tone.min.js" charset="utf-8"></script>
  <!-- Our Synth Component -->
  <script src="synth-component.js" charset="utf-8"></script>
</head>
```

In `synth-component.js`, we will create a Tone.js Synth. We route the signal of the synth's output to master.

```js
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
}).toMaster() // connect the synth's output to the filter

// tell the synth to play a the note C3 for the duration of an eight note
synth.triggerAttackRelease('C3', '8n')
```

In your browser, the note should play on load.

#### Connecting to A-Frame

Now to tie it in to A-Frame, we will create an A-Frame component using `AFRAME.registerComponent()`. We attach a component to an entity and pass arguments using the component name as an attribute e.g. `<a-ring synth="note: A4" />`. Find more about components in the [A-Frame docs](https://aframe.io/docs/0.5.0/core/component.html).

Our synth component takes 2 arguments, note and duration. It triggers a synth note when the `fusing` event is activated.

```js
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
```

Now our ring entity will play a note when the cursor hovers over. Try changing the note or duration: `<a-ring synth="note: A4; duration: 1n" />` (*1n* is a whole note).

#### Adding effects

Tone.js comes with [heaps](https://tonejs.github.io/docs/) of built-in audio effects. Let's route the synth through a lowpass filter and send it to a delay effect.

```js
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
```

Take note of the routing changes. The `synth` is no longer connected directly to the master output. Instead, we connect it to `filter` using `connect(filter)`. The output of `filter` is sent to `delay` as well as the master output. We reduce the volume of `delay` by chaining it through a `Tone.Volume`, then to the master output.

## Adding more rings

Let's add more rings to our instrument. Inside our `#interface` entity, we'll add 2 more rings, each will have a larger radius and note. We'll copy the same opacity animation as a child of each ring.

```html
<!-- Ring 2 -->
<a-ring synth="note: E4" radius-inner="0.8" radius-outer="1.2" color="#212121" segments-theta="64">
  <a-animation begin="fusing" attribute="opacity" dur="500" from="0.5" to="1"></a-animation>
</a-ring>

<!-- Ring 3 -->
<a-ring synth="note: F3" radius-inner="1.4" radius-outer="1.8" color="#212121" segments-theta="64">
  <a-animation begin="fusing" attribute="opacity" dur="500" from="0.5" to="1"></a-animation>
</a-ring>
```

## Viewing in a VR Headset

If you are lucky enough to have access to a VR headset, check out [webvr.info](https://webvr.info) to make get your browser setup to work with the headset. I've tested this example in Chromium & Firefox Nightly with an Oculus Rift on Windows 10. Chromium reproduced it as expected, Firefox didn't seem to reproduce the opacity effect.

VR support in browsers is experimental at the time of writing, so you will probably run into inconsistencies across browsers and devices.

## What's next?

As it is, this instrument is pretty boring. It can only play 3 notes, has a delay effect, has no dynamic control and can only be interacted with the cursor. There are hundreds of interactive possibilities with VR, including touch/push, controller buttons, head position/rotation, hand position/rotation and microphone input. Then there are endless combinations of audio synthesis sound sources, effects, notes and rhythmic ideas. I hope this tutorial gets you started exploring and creating your own musical instruments in VR.
