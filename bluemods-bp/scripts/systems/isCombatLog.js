import { world, system } from "@minecraft/server";
import main from "../commands/config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

const COMBAT_COOLDOWN = 10;
const combatPlayers = new Map();

world.afterEvents.entityHitEntity.subscribe(({ damagingEntity, hitEntity }) => {
    if (!(damagingEntity.typeId === "minecraft:player" && hitEntity.typeId === "minecraft:player")) return;

    updateCombatStatus(damagingEntity);
    updateCombatStatus(hitEntity);
});

function updateCombatStatus(player) {
    if (combatPlayers.has(player.id)) {
        system.clearRun(combatPlayers.get(player.id));
    }

    const timerId = system.runTimeout(() => {
        combatPlayers.delete(player.id);
        player.sendMessage("§bBlueMods §7>> §aYou're now safe from combat log");
    }, COMBAT_COOLDOWN * 20);

    combatPlayers.set(player.id, timerId);
    player.sendMessage("§bBlueMods §7>> §cYou are now in combat! Logging out will kill you!");
}

world.beforeEvents.playerLeave.subscribe(({ playerId }) => {
    const player = [...world.getPlayers()].find(p => p.id === playerId);
    if (!player || !combatPlayers.has(playerId)) return;

    player.runCommand("kill @s");
    combatPlayers.delete(playerId);
    
    world.getPlayers().forEach(p => {
        if (combatPlayers.has(p.id)) {
            p.sendMessage(`§c${player.name} logged out during combat and was killed!`);
        }
    });
});

system.runInterval(() => {
    const now = Date.now();
    const players = world.getPlayers();
    
    const onlineIds = players.map(p => p.id);
    for (const [id] of combatPlayers) {
        if (!onlineIds.includes(id)) {
            combatPlayers.delete(id);
        }
    }
}, 20 * 5); // Tracking 5 Seconds