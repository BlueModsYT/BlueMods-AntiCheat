import { world, system } from '@minecraft/server';
import { Command } from "../CommandHandler.js"; // Assuming you have a Command Handler
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods

const inCombatPlayers = new Map();
let defaultCombatCooldown = 200;

world.afterEvents.entityHurt.subscribe((event) => {
    const { hurtEntity, damagingEntity } = event;

    if (hurtEntity && damagingEntity && hurtEntity.id === 'minecraft:player' && damagingEntity.id === 'minecraft:player') {
        const hurtPlayer = hurtEntity;
        const damagingPlayer = damagingEntity;
        
        setInCombat(hurtPlayer);
        setInCombat(damagingPlayer);
    }
});

function setInCombat(player) {
    const playerName = player.name;
    const currentTick = system.currentTick;

    inCombatPlayers.set(playerName, currentTick + defaultCombatCooldown);

    player.sendMessage("§7[§b#§7]§cYou are now in combat! Logging out will result in death.");
}

world.beforeEvents.playerLeave.subscribe((event) => {
    const player = event.player;
    const playerName = player.name;
    const currentTick = system.currentTick;

    if (inCombatPlayers.has(playerName)) {
        const combatEndTick = inCombatPlayers.get(playerName);

        if (currentTick < combatEndTick) {
            player.runCommandAsync('kill @s');
            inCombatPlayers.delete(playerName);
        }
    }
});

Command.register({
    name: "incombat",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;

    if (args.length === 0) {
        player.sendMessage(`§7[§b#§7] §aCurrent combat cooldown: §e${defaultCombatCooldown / 20} seconds.`);
    } else {
        const newCooldown = parseInt(args[0]);

        if (isNaN(newCooldown) || newCooldown <= 0) {
            player.sendMessage("§7[§b#§7] §cInvalid cooldown duration! Please enter a valid number.");
        } else {
            defaultCombatCooldown = newCooldown * 20;  // Convert seconds to ticks
            player.sendMessage(`§7[§b#§7] §aCombat cooldown set to §e${newCooldown} seconds.`);
        }
    }
});

system.runInterval(() => {
    const currentTick = system.currentTick;

    for (const [playerName, combatEndTick] of inCombatPlayers) {
        if (currentTick >= combatEndTick) {
            inCombatPlayers.delete(playerName);
        }
    }
}, 20);
