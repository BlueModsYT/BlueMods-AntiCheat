import { Player, world } from "@minecraft/server";

//░███░░██░░██░░█░████░██░░██░░████░░████░░░███░
//░█░░█░█░░░░█░░█░█░░░░██░░██░█░░░█░░█░░░█░█░░█░
//░███░░█░░░░█░░█░███░░██░░██░█░░░░█░█░░░█░██░░░
//░█░░█░█░░░░█░░█░█░░░░█░██░█░█░░░░█░█░░░█░░░█░░
//░█░░█░█░░█░█░░█░█░░█░█░██░█░█░░░█░░█░░░█░█░░█░
//░███░░████░███░░████░█░█░░█░░███░░░████░░███░░
// https://dsc.gg/bluemods

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
            "minecraft:ender_pearl",
            "minecraft:splash_potion"
        ];
        
        if (allowedProjectiles.includes(projectile) && source.gameMode !== "creative") {
            source.playSound("random.orb", { pitch: 0.5, volume: 0.4 });
        }
    }
});