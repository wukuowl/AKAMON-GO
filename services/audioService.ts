// Simple Web Audio API synth for 8-bit style SFX

let audioCtx: AudioContext | null = null;

const getContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// Generate White Noise Buffer for "Hit" sounds
const createNoiseBuffer = (ctx: AudioContext) => {
  const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
};

let noiseBuffer: AudioBuffer | null = null;

export const playSound = (type: 'attack' | 'hit' | 'faint' | 'win' | 'start') => {
  const ctx = getContext();
  
  // Browsers require user interaction to resume audio context
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const t = ctx.currentTime;
  const gain = ctx.createGain();
  gain.connect(ctx.destination);

  if (type === 'attack') {
    // Square wave slide (Classic "Pew" or "Tackle" charge)
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
    
    osc.connect(gain);
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    
    osc.start(t);
    osc.stop(t + 0.15);
  } 
  else if (type === 'hit') {
    // White noise burst (Classic "Crunch" impact)
    if (!noiseBuffer) noiseBuffer = createNoiseBuffer(ctx);
    
    const source = ctx.createBufferSource();
    source.buffer = noiseBuffer;
    
    // Lowpass filter to make it sound like a heavy hit
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, t);
    
    source.connect(filter);
    filter.connect(gain);
    
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    
    source.start(t);
    source.stop(t + 0.2);
  } 
  else if (type === 'faint') {
    // Slow descending triangle wave
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(50, t + 1);
    
    osc.connect(gain);
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0, t + 1);
    
    osc.start(t);
    osc.stop(t + 1);
  }
  else if (type === 'win') {
    // Simple Arpeggio
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.connect(gain);
    
    // Play a quick melody
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    notes.forEach((freq, i) => {
      osc.frequency.setValueAtTime(freq, t + i * 0.1);
    });
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.setValueAtTime(0, t + 0.6);
    
    osc.start(t);
    osc.stop(t + 0.6);
  }
};