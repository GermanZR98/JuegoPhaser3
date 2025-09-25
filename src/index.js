import 'core-js/stable';
import 'regenerator-runtime/runtime';
import Phaser from 'phaser';

// Import configurations and utilities
import { GameConfig, GameState } from '@config/config.js';

// Import scenes
import BootScene from '@scenes/BootScene.js';
import GameScene from '@scenes/GameScene.js';
import UIScene from '@scenes/UIScene.js';
import MenuScene from '@scenes/MenuScene.js';
import PauseScene from '@scenes/PauseScene.js';

// Import utilities
import { AudioManager } from '@utils/AudioManager.js';
import { InputManager } from '@utils/InputManager.js';
import { SceneManager } from '@utils/SceneManager.js';

/**
 * Modern Phaser 3 Game Class with enhanced features
 */
class ModernPhaserGame extends Phaser.Game {
  constructor() {
    super(GameConfig);
    
    this.initializeGame();
    this.setupEventListeners();
  }

  /**
   * Initialize game systems and scenes
   */
  initializeGame() {
    // Initialize game state
    GameState.load();
    
    // Add scenes to the game
    this.scene.add('Boot', BootScene);
    this.scene.add('Menu', MenuScene);
    this.scene.add('Game', GameScene);
    this.scene.add('UI', UIScene);
    this.scene.add('Pause', PauseScene);
    
    // Initialize managers
    this.audioManager = new AudioManager();
    this.inputManager = new InputManager();
    this.sceneManager = new SceneManager(this);
    
    // Start with boot scene
    this.scene.start('Boot');
    
    // Mark game as ready
    this.events.once('ready', () => {
      window.dispatchEvent(new Event('gameReady'));
      console.info('🎮 Modern Phaser Game initialized successfully!');
    });
  }

  /**
   * Setup event listeners for game management
   */
  setupEventListeners() {
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Handle visibility change (pause when tab not visible)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
    
    // Handle focus/blur for performance optimization
    window.addEventListener('focus', this.handleFocus.bind(this));
    window.addEventListener('blur', this.handleBlur.bind(this));
    
    // Handle errors gracefully
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
  }

  /**
   * Handle window resize with debouncing
   */
  handleResize() {
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    this.resizeTimeout = setTimeout(() => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      
      this.scale.resize(newWidth, newHeight);
      
      // Notify all scenes about resize
      this.scene.getScenes(true).forEach(scene => {
        if (scene.sys && scene.sys.events) {
          scene.sys.events.emit('resize', newWidth, newHeight);
        }
      });
    }, 100);
  }

  /**
   * Handle visibility change for performance optimization
   */
  handleVisibilityChange() {
    if (document.hidden) {
      this.audioManager?.pauseAll();
      // Optional: pause game if not already paused
      if (this.scene.isActive('Game') && !this.scene.isActive('Pause')) {
        this.scene.pause('Game');
        this.scene.launch('Pause');
      }
    } else {
      this.audioManager?.resumeAll();
    }
  }

  /**
   * Handle global keyboard shortcuts
   */
  handleGlobalKeydown(event) {
    switch (event.key) {
      case 'Escape':
        if (this.scene.isActive('Game')) {
          if (this.scene.isActive('Pause')) {
            this.scene.stop('Pause');
            this.scene.resume('Game');
          } else {
            this.scene.pause('Game');
            this.scene.launch('Pause');
          }
        }
        break;
        
      case 'F11':
        event.preventDefault();
        this.toggleFullscreen();
        break;
        
      case 'm':
      case 'M':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          this.audioManager?.toggleMute();
        }
        break;
    }
  }

  /**
   * Handle focus for performance optimization
   */
  handleFocus() {
    this.loop.sleep();
    this.loop.wake();
  }

  /**
   * Handle blur for performance optimization
   */
  handleBlur() {
    // Reduce frame rate when not focused
    this.loop.actualFps = 30;
  }

  /**
   * Handle errors gracefully
   */
  handleError(event) {
    console.error('Game Error:', event.error);
    // Could send to analytics service here
  }

  /**
   * Handle unhandled promise rejections
   */
  handleUnhandledRejection(event) {
    console.error('Unhandled Promise Rejection:', event.reason);
    // Could send to analytics service here
  }

  /**
   * Toggle fullscreen mode
   */
  toggleFullscreen() {
    if (this.scale.isFullscreen) {
      this.scale.stopFullscreen();
    } else {
      this.scale.startFullscreen();
    }
  }

  /**
   * Get current game statistics
   */
  getGameStats() {
    return {
      fps: Math.round(this.loop.actualFps),
      memory: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB' : 'N/A',
      uptime: Date.now() - this.loop.startTime,
      activeScenes: this.scene.getScenes(true).map(scene => scene.scene.key),
    };
  }

  /**
   * Clean up on game destruction
   */
  destroy(removeCanvas, noReturn) {
    // Save game state before destroying
    GameState.save();
    
    // Clear timeouts
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    document.removeEventListener('keydown', this.handleGlobalKeydown);
    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('error', this.handleError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
    
    super.destroy(removeCanvas, noReturn);
  }
}

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Create global game instance
  window.game = new ModernPhaserGame();
  
  // Enable debug mode in development
  if (process.env.NODE_ENV === 'development') {
    window.game.debug = true;
    window.GameState = GameState;
    
    // Add debug info to console
    console.info('🔧 Development mode enabled');
    console.info('🎮 Game instance available as window.game');
    console.info('💾 Game state available as window.GameState');
    
    // Log game stats periodically in development
    setInterval(() => {
      console.info('Game Stats:', window.game.getGameStats());
    }, 10000);
  }
});

// Export for potential use in other modules
export default ModernPhaserGame;
