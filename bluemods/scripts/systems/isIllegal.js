import { world, system } from "@minecraft/server";
import { Command } from "./handler/CommandHandler.js";
import { ActionFormData } from "@minecraft/server-ui";
import { isLored, isDanger, isOperator, isSpawnEgg, isUnknown } from "./config.js";
import { ModulesPanel } from "../chat/playerCompass.js";
import main from "../commands/config.js";

const adminTag = "admin";
const trustedTag = "trusted";
const MODULE_STATES_KEY = "moduleStates";
const MAX_ITEM_NBT_SIZE = 1024;
const playerClicks = new Map();

const defaultModuleStates = {
    loredItemCheck: true,
    dangerItemCheck: true,
    operatorItemCheck: true,
    eggItemCheck: true,
    unknownItemCheck: true,
    nbtItemCheck: true,
    isAgentMob: true,
    isCommandBlockMinecart: true,
    isNPCMob: false
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

function itemCheck(player, itemList, moduleName) {
    if (!isModuleEnabled(moduleName)) return;

    const inventory = player.getComponent("inventory").container;
    if (!inventory || inventory.size === inventory.emptySlotsCount) return;

    let itemRemoved = false;
    let removedItemType = null;

    for (let i = 0; i < inventory.size; i++) {
        const item = inventory.getItem(i);
        if (item && itemList.includes(item.typeId)) {
            removedItemType = item.typeId;
            inventory.setItem(i, null);
            itemRemoved = true;
        }
    }

    if (itemRemoved) {
        player.sendMessage("§7[§b#§7] §cYou are not allowed to use this item.");
        player.runCommandAsync(`playsound random.break @s`);

        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            if (removedItemType) {
                const itemName = removedItemType.replace('minecraft:', '').replace(/_/g, ' ');
                admin.sendMessage(`§7[§d#§7] §e${player.name} §ais trying to use illegal item: §e${itemName}`);
                admin.runCommandAsync(`playsound random.break @s`);
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
                admin.runCommandAsync(`playsound random.break @s`);
            });
        }
    }
}

function hasLore(item) {
    return Boolean(item?.getLore()?.length);
}

system.runInterval(() => {
    try {
        if (!main.moduleStates.loredItemCheck) return;

        for (const player of world.getPlayers()) {
            if (player.hasTag(main.adminTag)) continue;

            const inv = player.getComponent("inventory").container;
            for (let i = 0; i < inv.size; i++) {
                const item = inv.getItem(i);
                if (item && isLored.includes(item.typeId) && hasLore(item)) {
                    inv.setItem(i, null);

                    player.runCommandAsync(`playsound random.break @s`);
                    player.sendMessage(`§7[§b#§7] §cYou are not allowed to use this item, ensure you have permission.`);

                    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                        admin.sendMessage(`§7[§d#§7] §e${player.name} §ais trying to use a lored item: "§e${item.typeId.replace('minecraft:', '').replace(/_/g, ' ')}§a".`);
                        admin.runCommandAsync(`playsound random.break @s`);
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error in loreCheck:", error);
    }
}, 1);

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
        .title("§l§bBlueMods §7| §aModule States")
        .body("§cWarning: Disabling this module may put the server at risk!\n§fOnly turn it off if you fully understand the consequences.");

    Object.entries(main.moduleStates).forEach(([module, isEnabled]) => {
        const statusText = isEnabled ? "§aEnabled" : "§cDisabled";
        const statusIcon = isEnabled ? "textures/ui/realms_green_check.png" : "textures/ui/redX1.png";
        form.button(`§e${module}\n§7[ ${statusText} §7]`, statusIcon);
    });

    form.button("§cBack", "textures/ui/arrow_left");

    form.show(player).then((response) => {
        if (response.canceled) return;

        if (response.selection === Object.keys(main.moduleStates).length) {
            ModulesPanel(player);
            return;
        }

        const selectedModule = Object.keys(main.moduleStates)[response.selection];
        main.moduleStates[selectedModule] = !main.moduleStates[selectedModule];
        saveModuleStates();

        player.sendMessage(`§7[§b#§7] §aToggled §e${selectedModule} §7to §b${main.moduleStates[selectedModule] ? "Enabled" : "Disabled"}§7.`);
        player.runCommandAsync("playsound note.bell @s");

        if (selectedModule.includes("ItemCheck")) startItemChecks();
        if (selectedModule.includes("Mob") || selectedModule.includes("Minecart")) startEntityChecks();

        ModuleStatesPanel(player);
    }).catch((error) => {
        console.error("Failed to show module states panel:", error);
    });
}

startItemChecks();
startEntityChecks();
