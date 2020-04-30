import io from "socket.io-client";
import Phaser from "phaser";
import { v4 } from "uuid";

import elfIdle1 from "./assets/elf_m_idle_anim_f0.png";
import elfIdle2 from "./assets/elf_m_idle_anim_f1.png";
import elfIdle3 from "./assets/elf_m_idle_anim_f2.png";
import elfIdle4 from "./assets/elf_m_idle_anim_f3.png";
import elfRun1 from "./assets/elf_m_run_anim_f0.png";
import elfRun2 from "./assets/elf_m_run_anim_f1.png";
import elfRun3 from "./assets/elf_m_run_anim_f2.png";
import elfRun4 from "./assets/elf_m_run_anim_f3.png";

class Cursors {
  constructor(scene) {
    this.wKey = scene.input.keyboard.addKey("W");
    this.aKey = scene.input.keyboard.addKey("A");
    this.sKey = scene.input.keyboard.addKey("S");
    this.dKey = scene.input.keyboard.addKey("D");
    this.cursorKeys = scene.input.keyboard.createCursorKeys();
  }

  isUpPressed() {
    return this.wKey.isDown || this.cursorKeys.up.isDown;
  }

  isDownPressed() {
    return this.sKey.isDown || this.cursorKeys.down.isDown;
  }

  isLeftPressed() {
    return this.aKey.isDown || this.cursorKeys.left.isDown;
  }

  isRightPressed() {
    return this.dKey.isDown || this.cursorKeys.right.isDown;
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: {
    preload,
    create,
    update,
  },
};

const game = new Phaser.Game(config);

const socket = io(`${location.hostname}:3000`);

let otherPlayers = [];
let player;
let cursors;
let scene;
let id;

function preload() {
  this.load.image("elfIdle1", elfIdle1);
  this.load.image("elfIdle2", elfIdle2);
  this.load.image("elfIdle3", elfIdle3);
  this.load.image("elfIdle4", elfIdle4);
  this.load.image("elfRun1", elfRun1);
  this.load.image("elfRun2", elfRun2);
  this.load.image("elfRun3", elfRun3);
  this.load.image("elfRun4", elfRun4);
}

function create() {
  id = v4();
  player = this.physics.add.sprite(50, 20, "elfIdle1"); // spawn at entrance
  // player = this.physics.add.sprite(250, 200, "elfIdle1"); // spawn at heart
  player.setOrigin(0.5, 1);
  player.setCollideWorldBounds(true);

  this.anims.create({
    key: "walk",
    frames: [
      { key: "elfRun1" },
      { key: "elfRun2" },
      { key: "elfRun3" },
      { key: "elfRun4" },
    ],
    frameRate: 8,
  });

  this.anims.create({
    key: "idle",
    frames: [
      { key: "elfIdle1" },
      { key: "elfIdle2" },
      { key: "elfIdle3" },
      { key: "elfIdle4" },
    ],
    frameRate: 8,
  });

  cursors = new Cursors(this);

  socket.on("player:move", (msg) => {
    const movedPlayer = otherPlayers.find((other) => other.id === msg.id);

    if (msg.id === id) {
      // this is our own message
      return;
    }

    if (!movedPlayer) {
      // if player doesn't already exist, create a new one
      otherPlayers.push({
        ...msg,
        instance: this.physics.add.sprite(msg.x, msg.y, "elfIdle1"),
      });
    } else {
      movedPlayer.instance.setPosition(msg.x, msg.y);
    }
  });
}

const RUN_SPEED = 150;
function update() {
  player.setVelocity(0);

  // this.physics.collide(player, colliders);

  if (cursors.isLeftPressed()) {
    player.setVelocityX(-RUN_SPEED);
  } else if (cursors.isRightPressed()) {
    player.setVelocityX(RUN_SPEED);
  }

  if (cursors.isUpPressed()) {
    player.setVelocityY(-RUN_SPEED);
  } else if (cursors.isDownPressed()) {
    player.setVelocityY(RUN_SPEED);
  }

  if (player.body.velocity.x !== 0 || player.body.velocity.y !== 0) {
    player.anims.play("walk", true);
    player.flipX = false;

    socket.emit("player:move", { id, x: player.x, y: player.y });
  } else {
    player.anims.stop("walk");
    player.setFrame(0);
  }

  if (player.body.velocity.x < 0) {
    player.flipX = true;
  }
}
