import { world, system } from "@minecraft/server";
import { Command } from "../handlings/CommandHandler.js";
import { sendTeleportRequest, acceptTeleportRequest, declineTeleportRequest, blockPlayer, unblockPlayer } from "../handlings/TeleportHandler.js";
import main from "./config.js";

// all rights reserved @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods

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
const HOME_DYNAMIC_PROPERTY = "playerHome";
const MAX_HOME_SLOTS = 6;
const TELEPORT_COOLDOWN = 5000; // (5 seconds)
const playerRequest = {};
const cooldowns = {};
const tpablocks = {};
const COOLDOWN_TIME = 10000; // (10 seconds)
const TELEPORT_COUNTDOWN = 5;

//
// Help Command
//

Command.register({
    name: "help",
    description: "",
    aliases: ["?"]
}, (data, args) => {
    const player = data.player;

    const page = args[0] ? parseInt(args[0]) : 1;

    if (isNaN(page) || page < 1) {
        player.sendMessage("§7[§c-§7] §cInvalid page number. Please use a number greater than or equal to 1.");
        system.run(() => player.runCommand(`playsound random.break @s`));
        return;
    }

    const categories = player.hasTag(main.adminTag) ? main.adminCategories : main.memberCategories;

    displayCategory(player, categories, page);

    world.getPlayers({ tags: [main.notifyTag] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!help §afor ${player.hasTag(main.adminTag) ? "admins" : "members"}`);
        system.run(() => admin.runCommand(`playsound note.pling @s`));
    });
});

function displayCategory(player, categories, page) {
    const categoryIndex = page - 1;
    if (categoryIndex >= categories.length) {
        player.sendMessage("§7[§c-§7] §cInvalid page number.");
        system.run(() => player.runCommand(`playsound random.break @s`));
        return;
    }

    const category = categories[categoryIndex];
    
    player.sendMessage({ translate: category.name });

    for (const command of category.commands) {
        if (typeof command === "string") {
            player.sendMessage(command);
        } else if (typeof command === "object") {
            player.sendMessage({
                rawtext: [
                    { text: command.text || "" },
                    { translate: command.description }
                ]
            });
        }
    }

    // player.sendMessage(`\n§7You're in Page: §a${page}§7/§a${categories.length} §7| Use §a!help <page> §7to view other categories.\n`);
    player.sendMessage({
        rawtext: [
            { text: "\n§7" },
            { translate: "bluemods.page.info", with: [
                `§a${page}§7`,
                `§a${categories.length}§7`
            ]},
            { text: "\n" }
        ]
    });
    system.run(() => player.runCommand(`playsound note.pling @s`));
}

//
// About Command
//

Command.register({
    name: "about",
    description: "",
    aliases: []
}, (data) => {
    const player = data.player
    if (!isAuthorized(player, "about")) return;
    
    system.run(() => data.player.runCommand(`playsound note.bell @s`))
    data.player.sendMessage(`
        §l§bBlueMods §cAnti§fCheat §r
${main.bmdescription}

§7> §aMC Supported§7: ${main.mcversion}
§7> §aAddon Version§7: ${main.bmversion}
§7> §aDevelopers§7: §g${main.bluemods.join("§7, §g")}
${debug_sticks_format_version !== null ? "§7> §aConnected Version of 8Crafter's Debug Sticks Add-On§7: " + debug_sticks_format_version : ""}

${main.developer}
`)
    // Notification for Admins:
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!about`);
        system.run(() => admin.runCommand(`playsound note.pling @s`));
    });
});

//
// Home Command
//

Command.register({
    name: "home",
    description: "",
    aliases: [],
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "home")) return;

    const action = args[0]?.toLowerCase(); // 'tp', 'set', 'remove', or 'list'
    const homeName = args[1] || "default"; // Default home name if not specified

    if (!action) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!home §7<§atp§7/§eset§7/§cremove§7> §7<§ehomeName§7>`);
        return;
    }

    switch (action) {
        case "tp":
            teleportHome(player, homeName);
            break;
        case "set":
            setHome(player, homeName);
            break;
        case "remove":
            removeHome(player, homeName);
            break;
        case "list":
            listHomes(player);
            break;
        default:
            player.sendMessage(`§7[§b#§7] §cUnknown action: §e${action}§c. Use §3!home <tp/set/remove/list>`);
            system.run(() => player.runCommand('playsound random.break @s'));
    }
});

export function setHome(player, homeName) {
    if (!homeName) {
        player.sendMessage('§7[§c-§7] §cPlease specify a home name.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    let homeDataJson = player.getDynamicProperty(HOME_DYNAMIC_PROPERTY);
    let homes = homeDataJson ? JSON.parse(homeDataJson) : {};

    if (Object.keys(homes).length >= MAX_HOME_SLOTS) {
        player.sendMessage(`§7[§c-§7] §cYou can only set up to ${MAX_HOME_SLOTS} homes. Use §3!home remove <home_name> §cto remove an existing home.`);
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    homes[homeName] = {
        location: player.location,
        dimension: player.dimension.id
    };

    player.setDynamicProperty(HOME_DYNAMIC_PROPERTY, JSON.stringify(homes));

    player.sendMessage(`§7[§a/§7] §aHome §e${homeName} §aset successfully!`);
    system.run(() => player.runCommand(`playsound note.bell @s`));
}

export function teleportHome(player, homeName) {
    if (!homeName) {
        player.sendMessage('§7[§c-§7] §cPlease specify the home name you want to teleport to.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    const homeDataJson = player.getDynamicProperty(HOME_DYNAMIC_PROPERTY);
    if (!homeDataJson) {
        player.sendMessage('§7[§c-§7] §cYou don\'t have any homes set. Use §3!home set <home_name> §cto create one.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    const homes = JSON.parse(homeDataJson);

    if (!homes[homeName]) {
        player.sendMessage(`§7[§c-§7] §cHome §e${homeName} §cdoes not exist. Check your home name.`);
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    const home = homes[homeName];

    if (teleportingPlayers.has(player.id)) {
        player.sendMessage('§7[§c-§7] §cYou are already in the process of teleporting. Please wait.');
        return;
    }

    const initialPosition = { x: player.location.x, y: player.location.y, z: player.location.z };
    player.sendMessage('§7[§a/§7] §aTeleporting to your home in §e5 seconds§a. Do not move!');

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
            player.sendMessage('§7[§c-§7] §cTeleportation to home canceled because you moved.');
            system.run(() => player.runCommand('playsound random.break @s'));
            teleportingPlayers.delete(player.id);
            system.clearRun(countdownInterval);
            return;
        }

        playerData.countdown -= 1;

        if (playerData.countdown > 0) {
            player.sendMessage(`§7[§a/§7] §aTeleporting to your home in §e${playerData.countdown} seconds§a...`);
            system.run(() => player.runCommand('playsound random.orb @s'));
        } else {
            system.clearRun(countdownInterval);

            const { x, y, z } = home.location;
            const dimension = home.dimension === "minecraft:overworld" ? "overworld" :
                              home.dimension === "minecraft:nether" ? "nether" : "the_end";
            
            system.run(() => {
                try {
                    player.runCommand(`execute in ${dimension} run tp @s ${x} ${y} ${z}`);
                    player.sendMessage(`§7[§a/§7] §aTeleported to your home §e${homeName}§a.`);
                    player.runCommand(`playsound random.levelup @s`);
                } catch (error) {

                    player.sendMessage('§7[§c-§7] §cError: Unable to teleport to your home. Please try again.');
                    console.error(`Teleport error: ${error.message}`);
                }
            });

            teleportingPlayers.delete(player.id);
        }
    }, 20);
}

export function removeHome(player, homeName) {
    if (!homeName) {
        player.sendMessage('§7[§c-§7] §cPlease specify the home name you want to remove.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    let homeDataJson = player.getDynamicProperty(HOME_DYNAMIC_PROPERTY);
    if (!homeDataJson) {
        player.sendMessage('§7[§c-§7] §cYou don\'t have any homes set.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    let homes = JSON.parse(homeDataJson);

    if (!homes[homeName]) {
        player.sendMessage(`§7[§c-§7] §cHome §e${homeName} §cdoes not exist.`);
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    delete homes[homeName];

    player.setDynamicProperty(HOME_DYNAMIC_PROPERTY, JSON.stringify(homes));

    player.sendMessage(`§7[§a/§7] §aHome §e${homeName} §ahas been removed.`);
    system.run(() => player.runCommand(`playsound note.bell @s`));
}

export function listHomes(player) {
    let homeDataJson = player.getDynamicProperty(HOME_DYNAMIC_PROPERTY);
    if (!homeDataJson) {
        player.sendMessage('§7[§c-§7] §cYou don\'t have any homes set.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    let homes = JSON.parse(homeDataJson);
    const homeList = Object.keys(homes);

    if (homeList.length === 0) {
        player.sendMessage('§7[§c-§7] §cYou don\'t have any homes set.');
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    player.sendMessage(`§7[§a/§7] §aYour saved homes: §e${homeList.join(', ')}`);
    system.run(() => player.runCommand(`playsound random.levelup @s`));
}

//
// Ping Command
//

Command.register({
    name: "ping",
    description: "",
    aliases: [],
}, async (data) => {
    await system.waitTicks(1);

    const { player } = data;
    const start = Date.now();

    player.runCommand(`testfor @s`);

    const responseTime = Date.now() - start;
    
    let pingStatus = "§aLow";
    if (responseTime > 100) {
        pingStatus = "§cHigh";
    } else if (responseTime > 50) {
        pingStatus = "§gMedium";
    }

    const worldTPS = Math.min(20, 20);
    player.sendMessage(`§7[§a#§7] §aPing§7: §e${responseTime}ms §7[${pingStatus}§7] | §aTPS: §e${worldTPS}§7/§e20`);

    player.runCommand(`playsound random.orb @s`);
});

//
// RTP Command
//

Command.register({
    name: "rtp",
    description: "",
    aliases: [],
}, (data) => {
    const { player } = data;
    if (!isAuthorized(player, "rtp")) return;
    
    const { id } = player;

    if (teleportingPlayers.has(id)) {
        player.sendMessage('§7[§c-§7] §cYou are already in the process of teleporting. Please wait.');
        return;
    }

    const initialPosition = { x: player.location.x, y: player.location.y, z: player.location.z };
    player.sendMessage('§7[§a/§7] §aRandom teleporting in §e5 seconds§a. Do not move!');

    teleportingPlayers.set(id, { initialPosition, countdown: 5 });

    const countdownInterval = system.runInterval(() => {
        const playerData = teleportingPlayers.get(id);
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
            teleportingPlayers.delete(id);
            system.clearRun(countdownInterval);
            return;
        }

        playerData.countdown -= 1;

        if (playerData.countdown > 0) {
            player.sendMessage(`§7[§a/§7] §aRandom teleporting in §e${playerData.countdown} seconds§a...`);
            system.run(() => player.runCommand('playsound random.orb @s'));
        } else {
            system.clearRun(countdownInterval);
            system.run(() => player.runCommand(`/effect @s resistance 25 255 true`));

            system.run(() => {
                try {
                    player.runCommand(`/spreadplayers ~ ~ 500 1000 @s`);
                    player.sendMessage('§7[§a/§7] §aYou have been randomly teleported.');
                    player.runCommand(`playsound random.levelup @s`);
                } catch (error) {

                    player.sendMessage('§7[§c-§7] §cError: Unable to teleport. Please try again.');
                    console.error(`Teleport error: ${error.message}`);
                }
            });

            teleportingPlayers.delete(id);
        }
    }, 20);
});

//
// TPA Command
//

Command.register({
    name: "tpa",
    description: "",
    aliases: [],
}, (data, args) => {
    const { player } = data;

    if (!args[0]) {
        player.sendMessage("§7[§b#§7] §cInvalid usage! Use §3!tpa send <player> / !tpa accept / !tpa decline / !tpa block <player> / !tpa unblock <player>.");
        return system.run(() => player.runCommand(`playsound random.break @s`));
    }

    switch (args[0].toLowerCase()) {
        case "send":
            const target = world.getPlayers().find(p => p.name === args[1]);
            if (!target) return player.sendMessage(`§7[§b#§7] §cPlayer not found.`);
            sendTeleportRequest(player, target);
            break;
        case "accept":
            acceptTeleportRequest(player);
            break;
        case "decline":
            declineTeleportRequest(player);
            break;
        case "block":
            if (!args[1]) return player.sendMessage("§7[§b#§7] §cSpecify a player to block.");
            const blockTarget = world.getPlayers().find(p => p.name === args[1]);
            if (!blockTarget) return player.sendMessage(`§7[§b#§7] §cPlayer not found.`);
            blockPlayer(player, blockTarget);
            break;
        case "unblock":
            if (!args[1]) return player.sendMessage("§7[§b#§7] §cSpecify a player to unblock.");
            const unblockTarget = world.getPlayers().find(p => p.name === args[1]);
            if (!unblockTarget) return player.sendMessage(`§7[§b#§7] §cPlayer not found.`);
            unblockPlayer(player, unblockTarget);
            break;
        default:
            player.sendMessage("§7[§b#§7] §cInvalid usage! Use §3!tpa send <player> / !tpa accept / !tpa decline / !tpa block <player> / !tpa unblock <player>.");
            system.run(() => player.runCommand(`playsound random.break @s`));
    }
});

//
// Ender Chest Command
//

const echest_cooldown = 2 * 60 * 60 * 1000;
const PLAYER_COOLDOWN_KEY = "echestCooldown";

Command.register({
    name: "echest",
    description: "",
    aliases: [],
}, (data) => {
    const { player } = data;
    if (!isAuthorized(player, "echest")) return;
    const playerKey = `${player.id}:${PLAYER_COOLDOWN_KEY}`;

    const lastClaimTime = world.getDynamicProperty(playerKey) || 0;
    const currentTime = Date.now();

    if (lastClaimTime && currentTime - lastClaimTime < echest_cooldown) {
        const remainingTime = Math.ceil((echest_cooldown - (currentTime - lastClaimTime)) / 60000);
        const hours = Math.floor(remainingTime / 60);
        const minutes = remainingTime % 60;

        player.sendMessage(
            `§7[§b#§7] §cYou must wait §e${hours}h ${minutes}m §cto use the Ender Chest again.`
        );
        system.run(() => player.runCommand("playsound random.break @s"));
        return;
    }

    const inventory = player.getComponent("inventory")?.container;
    if (!inventory) return;

    let hasEChest = false;
    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item && item.typeId === "minecraft:ender_chest") {
            hasEChest = true;
            break;
        }
    }

    if (hasEChest) {
        player.sendMessage("§7[§b#§7] §cYou already have an Ender Chest.");
        system.run(() => player.runCommand("playsound random.break @s"));
        return;
    }

    system.run(() => player.runCommand("give @s ender_chest 1"))
        .then(() => {
            player.sendMessage("§7[§a/§7] §aYou have received an Ender Chest!");
            system.run(() => player.runCommand("playsound random.levelup @s"));

            world.setDynamicProperty(playerKey, currentTime);
        })
        .catch((error) => {
            player.sendMessage("§7[§c-§7] §cFailed to give an Ender Chest. Please try again.");
            console.error(`Error giving ender chest: ${error.message}`);
        });
});

//
// Daily Command
//

import { getRemainingCooldownTime } from "../handlings/ModuleHandler.js";

const DAILY_REWARDS_KEY = "dailyRewards";
const DAILY_COOLDOWN_KEY = "dailyCooldown";
let dailyRewards = [];

system.run(() => {
    const storedDailyRewards = world.getDynamicProperty(DAILY_REWARDS_KEY);
    if (!storedDailyRewards) {
        dailyRewards = main.daily;
        world.setDynamicProperty(DAILY_REWARDS_KEY, JSON.stringify(dailyRewards));
    } else {
        dailyRewards = JSON.parse(storedDailyRewards);
    }
});

function claimDailyReward(player) {
    const playerKey = `${player.id}:${DAILY_COOLDOWN_KEY}`;
    const currentTime = Date.now();

    const totalChance = dailyRewards.reduce((sum, reward) => sum + reward.chance, 0);
    const randomValue = Math.random() * totalChance;

    let accumulatedChance = 0;
    let selectedReward;

    for (const reward of dailyRewards) {
        accumulatedChance += reward.chance;
        if (randomValue <= accumulatedChance) {
            selectedReward = reward;
            break;
        }
    }

    if (!selectedReward) {
        player.sendMessage("§7[§b#§7] §cNo reward could be determined. Please try again later.");
        system.run(() => player.runCommand("playsound random.break @s"));
        return;
    }

    system.run(() => player.runCommand(`give @s ${selectedReward.item} ${selectedReward.count}`));
    player.sendMessage(
        `§7[§b#§7] §aCongratulations! You received §e${selectedReward.count} ${selectedReward.item}(s)§a as your daily reward!`
    );
    system.run(() => player.runCommand("playsound random.levelup @s"));

    world.setDynamicProperty(playerKey, currentTime);
}

Command.register({
    name: "daily",
    description: "",
    aliases: [],
}, (data) => {
    const { player } = data;
    if (!isAuthorized(player, "daily")) return;

    const remainingTime = getRemainingCooldownTime(player);
    if (remainingTime > 0) {
        const days = Math.floor(remainingTime / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

        let message = "§7[§b#§7] §cYou already claimed your daily reward! Try again in ";

        if (days > 0) message += `${days}d `;
        if (hours > 0) message += `${hours}h `;
        if (minutes > 0) message += `${minutes}m `;
        if (seconds > 0) message += `${seconds}s`;

        player.sendMessage(message.trim());
        system.run(() => player.runCommand("playsound random.break @s"));
        return;
    }

    claimDailyReward(player);
});

//
// Spawn Command
//

import spawnManager from "../handlings/SpawnHandler.js";

Command.register({
    name: "spawn",
    description: "",
    aliases: [],
}, (data) => {
    const { player } = data;
    const { id } = player;
    const SPAWN_LOCATION = spawnManager.getSpawnLocation();

    if (!SPAWN_LOCATION) {
        player.sendMessage('§7[§c-§7] §cSpawn location has not been set by an admin.');
        system.run(() => player.runCommand('playsound random.break @s'));
        return;
    }
    
    if (player.hasTag("incombat")) {
        player.sendMessage("§7[§c-§7] §cYou can't teleport right now! try again once your incombat fade");
        system.run(() => player.runCommand(`playsound random.break @s`));
    }

    if (teleportingPlayers.has(id)) {
        player.sendMessage('§7[§c-§7] §cYou are already teleporting to spawn. Please wait.');
        return;
    }

    const initialPosition = { x: player.location.x, y: player.location.y, z: player.location.z };
    player.sendMessage('§7[§a/§7] §aTeleporting to spawn in §e5 seconds§a. Do not move!');

    teleportingPlayers.set(id, { initialPosition, countdown: TELEPORT_COUNTDOWN });

    const countdownInterval = system.runInterval(() => {
        const playerData = teleportingPlayers.get(id);
        if (!playerData || !player) {
            system.clearRun(countdownInterval);
            teleportingPlayers.delete(id);
            return;
        }

        const { countdown, initialPosition } = playerData;
        const currentPosition = { x: player.location.x, y: player.location.y, z: player.location.z };

        if (
            currentPosition.x !== initialPosition.x ||
            currentPosition.y !== initialPosition.y ||
            currentPosition.z !== initialPosition.z
        ) {
            player.sendMessage('§7[§c-§7] §cTeleportation to spawn canceled because you moved.');
            system.run(() => player.runCommand('playsound random.break @s'));
            teleportingPlayers.delete(id);
            system.clearRun(countdownInterval);
            return;
        }

        playerData.countdown -= 1;

        if (playerData.countdown > 0) {
            player.sendMessage(`§7[§a/§7] §aTeleporting to spawn in §e${playerData.countdown} seconds§a...`);
            system.run(() => player.runCommand('playsound random.orb @s'));
        } else {
            system.clearRun(countdownInterval);
            teleportingPlayers.delete(id);

            system.run(() => player.runCommand(`tp @s ${SPAWN_LOCATION.x} ${SPAWN_LOCATION.y} ${SPAWN_LOCATION.z}`))
                .then(() => {
                    player.sendMessage('§7[§a/§7] §aYou have been teleported to spawn.');
                    system.run(() => player.runCommand('playsound random.levelup @s'));
                    // Notification for Admins
                    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!spawn `);
                        system.run(() => admin.runCommand(`playsound note.pling @s`));
                    });
                })
                .catch(error => {
                    player.sendMessage('§7[§c-§7] §cError: Teleportation failed. Please try again.');
                    console.error(`Teleport error: ${error.message}`);
                });
        }
    }, 20);
});

Command.register({
    name: "setspawn",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data) => {
    const { player } = data;

    const location = {
        x: player.location.x,
        y: player.location.y,
        z: player.location.z
    };

    spawnManager.setSpawnLocation(location);

    player.sendMessage(`§7[§a/§7] §aSpawn location set to your current position: §e${location.x} ${location.y} ${location.z}`);
    system.run(() => player.runCommand(`playsound random.levelup @s`));
    // Notification for Admins
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!setspawn `);
        system.run(() => admin.runCommand(`playsound note.pling @s`));
    });
});

Command.register({
    name: "rspawn",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data) => {
    const { player } = data;

    spawnManager.clearSpawnLocation();

    player.sendMessage('§7[§a/§7] §aThe spawn location has been removed.');
    system.run(() => player.runCommand(`playsound random.break @s`));
    // Notification for Admins
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!rspawn`);
        system.run(() => admin.runCommand(`playsound note.pling @s`));
    });
});

//
// Compass Command 
//

Command.register({
    name: "compass",
    description: "",
    aliases: [],
}, (data) => {
    const player = data.player;
    if (!isAuthorized(player, "compass")) return;

    const inventory = player.getComponent("inventory")?.container;
    if (!inventory) return;

    let hasCompass = false;
    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item && item.typeId === "bluemods:itemui") {
            hasCompass = true;
            break;
        }
    }

    if (!hasCompass) {
        system.run(() => player.runCommand('give @s bluemods:itemui'));
        player.sendMessage("§7[§b#§7] §aYou received a compass!");
    } else {
        player.sendMessage("§7[§b#§7] §cYou already have a compass in your inventory.");
        system.run(() => player.runCommand('playsound random.break @s'));
    }

    system.run(() => player.runCommand('playsound note.pling @s'));
});

//
// Back Command
//

const deathLocations = new Map();

world.afterEvents.entityDie.subscribe((event) => {
    const { deadEntity } = event;

    if (deadEntity && deadEntity.typeId === "minecraft:player") {
        const playerName = deadEntity.name;
        const { x, y, z } = deadEntity.location;
        const dimensionId = deadEntity.dimension.id.replace("minecraft:", "");

        deathLocations.set(playerName, { x, y, z, dimensionId });
    }
});

Command.register({
    name: "back",
    description: "",
    aliases: [],
}, (data) => {
    const { player } = data;
    if (!isAuthorized(player, "back")) return;

    const playerName = player.name;

    if (!deathLocations.has(playerName)) {
        player.sendMessage("§7[§b#§7] §cYou haven't died recently or your death location is unavailable.");
        return;
    }

    const { x, y, z, dimensionId } = deathLocations.get(playerName);
    const currentDimension = player.dimension.id.replace("minecraft:", "");

    if (x === player.location.x && y === player.location.y && z === player.location.z && dimensionId === currentDimension) {
        player.sendMessage("§7[§b#§7] §cYou are already at your death location.");
        return;
    }

    let executeCommand = `execute in ${dimensionId} run tp @s ${x} ${y} ${z}`;

    system.run(() => player.runCommand(executeCommand)).then(() => {
        player.sendMessage("§7[§b#§7] §aYou have been teleported back to your death location.");
        deathLocations.delete(playerName);
    }).catch(() => {
        player.sendMessage("§7[§b#§7] §cTeleportation failed. Invalid dimension.");
    });
});
