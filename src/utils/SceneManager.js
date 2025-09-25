/**
 * Scene Manager for handling scene transitions and state
 */
export class SceneManager {
  constructor(game) {
    this.game = game;
    this.transitionDuration = 500;
    this.currentScene = null;
    this.sceneHistory = [];
    this.transitionInProgress = false;
  }

  /**
   * Transition to a new scene with effects
   */
  transitionTo(sceneKey, data = {}, transitionType = 'fade') {
    if (this.transitionInProgress) return false;
    
    this.transitionInProgress = true;
    this.currentScene = sceneKey;
    
    const activeScenes = this.game.scene.getScenes(true);
    
    switch (transitionType) {
      case 'fade':
        this.fadeTransition(activeScenes, sceneKey, data);
        break;
      case 'slide':
        this.slideTransition(activeScenes, sceneKey, data);
        break;
      case 'zoom':
        this.zoomTransition(activeScenes, sceneKey, data);
        break;
      default:
        this.instantTransition(activeScenes, sceneKey, data);
    }
    
    // Update history
    if (this.sceneHistory[this.sceneHistory.length - 1] !== sceneKey) {
      this.sceneHistory.push(sceneKey);
      if (this.sceneHistory.length > 10) {
        this.sceneHistory.shift();
      }
    }
    
    return true;
  }

  /**
   * Fade transition effect
   */
  fadeTransition(activeScenes, newSceneKey, data) {
    activeScenes.forEach(scene => {
      if (scene.scene.key !== 'UI') {
        scene.cameras.main.fadeOut(this.transitionDuration / 2, 0, 0, 0);
        
        scene.cameras.main.once('camerafadeoutcomplete', () => {
          this.game.scene.start(newSceneKey, data);
          this.game.scene.stop(scene.scene.key);
          
          setTimeout(() => {
            const newScene = this.game.scene.getScene(newSceneKey);
            if (newScene) {
              newScene.cameras.main.fadeIn(this.transitionDuration / 2, 0, 0, 0);
            }
            this.transitionInProgress = false;
          }, 100);
        });
      }
    });
  }

  /**
   * Slide transition effect
   */
  slideTransition(activeScenes, newSceneKey, data) {
    const direction = data.direction || 'left';
    const { width, height } = this.game.config;
    
    activeScenes.forEach(scene => {
      if (scene.scene.key !== 'UI') {
        let targetX = 0;
        let targetY = 0;
        
        switch (direction) {
          case 'left': targetX = -width; break;
          case 'right': targetX = width; break;
          case 'up': targetY = -height; break;
          case 'down': targetY = height; break;
        }
        
        scene.tweens.add({
          targets: scene.cameras.main,
          scrollX: targetX,
          scrollY: targetY,
          duration: this.transitionDuration,
          ease: 'Power2',
          onComplete: () => {
            this.game.scene.start(newSceneKey, data);
            this.game.scene.stop(scene.scene.key);
            this.transitionInProgress = false;
          },
        });
      }
    });
  }

  /**
   * Zoom transition effect
   */
  zoomTransition(activeScenes, newSceneKey, data) {
    activeScenes.forEach(scene => {
      if (scene.scene.key !== 'UI') {
        scene.tweens.add({
          targets: scene.cameras.main,
          zoom: 0,
          duration: this.transitionDuration / 2,
          ease: 'Power2',
          onComplete: () => {
            this.game.scene.start(newSceneKey, data);
            this.game.scene.stop(scene.scene.key);
            
            setTimeout(() => {
              const newScene = this.game.scene.getScene(newSceneKey);
              if (newScene) {
                newScene.cameras.main.setZoom(0);
                newScene.tweens.add({
                  targets: newScene.cameras.main,
                  zoom: 1,
                  duration: this.transitionDuration / 2,
                  ease: 'Power2',
                });
              }
              this.transitionInProgress = false;
            }, 100);
          },
        });
      }
    });
  }

  /**
   * Instant transition without effects
   */
  instantTransition(activeScenes, newSceneKey, data) {
    activeScenes.forEach(scene => {
      if (scene.scene.key !== 'UI') {
        this.game.scene.stop(scene.scene.key);
      }
    });
    
    this.game.scene.start(newSceneKey, data);
    this.transitionInProgress = false;
  }

  /**
   * Go back to previous scene
   */
  goBack(transitionType = 'fade') {
    if (this.sceneHistory.length > 1) {
      this.sceneHistory.pop(); // Remove current
      const previousScene = this.sceneHistory.pop(); // Get previous
      return this.transitionTo(previousScene, {}, transitionType);
    }
    return false;
  }

  /**
   * Pause current scene with overlay
   */
  pauseWithOverlay(overlaySceneKey = 'Pause') {
    if (this.currentScene && this.game.scene.isActive(this.currentScene)) {
      this.game.scene.pause(this.currentScene);
      this.game.scene.launch(overlaySceneKey);
      return true;
    }
    return false;
  }

  /**
   * Resume paused scene
   */
  resumeFromOverlay(overlaySceneKey = 'Pause') {
    if (this.currentScene && this.game.scene.isPaused(this.currentScene)) {
      this.game.scene.stop(overlaySceneKey);
      this.game.scene.resume(this.currentScene);
      return true;
    }
    return false;
  }

  /**
   * Get scene history
   */
  getHistory() {
    return [...this.sceneHistory];
  }

  /**
   * Get current scene
   */
  getCurrentScene() {
    return this.currentScene;
  }

  /**
   * Check if transition is in progress
   */
  isTransitioning() {
    return this.transitionInProgress;
  }

  /**
   * Set transition duration
   */
  setTransitionDuration(duration) {
    this.transitionDuration = Math.max(100, duration);
  }

  /**
   * Clear scene history
   */
  clearHistory() {
    this.sceneHistory = [];
  }
}