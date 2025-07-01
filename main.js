
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: { default: 'arcade', arcade: { gravity: { y: 600 }, debug: false } },
  scene: { preload, create, update }
};
const game = new Phaser.Game(config);

let player, cursors, spaceKey, enemies, healthText, health = 3, level = 1;

function preload() {
  this.load.image('platform', 'assets/platform.png');
  this.load.image('enemy', 'assets/enemy.png');
  this.load.spritesheet('zacky', 'assets/zacky.png', { frameWidth: 32, frameHeight:48 });
}

function create() {
  const ground = this.physics.add.staticGroup();
  ground.create(400,580,'platform').setScale(2).refreshBody();

  player = this.physics.add.sprite(100,450,'zacky');
  player.setBounce(0.2).setCollideWorldBounds(true);
  this.physics.add.collider(player, ground);

  this.anims.create({ key:'left', frames: this.anims.generateFrameNumbers('zacky',{start:0,end:3}), frameRate:10, repeat:-1 });
  this.anims.create({ key:'right', frames: this.anims.generateFrameNumbers('zacky',{start:5,end:8}), frameRate:10, repeat:-1 });
  this.anims.create({ key:'turn', frames:[{key:'zacky', frame:4}], frameRate:20 });

  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  enemies = this.physics.add.group();
  spawnEnemies(this);

  this.physics.add.collider(enemies, ground);
  this.physics.add.overlap(player, enemies, handleHit, null, this);

  healthText = this.add.text(16,16,'Nyawa: 3',{ fontSize:'24px', fill:'#fff' });
}

function update() {
  if (cursors.left.isDown) { player.setVelocityX(-160); player.anims.play('left', true); }
  else if (cursors.right.isDown) { player.setVelocityX(160); player.anims.play('right', true); }
  else { player.setVelocityX(0); player.anims.play('turn'); }

  if (cursors.up.isDown && player.body.touching.down) player.setVelocityY(-350);

  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    const slash = enemies.getChildren().filter(e => Math.abs(e.x - player.x) < 60 && Math.abs(e.y - player.y) < 30);
    slash.forEach(e=>{ e.destroy(); });
    if (slash.length > 0) this.add.text(player.x, player.y-40, 'Slash!', { fontSize:'16px', fill:'#ff0' });
    checkLevelUp(this);
  }
}

function spawnEnemies(scene) {
  const count = level * 3;
  for (let i=0; i<count; i++) {
    const x = Phaser.Math.Between(200, 750);
    const enemy = enemies.create(x, 0, 'enemy');
    enemy.setBounce(0.2);
  }
}

function handleHit(player, enemy) {
  enemy.destroy();
  health--;
  healthText.setText('Nyawa: ' + health);
  if (health <= 0) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    this.add.text(300,250,'GAME OVER',{ fontSize:'48px', fill:'#f00' });
  }
}

function checkLevelUp(scene) {
  if (enemies.countActive(true) === 0) {
    level++;
    this.add.text(300,250,'LEVEL '+(level-1)+' Selesai!',{ fontSize:'32px', fill:'#0f0' });
    this.time.delayedCall(1500, () => spawnEnemies(scene), [], scene);
  }
}
        