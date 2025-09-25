import 'phaser';
import Player from '../Sprites/Player';
import Portal from '../Sprites/Portal';
import Coins from '../Groups/Coins';
import Enemies from '../Groups/Enemies';
import Bullets from '../Groups/Bullets';


export default class GameScene extends Phaser.Scene {
  constructor (key) {
    super(key);
  }

  init (data) {
    this._LEVEL = data.level;
    this._LEVELS = data.levels;
    this._NEWGAME = data.newGame;
    this.loadingLevel = false;
    if (this._NEWGAME) this.events.emit('newGame');
  }

  create () {

    /*Audio de fondo*/
    var music = this.sound.add('theme');
    music.play();

    // listen for the resize event
    this.events.on('resize', this.resize, this);
    // listen for player input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // create our tilemap
    this.createMap();
    // create our player
    this.createPlayer();
    // creating the portal
    this.createPortal();
    // creating the coins
    this.coins = this.map.createFromObjects('Coins', 'Coin', { key: 'coin' });
    this.coinsGroup = new Coins(this.physics.world, this, [], this.coins);
    // creating the enemies
    this.enemies = this.map.createFromObjects('Enemies', 'Enemy', {});
    this.enemiesGroup = new Enemies(this.physics.world, this, [], this.enemies, this._LEVEL);
    // creating the bullets
    this.bullets = new Bullets(this.physics.world, this, []);

    // add collisions
    this.addCollisions();

    // update our camera
    this.cameras.main.startFollow(this.player);// animación al andar hacia la izquierda
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 10, end: 18 }),
      frameRate: 10,
      repeat: -1
    });

    // animación al no hacer nada
    this.anims.create({
      key: 'idle',
      frames: [{ key: 'player', frame: 19 }],
      frameRate: 20
    });

    // animación al andar hacia la derecha
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 28, end: 36 }),
      frameRate: 10,
      repeat: -1
    });

    // animación al andar hacia arriba
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    // animación al andar hacia abajo
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('player', { start: 19, end: 27 }),
      frameRate: 10,
      repeat: -1
    });
  }

  update() {
    this.player.update(this.cursors);

    // mover a la izquierda
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-230);
      this.player.anims.play('left', true);

      // mover a la derecha
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(230);
      this.player.anims.play('right', true);

      // mover arriba
    } else if (this.cursors.up.isDown) {
      this.player.setVelocityY(-230);
      this.player.anims.play('up', true);

      // mover arriba
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(230);
      this.player.anims.play('down', true);

      // animación de idle
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('idle');
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.bullets.fireBullet(this.player.x, this.player.y, this.player.direction);
    }

  }

  addCollisions () {
    this.physics.add.collider(this.player, this.blockedLayer);
    this.physics.add.collider(this.enemiesGroup, this.blockedLayer);
    this.physics.add.overlap(this.player, this.enemiesGroup, this.player.enemyCollision.bind(this.player));
    this.physics.add.overlap(this.player, this.portal, this.loadNextLevel.bind(this, false));
    this.physics.add.overlap(this.coinsGroup, this.player, this.coinsGroup.collectCoin.bind(this.coinsGroup));
    this.physics.add.overlap(this.bullets, this.enemiesGroup, this.bullets.enemyCollision);
  }

  createPlayer () {
    this.map.findObject('Player', (obj) => {
      if (this._NEWGAME && this._LEVEL === 1) {
        if (obj.type === 'StartingPosition') {
          this.player = new Player(this, obj.x, obj.y);
        }
      } else {
        this.player = new Player(this, obj.x, obj.y);
      }
    });
  }

  createPortal () {
    this.map.findObject('Portal', (obj) => {
      if (this._LEVEL === 1) {
        this.portal = new Portal(this, obj.x, obj.y - 68);
      } else if (this._LEVEL === 2) {
        this.portal = new Portal(this, obj.x, obj.y + 70);
      }
      
    });
  }

  resize (width, height) {
    if (width === undefined) {
      width = this.sys.game.config.width;
    }
    if (height === undefined) {
      height = this.sys.game.config.height;
    }
    this.cameras.resize(width, height);
  }

  createMap () {
    // add water background
    this.add.tileSprite(0, 0, 10000, 10000, 'RPGpack_sheet', 31);
    // create the tilemap
    this.map = this.make.tilemap({ key: this._LEVELS[this._LEVEL] });
    // add tileset image
    this.tiles = this.map.addTilesetImage('RPGpack_sheet');
    // create our layers
    this.backgroundLayer = this.map.createStaticLayer('Background', this.tiles, 0, 0);
    this.blockedLayer = this.map.createStaticLayer('Blocked', this.tiles, 0, 0);
    this.blockedLayer.setCollisionByExclusion([-1]);
  }

  //Cuando muere se pone la pantalla de color rojo

  loadNextLevel (endGame) {
    if (!this.loadingLevel) {
      this.cameras.main.fade(200, 200, 0, 0);
      this.cameras.main.on('camerafadeoutcomplete', () => {
        if (endGame) {
          this.scene.restart({ level: 1, levels: this._LEVELS, newGame: true });
        } else if (this._LEVEL === 1) {
          this.scene.restart({ level: 2, levels: this._LEVELS, newGame: false });
        } else if (this._LEVEL === 2) {
          this.scene.restart({ level: 1, levels: this._LEVELS, newGame: false });
        }
      });
      this.loadingLevel = true;
    }
  }
};
