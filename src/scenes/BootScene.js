import Phaser from 'phaser';
import { AssetConfig, GameState } from '@config/config.js';
import { AudioManager } from '@utils/AudioManager.js';

/**
 * Modern Boot Scene - Handles all asset loading with progress and error handling
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
    
    this.loadProgress = 0;
    this.loadText = null;
    this.progressBar = null;
    this.progressBox = null;
    this.assetText = null;
  }

  preload() {
    this.createLoadingScreen();
    this.setupLoadEvents();
    this.loadGameAssets();
  }

  /**
   * Create modern loading screen with progress indicators
   */
  createLoadingScreen() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;

    // Background
    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0, 0);

    // Title
    this.add.text(centerX, centerY - 150, 'AVENTURA PHASER 3', {
      fontSize: '32px',
      color: '#00ffff',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, centerY - 110, 'Versión Moderna y Refactorizada', {
      fontSize: '16px',
      color: '#888888',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // Progress box
    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222);
    this.progressBox.fillRoundedRect(centerX - 150, centerY - 25, 300, 50, 10);

    // Progress bar
    this.progressBar = this.add.graphics();

    // Progress text
    this.loadText = this.add.text(centerX, centerY, '0%', {
      fontSize: '18px',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // Asset loading text
    this.assetText = this.add.text(centerX, centerY + 50, 'Cargando recursos...', {
      fontSize: '14px',
      color: '#aaaaaa',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);

    // Loading tips
    const tips = [
      'Usa las flechas o WASD para moverte',
      'Presiona ESPACIO para disparar',
      'Recoge 50 monedas para ganar',
      'Evita a los enemigos rojos',
      'Presiona ESC para pausar',
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    this.add.text(centerX, height - 60, `💡 Tip: ${randomTip}`, {
      fontSize: '12px',
      color: '#666666',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
  }

  /**
   * Setup loading event listeners
   */
  setupLoadEvents() {
    this.load.on('progress', (value) => {
      this.updateProgress(value);
    });

    this.load.on('fileprogress', (file) => {
      this.updateAssetText(`Cargando: ${file.key}`);
    });

    this.load.on('complete', () => {
      this.updateAssetText('¡Carga completa!');
      this.handleLoadComplete();
    });

    this.load.on('loaderror', (file) => {
      console.error(`Error loading ${file.key}:`, file.src);
      this.updateAssetText(`Error cargando: ${file.key}`);
    });
  }

  /**
   * Load all game assets with modern asset management
   */
  loadGameAssets() {
    // Set base URL if needed
    // this.load.setBaseURL('https://your-cdn.com/');

    // Load tilemaps
    this.load.tilemapTiledJSON('level1', AssetConfig.tilemaps.level1);
    this.load.tilemapTiledJSON('level2', AssetConfig.tilemaps.level2);

    // Load spritesheets with configurations
    Object.entries(AssetConfig.spritesheets).forEach(([key, config]) => {
      this.load.spritesheet(key, config.path, config.config);
    });

    // Load single images
    Object.entries(AssetConfig.images).forEach(([key, path]) => {
      this.load.image(key, path);
    });

    // Load audio with multiple format support
    const audioFormat = AudioManager.getOptimalAudioFormat();
    Object.entries(AssetConfig.audio).forEach(([key, basePath]) => {
      const extension = basePath.split('.').pop();
      const pathWithoutExt = basePath.replace(`.${extension}`, '');
      
      // Try to load optimal format, fallback to original
      this.load.audio(key, [
        `${pathWithoutExt}.${audioFormat}`,
        basePath,
      ]);
    });

    // Load web fonts if needed
    this.loadWebFonts();

    // Set up level configurations
    this.setupLevelConfig();
  }

  /**
   * Load web fonts asynchronously
   */
  loadWebFonts() {
    // Use WebFont loader if you want custom fonts
    // For now, we'll use system fonts
  }

  /**
   * Setup level configurations
   */
  setupLevelConfig() {
    this.levelConfig = {
      levels: {
        1: {
          key: 'level1',
          name: 'Nivel 1: El Comienzo',
          difficulty: 'easy',
          coinsRequired: 25,
          enemyCount: 3,
        },
        2: {
          key: 'level2', 
          name: 'Nivel 2: El Desafío',
          difficulty: 'normal',
          coinsRequired: 50,
          enemyCount: 5,
        },
      },
      maxLevel: 2,
    };
  }

  /**
   * Update progress bar
   */
  updateProgress(value) {
    this.loadProgress = value;
    const percentage = Math.round(value * 100);
    
    // Update progress bar
    this.progressBar.clear();
    this.progressBar.fillStyle(0x00ffff);
    this.progressBar.fillRoundedRect(
      this.cameras.main.width / 2 - 145,
      this.cameras.main.height / 2 - 20,
      290 * value,
      40,
      8
    );

    // Update text
    this.loadText.setText(`${percentage}%`);
  }

  /**
   * Update asset loading text
   */
  updateAssetText(text) {
    if (this.assetText) {
      this.assetText.setText(text);
    }
  }

  /**
   * Handle load completion
   */
  handleLoadComplete() {
    // Small delay to show completion
    this.time.delayedCall(500, () => {
      // Initialize audio manager
      if (window.game?.audioManager) {
        this.initializeAudio();
      }

      // Transition to menu or game
      this.transitionToNext();
    });
  }

  /**
   * Initialize audio system
   */
  initializeAudio() {
    const audioManager = window.game.audioManager;
    
    // Register sounds
    if (this.sound.get('theme')) {
      audioManager.registerMusic('theme', this.sound.get('theme'));
    }
    
    // You can add more sound registrations here
  }

  /**
   * Transition to next scene
   */
  transitionToNext() {
    // Check if this is first time playing
    const isFirstTime = !GameState.score && GameState.level === 1;
    
    if (isFirstTime) {
      // Go to menu first
      this.scene.start('Menu', { 
        firstTime: true,
        levelConfig: this.levelConfig,
      });
    } else {
      // Continue previous game
      this.scene.start('Game', {
        level: GameState.level,
        newGame: false,
        levels: this.levelConfig.levels,
        levelConfig: this.levelConfig,
      });
    }
  }

  /**
   * Create scene with error handling
   */
  create() {
    try {
      // Emit ready event for main game class
      if (window.game) {
        window.game.events.emit('ready');
      }

      // Log successful boot
      console.info('🚀 Boot scene completed successfully');
      
    } catch (error) {
      console.error('Error in Boot scene create:', error);
      
      // Fallback: go directly to game
      this.scene.start('Game', {
        level: 1,
        newGame: true,
        levels: { 1: 'level1', 2: 'level2' },
      });
    }
  }
}
