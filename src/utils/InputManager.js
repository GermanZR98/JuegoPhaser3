/**
 * Modern Input Manager for enhanced control handling
 */
export class InputManager {
  constructor() {
    this.keys = new Map();
    this.gamepadSupport = true;
    this.touchSupport = 'ontouchstart' in window;
    this.lastGamepad = null;
    
    this.bindings = new Map([
      ['move-left', ['ArrowLeft', 'KeyA']],
      ['move-right', ['ArrowRight', 'KeyD']],
      ['move-up', ['ArrowUp', 'KeyW']],
      ['move-down', ['ArrowDown', 'KeyS']],
      ['action', ['Space', 'Enter']],
      ['pause', ['Escape', 'KeyP']],
      ['menu', ['KeyM']],
    ]);
    
    this.loadBindings();
    this.setupGamepadPolling();
  }

  /**
   * Load key bindings from localStorage
   */
  loadBindings() {
    try {
      const saved = localStorage.getItem('inputBindings');
      if (saved) {
        const data = JSON.parse(saved);
        this.bindings = new Map(data);
      }
    } catch (error) {
      console.warn('Could not load input bindings:', error);
    }
  }

  /**
   * Save key bindings to localStorage
   */
  saveBindings() {
    try {
      localStorage.setItem('inputBindings', JSON.stringify([...this.bindings]));
    } catch (error) {
      console.warn('Could not save input bindings:', error);
    }
  }

  /**
   * Set up gamepad polling
   */
  setupGamepadPolling() {
    if (this.gamepadSupport && 'getGamepads' in navigator) {
      this.gamepadInterval = setInterval(() => {
        this.checkGamepads();
      }, 16); // ~60fps
    }
  }

  /**
   * Check for gamepad input
   */
  checkGamepads() {
    const gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad) {
        this.processGamepadInput(gamepad);
        break; // Use first connected gamepad
      }
    }
  }

  /**
   * Process gamepad input
   */
  processGamepadInput(gamepad) {
    if (!gamepad.connected) return;
    
    this.lastGamepad = gamepad;
    
    // Process buttons
    const buttonMap = {
      0: 'action',      // A/Cross
      1: 'jump',        // B/Circle  
      2: 'secondary',   // X/Square
      3: 'menu',        // Y/Triangle
      9: 'pause',       // Start/Options
    };

    gamepad.buttons.forEach((button, index) => {
      const action = buttonMap[index];
      if (action && button.pressed) {
        this.triggerAction(action, 'gamepad', index);
      }
    });

    // Process axes (analog sticks)
    const leftX = gamepad.axes[0];
    const leftY = gamepad.axes[1];
    const threshold = 0.3;

    if (Math.abs(leftX) > threshold) {
      this.triggerAction(leftX > 0 ? 'move-right' : 'move-left', 'gamepad', leftX);
    }
    if (Math.abs(leftY) > threshold) {
      this.triggerAction(leftY > 0 ? 'move-down' : 'move-up', 'gamepad', leftY);
    }
  }

  /**
   * Trigger an action
   */
  triggerAction(action, source = 'keyboard', data = null) {
    const event = new CustomEvent('gameInput', {
      detail: {
        action,
        source,
        data,
        timestamp: Date.now(),
      },
    });
    
    window.dispatchEvent(event);
  }

  /**
   * Check if action is currently active
   */
  isActionActive(scene, action) {
    if (!scene || !scene.input) return false;
    
    const keys = this.bindings.get(action);
    if (!keys) return false;

    // Check keyboard
    for (const keyCode of keys) {
      const key = scene.input.keyboard.addKey(keyCode, false);
      if (key.isDown) return true;
    }

    // Check gamepad
    if (this.lastGamepad) {
      switch (action) {
        case 'move-left':
          return this.lastGamepad.axes[0] < -0.3;
        case 'move-right':
          return this.lastGamepad.axes[0] > 0.3;
        case 'move-up':
          return this.lastGamepad.axes[1] < -0.3;
        case 'move-down':
          return this.lastGamepad.axes[1] > 0.3;
        case 'action':
          return this.lastGamepad.buttons[0]?.pressed;
        case 'pause':
          return this.lastGamepad.buttons[9]?.pressed;
      }
    }

    return false;
  }

  /**
   * Get movement vector from input
   */
  getMovementVector(scene) {
    let x = 0;
    let y = 0;

    if (this.isActionActive(scene, 'move-left')) x -= 1;
    if (this.isActionActive(scene, 'move-right')) x += 1;
    if (this.isActionActive(scene, 'move-up')) y -= 1;
    if (this.isActionActive(scene, 'move-down')) y += 1;

    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
      const length = Math.sqrt(x * x + y * y);
      x /= length;
      y /= length;
    }

    return { x, y };
  }

  /**
   * Set up touch controls for mobile
   */
  setupTouchControls(scene) {
    if (!this.touchSupport || !scene) return;

    const { width, height } = scene.cameras.main;
    
    // Create virtual joystick
    const joystick = scene.add.graphics();
    joystick.setScrollFactor(0);
    joystick.setDepth(1000);
    
    // Create action button
    const actionButton = scene.add.circle(width - 80, height - 80, 40, 0x00ffff, 0.3);
    actionButton.setScrollFactor(0);
    actionButton.setDepth(1000);
    actionButton.setInteractive();
    
    actionButton.on('pointerdown', () => {
      this.triggerAction('action', 'touch');
    });

    return { joystick, actionButton };
  }

  /**
   * Bind new key to action
   */
  bindKey(action, keyCode) {
    const keys = this.bindings.get(action) || [];
    if (!keys.includes(keyCode)) {
      keys.push(keyCode);
      this.bindings.set(action, keys);
      this.saveBindings();
    }
  }

  /**
   * Unbind key from action
   */
  unbindKey(action, keyCode) {
    const keys = this.bindings.get(action) || [];
    const index = keys.indexOf(keyCode);
    if (index > -1) {
      keys.splice(index, 1);
      this.bindings.set(action, keys);
      this.saveBindings();
    }
  }

  /**
   * Get all bindings for an action
   */
  getBindings(action) {
    return [...(this.bindings.get(action) || [])];
  }

  /**
   * Get gamepad info
   */
  getGamepadInfo() {
    if (!this.lastGamepad) return null;
    
    return {
      id: this.lastGamepad.id,
      connected: this.lastGamepad.connected,
      buttons: this.lastGamepad.buttons.length,
      axes: this.lastGamepad.axes.length,
    };
  }

  /**
   * Enable/disable gamepad support
   */
  setGamepadSupport(enabled) {
    this.gamepadSupport = enabled;
    
    if (enabled && !this.gamepadInterval) {
      this.setupGamepadPolling();
    } else if (!enabled && this.gamepadInterval) {
      clearInterval(this.gamepadInterval);
      this.gamepadInterval = null;
    }
  }

  /**
   * Clean up resources
   */
  destroy() {
    if (this.gamepadInterval) {
      clearInterval(this.gamepadInterval);
      this.gamepadInterval = null;
    }
    
    this.keys.clear();
    this.bindings.clear();
  }
}