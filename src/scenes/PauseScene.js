import Phaser from 'phaser';
import { GameState, GameConstants } from '@config/config.js';

/**
 * Modern Pause Scene with settings and game state management
 */
export default class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Pause' });
    
    this.menuItems = [];
    this.selectedIndex = 0;
    this.overlay = null;
  }

  create() {
    this.createOverlay();
    this.createPauseMenu();
    this.setupInput();
    this.playPauseSound();
  }

  /**
   * Create semi-transparent overlay
   */
  createOverlay() {
    const { width, height } = this.cameras.main;
    
    this.overlay = this.add.graphics();
    this.overlay.fillStyle(0x000000, 0.7);
    this.overlay.fillRect(0, 0, width, height);
    
    // Animated breathing effect
    this.tweens.add({
      targets: this.overlay,
      alpha: { from: 0.7, to: 0.5 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Create pause menu
   */
  createPauseMenu() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Pause title
    const pauseTitle = this.add.text(centerX, centerY - 120, 'JUEGO PAUSADO', {
      fontSize: '36px',
      color: GameConstants.COLORS.PRIMARY,
      fontFamily: 'Arial, sans-serif',
      fontStyle: 'bold',
      stroke: GameConstants.COLORS.BLACK,
      strokeThickness: 2,
    }).setOrigin(0.5);
    
    // Animate title
    this.tweens.add({
      targets: pauseTitle,
      scale: { from: 1, to: 1.1 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    
    // Game stats
    this.createGameStats(centerX, centerY - 80);
    
    // Menu options
    const menuOptions = [
      { text: 'CONTINUAR', action: 'resume', icon: '▶️' },
      { text: 'REINICIAR NIVEL', action: 'restart', icon: '🔄' },
      { text: 'CONFIGURACIÓN', action: 'settings', icon: '⚙️' },
      { text: 'MENÚ PRINCIPAL', action: 'menu', icon: '🏠' },
    ];
    
    const startY = centerY - 20;
    
    this.menuItems = menuOptions.map((option, index) => {
      const y = startY + (index * 50);
      
      // Background
      const bg = this.add.graphics();
      bg.fillStyle(0x1a1a2e, 0.8);
      bg.lineStyle(2, GameConstants.COLORS.PRIMARY, 0);
      bg.fillRoundedRect(centerX - 120, y - 18, 240, 36, 8);
      bg.strokeRoundedRect(centerX - 120, y - 18, 240, 36, 8);
      
      // Text
      const text = this.add.text(centerX + 10, y, option.text, {
        fontSize: '18px',
        color: GameConstants.COLORS.WHITE,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      
      // Icon
      const icon = this.add.text(centerX - 80, y, option.icon, {
        fontSize: '16px',
      }).setOrigin(0.5);
      
      const menuItem = {
        bg,
        text,
        icon,
        action: option.action,
        index,
      };
      
      // Make interactive
      [bg, text, icon].forEach(obj => {
        obj.setInteractive({ useHandCursor: true });
        obj.on('pointerdown', () => this.selectMenuItem(index));
        obj.on('pointerover', () => this.hoverMenuItem(index));
        obj.on('pointerout', () => this.unhoverMenuItem(index));
      });
      
      return menuItem;
    });
    
    // Highlight first item
    this.highlightMenuItem(0);
    
    // Add controls hint
    this.add.text(centerX, height - 60, 'Usar ↑↓ para navegar • ENTER para seleccionar • ESC para continuar', {
      fontSize: '12px',
      color: '#888888',
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
  }

  /**
   * Create game statistics display
   */
  createGameStats(centerX, centerY) {
    const statsContainer = this.add.graphics();
    statsContainer.fillStyle(0x000000, 0.5);
    statsContainer.fillRoundedRect(centerX - 150, centerY - 25, 300, 50, 8);
    
    const statsText = [
      `Puntuación: ${GameState.score}`,
      `Nivel: ${GameState.level}`,
      `Vidas: ${GameState.lives}`,
    ].join('  •  ');
    
    this.add.text(centerX, centerY, statsText, {
      fontSize: '14px',
      color: GameConstants.COLORS.PRIMARY,
      fontFamily: 'Arial, sans-serif',
    }).setOrigin(0.5);
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
    this.input.keyboard.on('keydown-ESC', () => this.resumeGame());
    
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
            this.resumeGame();
            break;
        }
      });
    }
  }

  /**
   * Navigate menu
   */
  navigateMenu(direction) {
    this.selectedIndex += direction;
    
    if (this.selectedIndex < 0) this.selectedIndex = this.menuItems.length - 1;
    if (this.selectedIndex >= this.menuItems.length) this.selectedIndex = 0;
    
    this.highlightMenuItem(this.selectedIndex);
    this.playNavigationSound();
  }

  /**
   * Select current menu item
   */
  selectCurrentMenuItem() {
    this.selectMenuItem(this.selectedIndex);
  }

  /**
   * Select menu item
   */
  selectMenuItem(index) {
    const item = this.menuItems[index];
    if (!item) return;
    
    this.selectedIndex = index;
    this.highlightMenuItem(index);
    this.playSelectionSound();
    
    // Animation
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
    // Will be handled by highlightMenuItem when another item is selected
  }

  /**
   * Highlight menu item
   */
  highlightMenuItem(index) {
    this.menuItems.forEach((item, i) => {
      if (i === index) {
        // Highlight selected
        item.bg.clear();
        item.bg.fillStyle(0x1a1a2e, 0.8);
        item.bg.lineStyle(2, GameConstants.COLORS.PRIMARY, 1);
        item.bg.fillRoundedRect(item.bg.x, item.bg.y, 240, 36, 8);
        item.bg.strokeRoundedRect(item.bg.x, item.bg.y, 240, 36, 8);
        
        item.text.setColor(GameConstants.COLORS.PRIMARY);
        
        // Glow effect
        this.tweens.add({
          targets: item.text,
          alpha: { from: 0.8, to: 1 },
          duration: 500,
          yoyo: true,
          repeat: -1,
        });
      } else {
        // Reset others
        item.bg.clear();
        item.bg.fillStyle(0x1a1a2e, 0.8);
        item.bg.lineStyle(2, GameConstants.COLORS.PRIMARY, 0);
        item.bg.fillRoundedRect(
          this.cameras.main.width / 2 - 120,
          item.text.y - 18,
          240,
          36,
          8
        );
        item.bg.strokeRoundedRect(
          this.cameras.main.width / 2 - 120,
          item.text.y - 18,
          240,
          36,
          8
        );
        
        item.text.setColor(GameConstants.COLORS.WHITE);
        item.text.setAlpha(1);
        
        // Stop any tweens
        this.tweens.killTweensOf(item.text);
      }
    });
  }

  /**
   * Handle menu actions
   */
  handleMenuAction(action) {
    switch (action) {
      case 'resume':
        this.resumeGame();
        break;
      case 'restart':
        this.restartLevel();
        break;
      case 'settings':
        this.openSettings();
        break;
      case 'menu':
        this.goToMainMenu();
        break;
    }
  }

  /**
   * Resume the game
   */
  resumeGame() {
    if (window.game?.sceneManager) {
      window.game.sceneManager.resumeFromOverlay('Pause');
    } else {
      // Fallback
      this.scene.stop();
      this.scene.resume('Game');
    }
    
    this.playResumeSound();
  }

  /**
   * Restart current level
   */
  restartLevel() {
    // Reset lives for current level restart
    const currentLives = GameState.lives;
    GameState.lives = Math.max(1, currentLives - 1);
    GameState.save();
    
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('Game');
      this.scene.stop();
      this.scene.start('Game', {
        level: GameState.level,
        newGame: false,
        restart: true,
      });
    });
  }

  /**
   * Open settings (placeholder)
   */
  openSettings() {
    // TODO: Implement settings overlay
    console.info('Settings not yet implemented');
  }

  /**
   * Go to main menu
   */
  goToMainMenu() {
    // Save current state
    GameState.save();
    
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.stop('Game');
      this.scene.stop();
      this.scene.start('Menu');
    });
  }

  /**
   * Play pause sound
   */
  playPauseSound() {
    this.playSound('pause');
  }

  /**
   * Play navigation sound
   */
  playNavigationSound() {
    this.playSound('navigate');
  }

  /**
   * Play selection sound
   */
  playSelectionSound() {
    this.playSound('select');
  }

  /**
   * Play resume sound
   */
  playResumeSound() {
    this.playSound('resume');
  }

  /**
   * Play sound effect
   */
  playSound(type) {
    if (window.game?.audioManager) {
      // These would need to be loaded in BootScene
      switch (type) {
        case 'pause':
          // window.game.audioManager.playSound('pause', { volume: 0.3 });
          break;
        case 'navigate':
          // window.game.audioManager.playSound('menu_navigate', { volume: 0.2 });
          break;
        case 'select':
          // window.game.audioManager.playSound('menu_select', { volume: 0.4 });
          break;
        case 'resume':
          // window.game.audioManager.playSound('resume', { volume: 0.3 });
          break;
      }
    }
  }
}