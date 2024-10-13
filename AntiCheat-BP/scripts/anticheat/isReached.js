import {
  world,
  GameMode,
  Player
} from "@minecraft/server";
import main from "../commands/config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods.
const MAX_REACH_LIMIT = 6.5;

function getGamemode(player) {
  return Object.values(GameMode).find(
    (g) => [...world.getPlayers({ name: player.name, gameMode: g })].length
  );
}

function isReach(p1, p2) {
  return (
    Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 + (p1.z - p2.z) ** 2) >
    MAX_REACH_LIMIT
  );
}

world.afterEvents.entityHitEntity.subscribe((data) => {
  if (!(data.damagingEntity instanceof Player)) return;

  const player = data.damagingEntity;

  if (player.hasTag('owner')) return;
  if (player.hasTag('trusted')) return;
  if (player.hasTag(main.adminTag)) return; // check for admin tag
  if (getGamemode(player) == 'creative') return;

  if (data.hitEntity) {
    if (!isReach(player.location, data.hitEntity.location)) return;
  } else return;

  player.runCommandAsync(`damage @s 2 fall`);
  player.runCommandAsync(`playsound random.hurt @s`);
  player.sendMessage(`§7[§b#§7] §e${player.name} §creach hacks detected, please turn off your hacks to avoid ban`)
  // Notification for Admins
  world.getPlayers({ tags: ["notify"] }).forEach(admin => {
    admin.sendMessage(`§7[§d#§7] §e${player.name} §ais reach hacking, please spectate this user for evidence.`);
    admin.runCommandAsync(`playsound random.break @s`);
  });
});
    
