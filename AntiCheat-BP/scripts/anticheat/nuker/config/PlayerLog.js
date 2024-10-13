import { world } from "@minecraft/server";
// alrights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

export class PlayerLog {

  static data = null;

  constructor() {
    this.data = new Map();
    this.events = {
      playerLeave: world.afterEvents.playerLeave.subscribe((data) =>
        this.data.delete(data.playerName)
      ),
    };
  }

  set(player, value) {
    this.data.set(player.name, value);
  }

  get(player) {
    return this.data.get(player.name);
  }

  delete(player) {
    this.data.delete(player.name);
  }

  clear() {
    this.data.clear()
  }

  playerNames() {
    return this.data.keys();
  }
}
