import { Player, world } from "@minecraft/server";

// all rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods.

world.afterEvents.projectileHitEntity.subscribe((data) => {
  const entityHit = data.getEntityHit()?.entity;
  const source = data.source;

  if (entityHit instanceof Player && source instanceof Player) {
    const projectile = data.projectile.typeId;

    const allowedProjectiles = [
      "minecraft:arrow",
      "minecraft:snowball",
      "minecraft:egg",
      "minecraft:thrown_trident",
      "minecraft:ender_pearl"
    ];

    if (allowedProjectiles.includes(projectile)) {
      source.playSound("random.orb", { pitch: 0.5, volume: 0.4 });
    }
  }
});
