/**
 * Notification Sound Service
 * Handles playing notification sounds when new notifications arrive
 */

class NotificationSoundService {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;
  private soundBuffer: AudioBuffer | null = null;

  constructor() {
    this.initializeAudioContext();
    this.createNotificationSound();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  private createNotificationSound() {
    if (!this.audioContext) return;

    try {
      // Create a pleasant notification sound (bell-like tone)
      const sampleRate = this.audioContext.sampleRate;
      const duration = 0.3; // 300ms
      const length = sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate a pleasant bell-like sound with multiple harmonics
      for (let i = 0; i < length; i++) {
        const time = i / sampleRate;
        const frequency1 = 800; // Main frequency
        const frequency2 = 1200; // Harmonic
        const frequency3 = 1600; // Higher harmonic
        
        // Combine multiple sine waves with envelope
        const envelope = Math.exp(-time * 8); // Decay envelope
        const wave1 = Math.sin(2 * Math.PI * frequency1 * time) * 0.5;
        const wave2 = Math.sin(2 * Math.PI * frequency2 * time) * 0.3;
        const wave3 = Math.sin(2 * Math.PI * frequency3 * time) * 0.2;
        
        data[i] = (wave1 + wave2 + wave3) * envelope * 0.3; // Keep volume moderate
      }

      this.soundBuffer = buffer;
    } catch (error) {
      console.warn('Failed to create notification sound:', error);
    }
  }

  public async playNotificationSound() {
    if (!this.isEnabled || !this.audioContext || !this.soundBuffer) {
      return;
    }

    try {
      // Resume audio context if it's suspended (required by some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.soundBuffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Set volume to be pleasant but not jarring
      gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
      
      source.start();
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public isAudioEnabled(): boolean {
    return this.isEnabled && !!this.audioContext && !!this.soundBuffer;
  }
}

// Create singleton instance
export const notificationSoundService = new NotificationSoundService();