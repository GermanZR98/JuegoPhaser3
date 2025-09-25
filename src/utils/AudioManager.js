/**
 * Modern Audio Manager for Phaser 3 Games
 * Handles all audio operations with modern features
 */
export class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.musicTracks = new Map();
    this.currentMusic = null;
    
    this.settings = {
      masterVolume: 0.7,
      sfxVolume: 0.8,
      musicVolume: 0.6,
      muted: false,
    };
    
    this.loadSettings();
  }

  /**
   * Load audio settings from localStorage
   */
  loadSettings() {
    try {
      const saved = localStorage.getItem('audioSettings');
      if (saved) {
        const data = JSON.parse(saved);
        Object.assign(this.settings, data);
      }
    } catch (error) {
      console.warn('Could not load audio settings:', error);
    }
  }

  /**
   * Save audio settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem('audioSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.warn('Could not save audio settings:', error);
    }
  }

  /**
   * Register a sound effect
   */
  registerSound(key, sound) {
    if (sound) {
      this.sounds.set(key, sound);
      this.updateSoundVolume(sound, this.settings.sfxVolume);
    }
  }

  /**
   * Register a music track
   */
  registerMusic(key, music) {
    if (music) {
      this.musicTracks.set(key, music);
      this.updateSoundVolume(music, this.settings.musicVolume);
    }
  }

  /**
   * Play a sound effect
   */
  playSound(key, config = {}) {
    if (this.settings.muted) return null;
    
    const sound = this.sounds.get(key);
    if (sound) {
      const volume = (config.volume || 1) * this.settings.sfxVolume * this.settings.masterVolume;
      return sound.play({
        volume,
        rate: config.rate || 1,
        detune: config.detune || 0,
        seek: config.seek || 0,
        loop: config.loop || false,
        delay: config.delay || 0,
      });
    }
    console.warn(`Sound '${key}' not found`);
    return null;
  }

  /**
   * Play music with fade in/out support
   */
  playMusic(key, config = {}) {
    if (this.settings.muted && !config.force) return null;
    
    const music = this.musicTracks.get(key);
    if (!music) {
      console.warn(`Music '${key}' not found`);
      return null;
    }

    // Stop current music if different
    if (this.currentMusic && this.currentMusic !== music) {
      this.stopMusic(config.fadeOut || 1000);
    }

    this.currentMusic = music;
    const volume = (config.volume || 1) * this.settings.musicVolume * this.settings.masterVolume;
    
    // Play with fade in if specified
    if (config.fadeIn) {
      music.play({
        volume: 0,
        loop: config.loop !== false,
      });
      
      music.scene.tweens.add({
        targets: music,
        volume: volume,
        duration: config.fadeIn,
        ease: 'Power2',
      });
    } else {
      music.play({
        volume,
        loop: config.loop !== false,
      });
    }

    return music;
  }

  /**
   * Stop current music with fade out support
   */
  stopMusic(fadeOut = 0) {
    if (!this.currentMusic) return;

    if (fadeOut > 0) {
      this.currentMusic.scene.tweens.add({
        targets: this.currentMusic,
        volume: 0,
        duration: fadeOut,
        ease: 'Power2',
        onComplete: () => {
          if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
          }
        },
      });
    } else {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  /**
   * Pause all audio
   */
  pauseAll() {
    this.sounds.forEach(sound => {
      if (sound.isPlaying) {
        sound.pause();
      }
    });
    
    if (this.currentMusic && this.currentMusic.isPlaying) {
      this.currentMusic.pause();
    }
  }

  /**
   * Resume all audio
   */
  resumeAll() {
    this.sounds.forEach(sound => {
      if (sound.isPaused) {
        sound.resume();
      }
    });
    
    if (this.currentMusic && this.currentMusic.isPaused) {
      this.currentMusic.resume();
    }
  }

  /**
   * Stop all audio
   */
  stopAll() {
    this.sounds.forEach(sound => {
      if (sound.isPlaying) {
        sound.stop();
      }
    });
    
    this.stopMusic();
  }

  /**
   * Toggle mute state
   */
  toggleMute() {
    this.settings.muted = !this.settings.muted;
    
    if (this.settings.muted) {
      this.pauseAll();
    } else {
      this.resumeAll();
    }
    
    this.saveSettings();
    return this.settings.muted;
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume) {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.saveSettings();
  }

  /**
   * Set SFX volume
   */
  setSfxVolume(volume) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach(sound => {
      this.updateSoundVolume(sound, this.settings.sfxVolume);
    });
    this.saveSettings();
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume) {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    this.musicTracks.forEach(music => {
      this.updateSoundVolume(music, this.settings.musicVolume);
    });
    this.saveSettings();
  }

  /**
   * Update sound volume considering master volume
   */
  updateSoundVolume(sound, baseVolume) {
    if (sound && !this.settings.muted) {
      sound.setVolume(baseVolume * this.settings.masterVolume);
    }
  }

  /**
   * Update all volumes
   */
  updateAllVolumes() {
    this.sounds.forEach(sound => {
      this.updateSoundVolume(sound, this.settings.sfxVolume);
    });
    
    this.musicTracks.forEach(music => {
      this.updateSoundVolume(music, this.settings.musicVolume);
    });
  }

  /**
   * Get current settings
   */
  getSettings() {
    return { ...this.settings };
  }

  /**
   * Preload audio with better format support
   */
  static getOptimalAudioFormat() {
    const audio = document.createElement('audio');
    
    if (audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '')) {
      return 'ogg';
    } else if (audio.canPlayType('audio/mpeg;').replace(/^no$/, '')) {
      return 'mp3';
    } else if (audio.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '')) {
      return 'wav';
    } else if (audio.canPlayType('audio/x-m4a;').replace(/^no$/, '')) {
      return 'm4a';
    }
    
    return 'mp3'; // fallback
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.stopAll();
    this.sounds.clear();
    this.musicTracks.clear();
    this.currentMusic = null;
  }
}