import 'phaser';

var coinsCollected;
var vida;
var ayuda = "Ayuda: 30 estrellas +3 de vida";
var ayudacomp = "Completado, +3 de vida.";
var objetivo = "Consigue 50 monedas para ganar.";

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UI', active: true });
  }

  init() {
    coinsCollected = 0;
    vida = 0;
  }

  create() {
    // create score text
    this.scoreText = this.add.text(12, 40, `Estrellas: ${coinsCollected}`, { fontSize: '32px', fill: '#fff' });
    // objetivos
    this.objText = this.add.text(550, 12, `${objetivo}`, { fontSize: '45px', fill: '#CF3476' });
    // create health text
    this.healthText = this.add.text(12, 12, `Vidas: 7`, { fontSize: '32px', fill: '#fff' });
    this.consejo = this.add.text(12, 70, `${ayuda}`, { fontSize: '32px', fill: '#57A639' });
    


    // get a reference to the game scene
    this.gameScene = this.scene.get('Game');

    // listen for events from that scene
    this.gameScene.events.on('coinCollected', (health) => {
      {
        coinsCollected++;
        if (coinsCollected > 29) {
          health += 3;
          this.consejo.setText(`${ayudacomp}`);
        }

        this.scoreText.setText(`Estrellas: ${coinsCollected}`);
        this.healthText.setText(`Vidas: ${health}`);
      }
      // Vaciar el consejo.
      {
        if (coinsCollected > 30) {
          this.consejo.setText(``);
        }
      }
      // FIN DEL JUEGO
      {
        if (coinsCollected > 49) {
          this.scoreText.setText(``);
          this.consejo.setText(``);
          this.objText.setText(``);
          this.healthText.setText(``);
          this.win = this.add.text(700, 400, `HAS GANADO!!!!!`, { fontSize: '70px', fill: '#FF2301' });
        }
      }
    });

    this.gameScene.events.on('loseHealth', (health) => {
      this.healthText.setText(`Vidas: ${health}`);
    });

    this.gameScene.events.on('newGame', () => {
      coinsCollected = 0;
      vida = 7;
      this.scoreText.setText(`Estrellas: ${coinsCollected}`);
      this.healthText.setText(`Vidas: ${vida}`);
      this.consejo.setText(`${ayuda}`);
      this.objText.setText(`${objetivo}`);
    });
  }
};
