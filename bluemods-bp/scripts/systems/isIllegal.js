import { world, system } from "@minecraft/server";
import { Command } from "./handler/CommandHandler.js";
import { ActionFormData } from "@minecraft/server-ui";
import { isLored, isDanger, isOperator, isSpawnEgg, isUnknown } from "./config.js";
import { ModulesPanel } from "../chat/playerCompass.js";
import { customFormUICodes } from "../ui/customFormUICodes.js";
import main from "../commands/config.js";

const adminTag = "admin";
const trustedTag = "trusted";
const MODULE_STATES_KEY = "moduleStates";
const MAX_ITEM_NBT_SIZE = 1024;
const playerClicks = new Map();

const defaultModuleStates = {
    rankDisplaySystem: false,
    loredItemCheck: true,
    dangerItemCheck: true,
    operatorItemCheck: true,
    eggItemCheck: true,
    unknownItemCheck: true,
    nameSpoofCheck: true,
    nbtItemCheck: true,
    isAgentMob: true,
    isCommandBlockMinecart: true,
    isNPCMob: false,
    isCreativeMode: false
};

system.run(() => {
    try {
        const storedStates = world.getDynamicProperty(MODULE_STATES_KEY);
        main.moduleStates = storedStates ? { ...defaultModuleStates, ...JSON.parse(storedStates) } : defaultModuleStates;
        if (!storedStates) world.setDynamicProperty(MODULE_STATES_KEY, JSON.stringify(defaultModuleStates));
    } catch (error) {
        console.error(`Error loading module states: ${error.message}`);
        main.moduleStates = defaultModuleStates;
    }
});

function saveModuleStates() {
    try {
        world.setDynamicProperty(MODULE_STATES_KEY, JSON.stringify(main.moduleStates));
    } catch (error) {
        console.error(`Error saving module states: ${error.message}`);
    }
}

function isModuleEnabled(module) {
    return main.moduleStates[module];
}

function hasLore(item) {
    return Boolean(item?.getLore()?.length);
}

function itemCheck(player, itemList, moduleName) {
    if (!isModuleEnabled(moduleName)) return;
    if (player.hasTag(adminTag)) return;
    
    const inventory = player.getComponent("inventory").container;
    if (!inventory || inventory.size === inventory.emptySlotsCount) return;

    let itemRemoved = false;
    let removedItemType = null;

    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item && itemList.includes(item.typeId)) {
            if (!isLored.includes(item.typeId) || hasLore(item)) {
                removedItemType = item.typeId;
                inventory.setItem(i, null);
                itemRemoved = true;
            }
        }
    }
    
    const inv = player.getComponent("inventory").container;
    for (let i = 0; i < inv.size; i++) {
        const item = inv.getItem(i);
        if (item && isLored.includes(item.typeId) && hasLore(item)) {
            if (!isModuleEnabled("loredItemCheck")) continue;
            
            inv.setItem(i, null);
            system.run(() => player.runCommand(`playsound random.break @s`));
            player.sendMessage(`§7[§b#§7] §cYou are not allowed to use lored container items, Make sure you have permission to use it.`);

            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                admin.sendMessage(`§7[§d#§7] §e${player.name} §ais trying to use a lored container: "§e${item.typeId.replace('minecraft:', '').replace(/_/g, ' ')}§a".`);
                system.run(() => admin.runCommand(`playsound random.break @s`));
            });
        }
    }

    if (itemRemoved) {
        player.sendMessage("§7[§b#§7] §cYou are not allowed to use this item, Make sure you have permission to use it.");
        system.run(() => player.runCommand(`playsound random.break @s`));

        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            if (removedItemType) {
                const itemName = removedItemType.replace('minecraft:', '').replace(/_/g, ' ');
                admin.sendMessage(`§7[§d#§7] §e${player.name} §ais trying to use illegal item: §e${itemName}`);
                system.run(() => admin.runCommand(`playsound random.break @s`));
            }
        });
    }
}

function checkItemNBT(player) {
    if (!isModuleEnabled("nbtItemCheck")) return;
    if (player.hasTag(adminTag)) return;

    const inventory = player.getComponent("inventory").container;
    if (!inventory) return;

    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (!item) continue;

        const itemData = JSON.stringify(item);
        if (itemData.length > MAX_ITEM_NBT_SIZE) {
            inventory.setItem(i, null);
            player.sendMessage("§7[§b#§7] §cIllegal NBT detected, item removed.");

            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                admin.sendMessage(`§7[§d#§7] §e${player.name} §atried to use an illegal NBT item.`);
                system.run(() => admin.runCommand(`playsound random.break @s`));
            });
        }
    }
}

//
// NameSpoof Checks
//

const validNameRegex = /^[\x21-\x26\x28-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E\xA0-\xBF\x20\x27\x30-\x39\x41-\x5A\x61-\x7A\xC0-\xF6\xF8-\xFF\u0100-\u017F\u1100-\u1112\u1161-\u1175\u11A8-\u11C2\uAC00-\uD7A3\u3041-\u3096\u30A1-\u30FA\u4E00-\u9FFF\u0400-\u045F\u0985-\u09B9\u0E01-\u0E3A\u0E40-\u0E4E\u0E01-\u0E30\u0E32-\u0E33\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0390-\u03CE\u0900-\u094F\u0966-\u096F\u0671-\u06D3\u06F0-\u06F9\u0904-\u0939\u0900-\u0903\u093A-\u094F\u0620-\u064A\u0660-\u0669\u05D0-\u05EA]{1,20}$/u;

const checkForNameSpoof = (player) => {
    if (!isModuleEnabled("nameSpoofCheck")) return;
    
    const playerName = player.name.trim();
    return !validNameRegex.test(playerName);
};

world.afterEvents.playerSpawn.subscribe((event) => {
    const player = event.player;

    if (checkForNameSpoof(player)) {
        system.run(() => player.runCommand('kick @s §cInvalid or spoofed name detected. Check your username for validity.'));

        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§d#§7] §e${player.name} §ahas been kicked out for using an invalid username.`);
            system.run(() => admin.runCommand(`playsound random.break @s`));
        });
    }
});

//
// GameMode Checks
//

const lastValidGamemodes = new Map();

function checkGameMode(player) {
    if (!isModuleEnabled("isCreativeMode")) return;
        try {
            const currentMode = player.getGameMode();
            const tags = player.getTags();
            const isAdmin = tags.includes("admin") || tags.includes("trusted");
    
            const prevMode = lastValidGamemodes.get(player.name);
    
            if (currentMode === "creative" && !isAdmin) {
                if (prevMode && prevMode !== "creative") {
                    player.sendMessage("§cYou are not allowed to use Creative Mode. Reverting back.");
                    player.runCommand(`gamemode ${prevMode}`);
                } else {
                    player.runCommand("gamemode survival");
                }
            } else {
                lastValidGamemodes.set(player.name, currentMode);
            }
        } catch (err) {
        console.warn(`[GameModeChecker] Error checking ${player.name}:`, err);
    }
}

let itemCheckInterval;
let entityCheckInterval;

// 
// Checks the Item
//

function startItemChecks() {
    if (itemCheckInterval) system.clearRun(itemCheckInterval);

    itemCheckInterval = system.runInterval(() => {
        if (!Object.values(main.moduleStates).some(state => state)) {
            system.clearRun(itemCheckInterval);
            return;
        }

        world.getPlayers().forEach(player => {
            if (player.hasTag(adminTag) || player.hasTag(trustedTag)) return;

            if (isModuleEnabled("loredItemCheck")) itemCheck(player, isLored, "loredItemCheck");
            if (isModuleEnabled("dangerItemCheck")) itemCheck(player, isDanger, "dangerItemCheck");
            if (isModuleEnabled("operatorItemCheck")) itemCheck(player, isOperator, "operatorItemCheck");
            if (isModuleEnabled("eggItemCheck")) itemCheck(player, isSpawnEgg, "eggItemCheck");
            if (isModuleEnabled("unknownItemCheck")) itemCheck(player, isUnknown, "unknownItemCheck");
            if (isModuleEnabled("nbtItemCheck")) checkItemNBT(player);
            if (isModuleEnabled("isCreativeMode")) checkGameMode(player);
        });
    }, 1);
}

function startEntityChecks() {
    if (entityCheckInterval) system.clearRun(entityCheckInterval);

    entityCheckInterval = system.runInterval(() => {
        if (!isModuleEnabled("isAgentMob") && !isModuleEnabled("isCommandBlockMinecart")) {
            system.clearRun(entityCheckInterval);
            return;
        }

        if (isModuleEnabled("isAgentMob")) {
            world.getDimension("overworld").getEntities().forEach(entity => {
                if (entity.typeId === "minecraft:agent") entity.remove();
            });
        }

        if (isModuleEnabled("isCommandBlockMinecart")) {
            world.getDimension("overworld").getEntities().forEach(entity => {
                if (entity.typeId === "minecraft:command_block_minecart") entity.remove();
            });
        }

        if (isModuleEnabled("isNPCMob")) {
            world.getDimension("overworld").getEntities().forEach(entity => {
                if (entity.typeId === "minecraft:npc") entity.remove();
            });
        }
    }, 1);
}

export function ModuleStatesPanel(player) {
    const form = new ActionFormData()
        .title(customFormUICodes.action.titles.formStyles.gridMenu + "§l§bBlueMods §7| §aModule States")
        .body("§cWarning: Disabling this module may put the server at risk!\n§fOnly turn it off if you fully understand the consequences.");

    Object.entries(main.moduleStates).forEach(([module, isEnabled]) => {
        const statusText = isEnabled ? "§aEnabled" : "§cDisabled";
        const statusIcon = isEnabled ? "textures/ui/realms_green_check.png" : "textures/ui/redX1.png";
        form.button(customFormUICodes.action.buttons.positions.main_only + `§e${module}\n§7[ ${statusText} §7]`, statusIcon);
    });

    form.button(customFormUICodes.action.buttons.positions.main_only + "§eRefresh Rank Displays", "textures/ui/refresh")
       .button(customFormUICodes.action.buttons.positions.title_bar_only + "§cBack", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled) return;

        if (response.selection < Object.keys(main.moduleStates).length) {
            const selectedModule = Object.keys(main.moduleStates)[response.selection];
            main.moduleStates[selectedModule] = !main.moduleStates[selectedModule];
            saveModuleStates();

            player.sendMessage(`§7[§b#§7] §aToggled §e${selectedModule} §7to §b${main.moduleStates[selectedModule] ? "Enabled" : "Disabled"}§7.`);
            system.run(() => player.runCommand("playsound note.bell @s"));

            if (selectedModule === RANK_DISPLAY_MODULE) {
                updateAllRankDisplays();
            }

            if (selectedModule.includes("ItemCheck")) startItemChecks();
            if (selectedModule.includes("Mob") || selectedModule.includes("Minecart")) startEntityChecks();
        } 
        else if (response.selection === Object.keys(main.moduleStates).length) {
            updateAllRankDisplays();
            player.sendMessage("§7[§b#§7] §aRefreshed all rank displays");
            system.run(() => player.runCommand("playsound note.bell @s"));
        }
        else {
            ModulesPanel(player);
            return;
        }

        ModuleStatesPanel(player);
    }).catch((error) => {
        console.error("Failed to show module states panel:", error);
    });
}

startItemChecks();
startEntityChecks();

//
// Module Command
//

Command.register({
    name: "module",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(adminTag),
}, (data, args) => {
    const { player } = data;
    const action = args[0]?.toLowerCase();
    const moduleName = args[1]?.toLowerCase();

    if (!action || !["enable", "disable", "list"].includes(action)) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse: §3!module §aenable§7/§cdisable §7<§gmodule§7> §7or §3!module §alist`);
        return;
    }

    if (action === "list") {
        let moduleList = "§7[§b#§7] §aModule States:\n";
        Object.entries(main.moduleStates).forEach(([key, state], index) => {
            moduleList += `§7[§e${index + 1}§7] §7[${state ? "§aENABLED" : "§cDISABLED"}§7] §e${key}\n`;
        });
        player.sendMessage(moduleList);
        return;
    }

    const availableModules = Object.keys(main.moduleStates);
    const actualModuleName = availableModules.find(key => key.toLowerCase() === moduleName);

    if (!actualModuleName) {
        player.sendMessage(`§7[§b#§7] §cInvalid module name. Available modules: ${availableModules.join(", ")}`);
        return;
    }

    if (action === "enable") {
        if (main.moduleStates[actualModuleName]) {
            player.sendMessage(`§7[§b#§7] §cModule §e${actualModuleName} §cis already enabled.`);
        } else {
            main.moduleStates[actualModuleName] = true;
            saveModuleStates();
            player.sendMessage(`§7[§b#§7] §aModule §e${actualModuleName} §ahas been enabled.`);

            if (actualModuleName.includes("ItemCheck")) startItemChecks();
            if (actualModuleName.includes("Mob") || actualModuleName.includes("Minecart")) startEntityChecks();
        }
    } else if (action === "disable") {
        if (!main.moduleStates[actualModuleName]) {
            player.sendMessage(`§7[§b#§7] §cModule §e${actualModuleName} §cis already disabled.`);
        } else {
            main.moduleStates[actualModuleName] = false;
            saveModuleStates();
            player.sendMessage(`§7[§b#§7] §aModule §e${actualModuleName} §ahas been disabled.`);

            if (actualModuleName.includes("ItemCheck")) startItemChecks();
            if (actualModuleName.includes("Mob") || actualModuleName.includes("Minecart")) startEntityChecks();
        }
    }
});


//
// Rank Display Systems
//

const RANK_DISPLAY_SCOREBOARD = "RANK_DISPLAY";
const RANK_DISPLAY_MODULE = "rankDisplaySystem";

function initRankScoreboard() {
    try {
        world.scoreboard.addObjective(RANK_DISPLAY_SCOREBOARD, "dummy");
    } catch (e) {
        // Scoreboard already exists
    }
}

function formatNameWithRank(player) {
    const tags = player.getTags();
    const rankTags = tags.filter(tag => tag.startsWith('rank:'));
    
    if (rankTags.length === 0) {
        return player.name; // No rank, return just name
    }

    const ranks = rankTags.map(tag => tag.replace('rank:', '')).join(' §7| ');
    return `${player.name}\n§7${ranks}`;
}

function updatePlayerRankDisplay(player) {
    if (!isModuleEnabled(RANK_DISPLAY_MODULE)) {
        if (player.nameTag.includes('\n')) {
            player.nameTag = player.name;
        }
        return;
    }

    const scoreboard = world.scoreboard.getObjective(RANK_DISPLAY_SCOREBOARD);
    if (!scoreboard) return;

    const formattedName = formatNameWithRank(player);
    
    if (player.nameTag !== formattedName) {
        player.nameTag = formattedName;
        scoreboard.setScore(player.scoreboardIdentity, 1);
    }
}

function updateAllRankDisplays() {
    const players = world.getPlayers();
    for (const player of players) {
        updatePlayerRankDisplay(player);
    }
}

function setupRankEventHandlers() {
    world.afterEvents.playerSpawn.subscribe(({ player }) => {
        updatePlayerRankDisplay(player);
    });

    world.afterEvents.entityHitEntity.subscribe(({ hitEntity }) => {
        if (hitEntity.typeId === "minecraft:player") {
            updatePlayerRankDisplay(hitEntity);
        }
    });

    world.afterEvents.playerJoin.subscribe(({ player }) => {
        system.runTimeout(() => {
            updatePlayerRankDisplay(player);
        }, 20);
    });
}

function startRankSystem() {
    initRankScoreboard();
    setupRankEventHandlers();
    updateAllRankDisplays();
    
    system.runInterval(updateAllRankDisplays, 20 * 30);
}

system.runTimeout(() => {
    startRankSystem();
}, 20);