import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Game configuration with modern features
export const GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  backgroundColor: '#1a1a2e',
  
  // Enhanced rendering
  render: {
    antialias: false,
    pixelArt: true,
    roundPixels: true,
  },
  
  // Modern physics configuration
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: process.env.NODE_ENV === 'development',
      debugShowBody: true,
      debugShowStaticBody: true,
      debugShowVelocity: true,
      debugVelocityColor: 0x00ff00,
      debugBodyColor: 0x0000ff,
      debugStaticBodyColor: 0xff0000,
    },
  },
  
  // Audio configuration
  audio: {
    disableWebAudio: false,
    context: false,
    noAudio: false,
  },
  
  // Input configuration
  input: {
    keyboard: true,
    mouse: true,
    touch: true,
    gamepad: true,
  },
  
  // Scale configuration for responsive design
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: {
      width: 480,
      height: 320,
    },
    max: {
      width: 1920,
      height: 1080,
    },
  },
  
  // Performance optimizations
  fps: {
    target: 60,
    forceSetTimeOut: false,
    deltaHistory: 10,
    panicMax: 120,
  },
  
  // WebGL pipeline configuration
  pipeline: {
    'MultiPipeline': Phaser.Renderer.WebGL.Pipelines.MultiPipeline,
  },
  
  // Banner configuration
  banner: {
    hidePhaser: false,
    text: '#00ffff',
    background: [
      '#1a1a2e',
      '#16213e',
      '#0f3460',
      '#533a7b',
    ],
  },
};

// Game state management
export const GameState = {
  score: 0,
  lives: 7,
  level: 1,
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    difficulty: 'normal', // easy, normal, hard
    language: 'es',
  },
  
  // Save state to localStorage
  save() {
    try {
      localStorage.setItem('phaserGameState', JSON.stringify(this));
    } catch (error) {
      console.warn('Could not save game state:', error);
    }
  },
  
  // Load state from localStorage
  load() {
    try {
      const saved = localStorage.getItem('phaserGameState');
      if (saved) {
        const data = JSON.parse(saved);
        Object.assign(this, data);
      }
    } catch (error) {
      console.warn('Could not load game state:', error);
    }
  },
  
  // Reset to defaults
  reset() {
    this.score = 0;
    this.lives = 7;
    this.level = 1;
    this.save();
  },
};

// Asset configuration
export const AssetConfig = {
  images: {
    player: 'assets/images/player.png',
    coin: 'assets/images/coin_01.png',
    bullet: 'assets/images/ballBlack_04.png',
    portal: 'assets/images/raft.png',
    enemy: 'assets/images/enemy.png',
    tileset: 'assets/images/RPGpack_sheet.png',
    characters: 'assets/images/roguelikeChar_transparent.png',
  },
  
  audio: {
    theme: 'assets/audio/fondo.mp3',
    collect: 'assets/audio/collect.wav',
    shoot: 'assets/audio/shoot.wav',
    hit: 'assets/audio/hit.wav',
  },
  
  tilemaps: {
    level1: 'assets/tilemaps/level1.json',
    level2: 'assets/tilemaps/level2.json',
  },
  
  spritesheets: {
    player: {
      path: 'assets/images/player.png',
      config: { frameWidth: 64, frameHeight: 64 },
    },
    tileset: {
      path: 'assets/images/RPGpack_sheet.png',
      config: { frameWidth: 64, frameHeight: 64 },
    },
    characters: {
      path: 'assets/images/roguelikeChar_transparent.png',
      config: { frameWidth: 17, frameHeight: 17 },
    },
  },
};

// Animation configurations
export const AnimationConfig = {
  player: {
    idle: {
      key: 'idle',
      frames: [{ key: 'player', frame: 19 }],
      frameRate: 20,
    },
    left: {
      key: 'left',
      frames: { start: 10, end: 18, first: 'player' },
      frameRate: 10,
      repeat: -1,
    },
    right: {
      key: 'right',
      frames: { start: 28, end: 36, first: 'player' },
      frameRate: 10,
      repeat: -1,
    },
    up: {
      key: 'up',
      frames: { start: 0, end: 8, first: 'player' },
      frameRate: 10,
      repeat: -1,
    },
    down: {
      key: 'down',
      frames: { start: 19, end: 27, first: 'player' },
      frameRate: 10,
      repeat: -1,
    },
  },
};

// Game constants
export const GameConstants = {
  PLAYER_SPEED: 160,
  BULLET_SPEED: 400,
  ENEMY_SPEED: 50,
  COINS_TO_WIN: 50,
  BONUS_COINS: 30,
  BONUS_LIVES: 3,
  
  COLORS: {
    PRIMARY: '#00ffff',
    SECONDARY: '#ff6b6b',
    SUCCESS: '#51cf66',
    WARNING: '#ffd43b',
    DANGER: '#ff6b6b',
    WHITE: '#ffffff',
    BLACK: '#000000',
  },
  
  AUDIO: {
    MASTER_VOLUME: 0.7,
    SFX_VOLUME: 0.8,
    MUSIC_VOLUME: 0.6,
  },
};

export default GameConfig;
