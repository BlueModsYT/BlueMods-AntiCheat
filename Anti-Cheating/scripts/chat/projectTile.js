import { Player, world } from "@minecraft/server";
// alrights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods.
world.afterEvents.projectileHitEntity.subscribe((data) => {
  if (data.getEntityHit()?.entity instanceof Player && data.source instanceof Player) {
    data.source.playSound("random.orb", {pitch: 0.5, volume:0.4});
  }
});
