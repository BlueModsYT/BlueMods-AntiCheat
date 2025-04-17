import { world, system } from "@minecraft/server";
import main from "../commands/config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

const COMBAT_COOLDOWN = 10;
const combatPlayers = new Map();

world.afterEvents.entityHitEntity.subscribe(({ damagingEntity, hitEntity }) => {
    if (!(damagingEntity.typeId === "minecraft:player" && hitEntity.typeId === "minecraft:player")) return;
    
    const dGamemode = damagingEntity.getGameMode();
    const hGamemode = hitEntity.getGameMode();
    if (dGamemode === "creative" || hGamemode === "creative") return;
    
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
    if (!combatPlayers.has(playerId)) return;
    
    const player = world.getPlayers().find(p => p.id === playerId);
    if (player && (player.getGameMode() === "survival" || player.getGameMode() === "adventure")) {
        try {
            player.runCommand("kill @s");
            world.sendMessage(`§c${player.name} logged out during combat and was killed!`);
        } catch (e) {
            console.warn(`[CombatLog] Failed to kill ${player.name}:`, e);
        }
    }
    
    combatPlayers.delete(playerId);
});

system.runInterval(() => {
    for (const [id] of combatPlayers) {
        if (!world.getPlayers().some(p => p.id === id)) {
            combatPlayers.delete(id);
        }
    }
}, 20);