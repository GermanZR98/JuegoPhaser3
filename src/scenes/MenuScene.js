import Phaser from 'phaser';
import { GameState, GameConstants } from '@config/config.js';

/**
 * Modern Main Menu Scene with animated UI and settings
 */
export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Menu' });
    
    this.menuItems = [];
    this.selectedIndex = 0;
    this.particleSystem = null;
  }

  init(data) {
    this.isFirstTime = data?.firstTime || false;
    this.levelConfig = data?.levelConfig || {};
  }

  create() {
    this.createBackground();
    this.createParticleEffects();
    this.createTitle();
    this.createMenu();
    this.createFooter();
    this.setupInput();
    this.startBackgroundMusic();
  }

  /**
   * Create animated background
   */
  createBackground() {
    const { width, height } = this.cameras.main;
    
    // Gradient background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533a7b, 1);
    bg.fillRect(0, 0, width, height);
    
    // Animated grid pattern
    this.createAnimatedGrid();
  }

  /**
   * Create animated grid background
   */
  createAnimatedGrid() {
    const { width, height } = this.cameras.main;
    const gridSize = 50;
    
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x00ffff, 0.1);
    
    // Draw vertical lines
    for (let x = 0; x < width; x += gridSize) {
      grid.moveTo(x, 0);
      grid.lineTo(x, height);
    }
    
    // Draw horizontal lines
    for (let y = 0; y < height; y += gridSize) {
      grid.moveTo(0, y);
      grid.lineTo(width, y);
    }
    
    grid.strokePath();
    
    // Animate grid
    this.tweens.add({
      targets: grid,
      alpha: { from: 0.1, to: 0.3 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Create particle effects
   */
  createParticleEffects() {
    const { width, height } = this.cameras.main;
    
    // Create floating particles
    const particles = this.add.particles(0, 0, 'coin', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      scale: { start: 0.1, end: 0.05 },
      alpha: { start: 0.8, end: 0.1 },
      speed: { min: 10, max: 30 },
      lifespan: 8000,
      quantity: 2,
      blendMode: 'ADD',
    });
    
    this.particleSystem = particles;
  }

  /**
   * Create animated title
   */
  createTitle() {
    const { width } = this.cameras.main;
    const centerX = width / 2;
    
    // Main title
    const title = this.add.text(centerX, 120, 'AVENTURA PHASER 3', {
      fontSize: '48px',
      color: GameConstants.COLORS.PRIMARY,
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: GameConstants.COLORS.BLACK,
      strokeThickness: 3,
    }).setOrigin(0.5);
    
    // Subtitle
    const subtitle = this.add.text(centerX, 170, 'Edición Moderna y Refactorizada', {
      fontSize: '18px',
      color: GameConstants.COLORS.WHITE,
      fontFamily: 'Arial, sans-serif',
      alpha: 0.8,
    }).setOrigin(0.5);
    
    // Animate title
    this.tweens.add({
      targets: title,
      scaleX: { from: 1, to: 1.05 },
      scaleY: { from: 1, to: 1.05 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Glow effect
    title.setPostPipeline('ColorMatrix');
    this.tweens.add({
      targets: title,
      duration: 3000,
      repeat: -1,
      yoyo: true,
      onUpdate: (tween) => {
        const progress = tween.progress;
        const intensity = 0.3 + (progress * 0.7);
        title.setTint(Phaser.Display.Color.Interpolate.ColorWithColor(
          { r: 0, g: 255, b: 255 },
          { r: 255, g: 255, b: 255 },
          1,
          intensity
        ));
      },
    });
  }

  /**
   * Create main menu
   */
  createMenu() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const startY = height / 2 - 20;
    
    const menuOptions = [
      { text: 'NUEVO JUEGO', action: 'newGame', icon: '🎮' },
      { text: 'CONTINUAR', action: 'continue', icon: '▶️', disabled: GameState.level === 1 && GameState.score === 0 },
      { text: 'CONFIGURACIÓN', action: 'settings', icon: '⚙️' },
      { text: 'CRÉDITOS', action: 'credits', icon: 'ℹ️' },
    ];
    
    this.menuItems = menuOptions.map((option, index) => {
      const y = startY + (index * 60);
      
      // Background for menu item
      const bg = this.add.graphics();
      bg.fillStyle(0x000000, 0.3);
      bg.fillRoundedRect(centerX - 150, y - 20, 300, 40, 10);
      bg.setAlpha(0);
      
      // Menu text
      const text = this.add.text(centerX - 10, y, option.text, {
        fontSize: '24px',
        color: option.disabled ? '#666666' : GameConstants.COLORS.WHITE,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      
      // Icon
      const icon = this.add.text(centerX - 100, y, option.icon, {
        fontSize: '20px',
      }).setOrigin(0.5);
      
      const menuItem = {
        bg,
        text,
        icon,
        action: option.action,
        disabled: option.disabled || false,
        index,
      };
      
      // Make interactive if not disabled
      if (!option.disabled) {
        [bg, text, icon].forEach(obj => {
          obj.setInteractive({ useHandCursor: true });
          obj.on('pointerdown', () => this.selectMenuItem(index));
          obj.on('pointerover', () => this.hoverMenuItem(index));
          obj.on('pointerout', () => this.unhoverMenuItem(index));
        });
      }
      
      return menuItem;
    });
    
    // Highlight first non-disabled item
    this.selectedIndex = this.menuItems.findIndex(item => !item.disabled);
    if (this.selectedIndex >= 0) {
      this.highlightMenuItem(this.selectedIndex);
    }
  }

  /**
   * Create footer information
   */
  createFooter() {
    const { width, height } = this.cameras.main;
    
    // Game stats
    if (GameState.score > 0) {
      const statsText = `Puntuación: ${GameState.score} | Nivel: ${GameState.level} | Vidas: ${GameState.lives}`;
      this.add.text(width / 2, height - 80, statsText, {
        fontSize: '16px',
        color: GameConstants.COLORS.PRIMARY,
        fontFamily: 'Arial, sans-serif',
      }).setOrigin(0.5);
    }
    
    // Controls info
    const controlsText = 'Usar ↑↓ o ratón para navegar • ENTER o Click para seleccionar • ESC para salir';
    this.add.text(width / 2, height - 30, controlsText, {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
    
    // Version info
    this.add.text(20, height - 20, 'v2.0.0 - Refactorizado', {
      fontSize: '10px',
      color: '#666666',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0, 1);
  }

  /**
   * Setup input handling
   */
  setupInput() {
    // Keyboard input
    this.input.keyboard.on('keydown-UP', () => this.navigateMenu(-1));
    this.input.keyboard.on('keydown-DOWN', () => this.navigateMenu(1));
    this.input.keyboard.on('keydown-ENTER', () => this.selectCurrentMenuItem());
    this.input.keyboard.on('keydown-SPACE', () => this.selectCurrentMenuItem());
    this.input.keyboard.on('keydown-ESC', () => this.handleEscape());
    
    // Gamepad support
    if (window.game?.inputManager) {
      window.addEventListener('gameInput', (event) => {
        const { action } = event.detail;
        switch (action) {
          case 'move-up':
            this.navigateMenu(-1);
            break;
          case 'move-down':
            this.navigateMenu(1);
            break;
          case 'action':
            this.selectCurrentMenuItem();
            break;
          case 'pause':
            this.handleEscape();
            break;
        }
      });
    }
  }

  /**
   * Navigate menu with keyboard/gamepad
   */
  navigateMenu(direction) {
    const enabledItems = this.menuItems.filter(item => !item.disabled);
    if (enabledItems.length === 0) return;
    
    const currentEnabledIndex = enabledItems.findIndex(item => item.index === this.selectedIndex);
    let newEnabledIndex = currentEnabledIndex + direction;
    
    if (newEnabledIndex < 0) newEnabledIndex = enabledItems.length - 1;
    if (newEnabledIndex >= enabledItems.length) newEnabledIndex = 0;
    
    this.selectedIndex = enabledItems[newEnabledIndex].index;
    this.highlightMenuItem(this.selectedIndex);
    
    // Play navigation sound
    this.playSound('navigate');
  }

  /**
   * Select current menu item
   */
  selectCurrentMenuItem() {
    this.selectMenuItem(this.selectedIndex);
  }

  /**
   * Handle menu item selection
   */
  selectMenuItem(index) {
    const item = this.menuItems[index];
    if (!item || item.disabled) return;
    
    this.selectedIndex = index;
    this.highlightMenuItem(index);
    
    // Play selection sound
    this.playSound('select');
    
    // Add selection animation
    this.tweens.add({
      targets: [item.text, item.icon],
      scale: { from: 1, to: 1.2 },
      duration: 150,
      yoyo: true,
      onComplete: () => {
        this.handleMenuAction(item.action);
      },
    });
  }

  /**
   * Handle menu item hover
   */
  hoverMenuItem(index) {
    this.selectedIndex = index;
    this.highlightMenuItem(index);
  }

  /**
   * Handle menu item unhover
   */
  unhoverMenuItem(index) {
    const item = this.menuItems[index];
    if (!item || item.disabled) return;
    
    this.tweens.add({
      targets: item.bg,
      alpha: 0,
      duration: 200,
    });
    
    item.text.setColor(GameConstants.COLORS.WHITE);
  }

  /**
   * Highlight menu item
   */
  highlightMenuItem(index) {
    // Reset all items
    this.menuItems.forEach((item, i) => {
      if (i !== index && !item.disabled) {
        item.bg.setAlpha(0);
        item.text.setColor(GameConstants.COLORS.WHITE);
      }
    });
    
    // Highlight selected item
    const item = this.menuItems[index];
    if (item && !item.disabled) {
      this.tweens.add({
        targets: item.bg,
        alpha: 0.5,
        duration: 200,
      });
      
      item.text.setColor(GameConstants.COLORS.PRIMARY);
    }
  }

  /**
   * Handle menu actions
   */
  handleMenuAction(action) {
    switch (action) {
      case 'newGame':
        this.startNewGame();
        break;
      case 'continue':
        this.continueGame();
        break;
      case 'settings':
        this.openSettings();
        break;
      case 'credits':
        this.showCredits();
        break;
    }
  }

  /**
   * Start new game
   */
  startNewGame() {
    GameState.reset();
    
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Game', {
        level: 1,
        newGame: true,
        levels: this.levelConfig.levels,
        levelConfig: this.levelConfig,
      });
    });
  }

  /**
   * Continue existing game
   */
  continueGame() {
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Game', {
        level: GameState.level,
        newGame: false,
        levels: this.levelConfig.levels,
        levelConfig: this.levelConfig,
      });
    });
  }

  /**
   * Open settings (placeholder for now)
   */
  openSettings() {
    // TODO: Implement settings scene
    console.info('Settings not yet implemented');
  }

  /**
   * Show credits (placeholder for now)
   */
  showCredits() {
    // TODO: Implement credits scene
    console.info('Credits not yet implemented');
  }

  /**
   * Handle escape key
   */
  handleEscape() {
    // Could close the game or show confirmation dialog
    console.info('ESC pressed in menu');
  }

  /**
   * Start background music
   */
  startBackgroundMusic() {
    if (window.game?.audioManager) {
      window.game.audioManager.playMusic('theme', {
        volume: 0.4,
        loop: true,
        fadeIn: 1000,
      });
    }
  }

  /**
   * Play UI sound effect
   */
  playSound(type) {
    if (window.game?.audioManager) {
      // These would need to be loaded in BootScene
      switch (type) {
        case 'navigate':
          // window.game.audioManager.playSound('menu_navigate', { volume: 0.3 });
          break;
        case 'select':
          // window.game.audioManager.playSound('menu_select', { volume: 0.5 });
          break;
      }
    }
  }

  /**
   * Clean up scene
   */
  destroy() {
    if (this.particleSystem) {
      this.particleSystem.destroy();
    }
    
    super.destroy();
  }
}