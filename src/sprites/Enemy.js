import 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor (scene, x, y, frame, levels) {
    super(scene, x, y, 'enemigo', frame);
    this.scene = scene;
    this.health = 2;
    this.escala1 = 0.035;
    this.escala2 = 0.2;
    this.levels=levels;


    // enable physics
    this.scene.physics.world.enable(this);
    // add our player to the scene
    this.scene.add.existing(this);
    // scale our player
    console.log(this.levels);
    if (this.levels==1) {
    this.setScale(this.escala1);
    } else {
      this.setScale(this.escala2);
    }

    // move our enemy
    this.timeEvent = this.scene.time.addEvent({
      delay: 600,
      callback: this.move,
      loop: true,
      callbackScope: this
    });
  }

  loseHealth () {
    this.health--;
    this.tint = 0xff0000;
    if (this.health === 0) {
      this.timeEvent.destroy();
      this.destroy();
    } else {
      this.scene.time.addEvent({
        delay: 200,
        callback: () => {
          this.tint = 0xffffff;
        }
      });
    }
  }

  move () {
    const randNumber = Math.floor((Math.random() * 4) + 1);
    switch (randNumber) {
      case 1:
        this.setVelocityX(300);
        break;
      case 2:
        this.setVelocityX(-300);
        break;
      case 3:
        this.setVelocityY(300);
        break;
      case 4:
        this.setVelocityY(-300);
        break;
      default:
        this.setVelocityX(300);
    }

    this.scene.time.addEvent({
      delay: 500,
      callback: () => {
        if (this.active) this.setVelocity(0);
      },
      callbackScope: this
    });
  }
}