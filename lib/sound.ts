let context: AudioContext | undefined;
export function playSound(correct: boolean) {
  try {
    if (localStorage.getItem('localwar-sound') !== 'true') return;
    context ??= new AudioContext();
    void context.resume();
    const notes = correct ? [523.25, 659.25, 783.99] : [220, 174.61];
    notes.forEach((frequency, i) => {
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();
      const t = context!.currentTime + i * 0.09;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.07, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      oscillator.connect(gain);
      gain.connect(context!.destination);
      oscillator.start(t);
      oscillator.stop(t + 0.31);
    });
  } catch {}
}
