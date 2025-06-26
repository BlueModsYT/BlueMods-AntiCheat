import { world, system } from "@minecraft/server";
import { Command } from "../../handlings/CommandHandler.js";
import main from "../config.js";

const WARP_LIMIT = 5;
export const WARP_DYNAMIC_PROPERTY = "playerWarps";
const TELEPORT_COOLDOWN = 5000; // 5 seconds

function isCommandEnabled(commandName) {
    return main.enabledCommands[commandName] !== undefined ? main.enabledCommands[commandName] : true;
}

const isAuthorized = (player, commandName) => {
    if (!isCommandEnabled(commandName)) {
        player.sendMessage(`§7[§b#§7] §cThis command §e${commandName} §cis currently disabled.`);
        system.run(() => player.runCommand(`playsound random.break @s`));
        return false;
    }
    return true;
};

const teleportingPlayers = new Map();

Command.register({
    name: "warp",
    description: "",
    aliases: [],
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "warp")) return;
    
    const action = args[0]?.toLowerCase();
    const warpName = args[1] || "default";
    
    if (!action) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse§7: §3!warp §7<§atp§7/§elist§7> §7<§ewarpName§7>`);
        return;
    }
    
    switch (action) {
        case "tp":
            teleportWarp(player, warpName);
            break;
        case "list":
            listWarps(player);
            break;
        case "set":
        case "remove":
            if (!player.hasTag(main.adminTag)) {
                player.sendMessage(`§7[§c-§7] §cYou don't have permission to ${action} warps.`);
                system.run(() => player.runCommand('playsound random.break @s'));
                return;
            }
            if (action === "set") setWarp(player, warpName);
            else removeWarp(player, warpName);
            break;
        default:
            player.sendMessage(`§7[§b#§7] §cUnknown action: §e${action}§c. Use §3!warp <tp/list>`);
            system.run(() => player.runCommand('playsound random.break @s'));
    }
});

export function setWarp(player, warpName) {
    if (!warpName) {
        player.sendMessage('§7[§c-§7] §cPlease specify a warp name.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }
    
    let warpDataJson = world.getDynamicProperty(WARP_DYNAMIC_PROPERTY);
    let warps = warpDataJson ? JSON.parse(warpDataJson) : {};
    
    if (Object.keys(warps).length >= WARP_LIMIT) {
        player.sendMessage(`§7[§c-§7] §cMaximum warp limit reached (${WARP_LIMIT}). Remove some warps first.`);
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }
    
    const blockX = Math.floor(player.location.x);
    const blockY = Math.floor(player.location.y);
    const blockZ = Math.floor(player.location.z);
    
    warps[warpName] = {
        location: { x: blockX, y: blockY, z: blockZ },
        dimension: player.dimension.id,
        creator: player.name
    };
    
    world.setDynamicProperty(WARP_DYNAMIC_PROPERTY, JSON.stringify(warps));
    
    player.sendMessage(`§7[§a/§7] §aWarp §e${warpName} §aset successfully! §7(${Object.keys(warps).length}/${WARP_LIMIT})`);
    system.run(() => player.runCommand(`playsound note.bell @s`));
}

export function teleportWarp(player, warpName) {
    if (player.hasTag("incombat")) {
        player.sendMessage("§7[§c-§7] §cYou can't teleport right now! try again once your incombat fade");
        system.run(() => player.runCommand(`playsound random.break @s`));
    }
    
    if (!warpName) {
        player.sendMessage('§7[§c-§7] §cPlease specify the warp name you want to teleport to.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }
    
    const warpDataJson = world.getDynamicProperty(WARP_DYNAMIC_PROPERTY);
    if (!warpDataJson) {
        player.sendMessage('§7[§c-§7] §cNo warps are set. Ask an admin to set some.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }
    
    const warps = JSON.parse(warpDataJson);
    
    if (!warps[warpName]) {
        player.sendMessage(`§7[§c-§7] §cWarp §e${warpName} §cdoes not exist. Use §3!warp list §cto see available warps.`);
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }
    
    const warp = warps[warpName];
    
    if (teleportingPlayers.has(player.id)) {
        player.sendMessage('§7[§c-§7] §cYou are already in the process of teleporting. Please wait.');
        return;
    }
    
    const initialPosition = { x: player.location.x, y: player.location.y, z: player.location.z };
    player.sendMessage('§7[§a/§7] §aTeleporting to warp in §e5 seconds§a. Do not move!');
    
    teleportingPlayers.set(player.id, { initialPosition, countdown: 5 });
    
    const countdownInterval = system.runInterval(() => {
        const playerData = teleportingPlayers.get(player.id);
        if (!playerData || !player) {
            system.clearRun(countdownInterval);
            return;
        }
        
        const { countdown, initialPosition } = playerData;
        const currentPosition = { x: player.location.x, y: player.location.y, z: player.location.z };
        
        if (
            currentPosition.x !== initialPosition.x ||
            currentPosition.y !== initialPosition.y ||
            currentPosition.z !== initialPosition.z
        ) {
            player.sendMessage('§7[§c-§7] §cTeleportation canceled because you moved.');
            system.run(() => player.runCommand('playsound random.break @s'));
            teleportingPlayers.delete(player.id);
            system.clearRun(countdownInterval);
            return;
        }
        
        playerData.countdown -= 1;
        
        if (playerData.countdown > 0) {
            player.sendMessage(`§7[§a/§7] §aTeleporting in §e${playerData.countdown} seconds§a...`);
            system.run(() => player.runCommand('playsound random.orb @s'));
        } else {
            system.clearRun(countdownInterval);
            
            const { x, y, z } = warp.location;
            const dimension = warp.dimension === "minecraft:overworld" ? "overworld" :
                warp.dimension === "minecraft:nether" ? "nether" : "the_end";
            
            system.run(() => {
                try {
                    player.runCommand(`execute in ${dimension} run tp @s ${x} ${y} ${z}`);
                    player.sendMessage(`§7[§a/§7] §aTeleported to warp §e${warpName}§a.`);
                    player.runCommand(`playsound random.levelup @s`);
                } catch (error) {
                    player.sendMessage('§7[§c-§7] §cError: Unable to teleport. Please try again.');
                    console.error(`Teleport error: ${error.message}`);
                }
            });
            
            teleportingPlayers.delete(player.id);
        }
    }, 20);
}

export function removeWarp(player, warpName) {
    if (!warpName) {
        player.sendMessage('§7[§c-§7] §cPlease specify the warp name you want to remove.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }
    
    let warpDataJson = world.getDynamicProperty(WARP_DYNAMIC_PROPERTY);
    if (!warpDataJson) {
        player.sendMessage('§7[§c-§7] §cNo warps are set.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }
    
    let warps = JSON.parse(warpDataJson);
    
    if (!warps[warpName]) {
        player.sendMessage(`§7[§c-§7] §cWarp §e${warpName} §cdoes not exist.`);
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }
    
    delete warps[warpName];
    
    world.setDynamicProperty(WARP_DYNAMIC_PROPERTY, JSON.stringify(warps));
    
    player.sendMessage(`§7[§a/§7] §aWarp §e${warpName} §ahas been removed.`);
    system.run(() => player.runCommand(`playsound note.bell @s`));
}

export function listWarps(player) {
    let warpDataJson = world.getDynamicProperty(WARP_DYNAMIC_PROPERTY);
    if (!warpDataJson) {
        player.sendMessage('§7[§c-§7] §cNo warps are set.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }
    
    let warps = JSON.parse(warpDataJson);
    const warpList = Object.keys(warps);
    
    if (warpList.length === 0) {
        player.sendMessage('§7[§c-§7] §cNo warps are set.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }
    
    const warpInfo = warpList.map(name => {
        const creator = warps[name].creator || "Unknown";
        return `${name} §7(by ${creator})`;
    });
    
    player.sendMessage(`§7[§a/§7] §aAvailable warps:\n§e${warpInfo.join('\n')}`);
    system.run(() => player.runCommand(`playsound random.levelup @s`));
}