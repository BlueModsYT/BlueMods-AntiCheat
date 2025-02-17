import { world, system } from "@minecraft/server";
import { Command } from "../commands/CommandHandler.js";
import { isDanger, isOperator, isSpawnEgg, isUnknown } from "./config.js";
import main from "../commands/config.js";

const adminTag = "admin";
const trustedTag = "trusted";

const MODULE_STATES_KEY = "moduleStates";

// Initialize module states
const defaultModuleStates = {
    dangerItemCheck: true,
    operatorItemCheck: true,
    eggItemCheck: true,
    unknownItemCheck: true
};

// Load saved module states
system.run(() => {
    try {
        const storedStates = world.getDynamicProperty(MODULE_STATES_KEY);
        if (storedStates) {
            main.moduleStates = { ...defaultModuleStates, ...JSON.parse(storedStates) };
        } else {
            main.moduleStates = defaultModuleStates;
            world.setDynamicProperty(MODULE_STATES_KEY, JSON.stringify(defaultModuleStates));
        }
    } catch (error) {
        console.error(`Error loading module states: ${error.message}`);
        main.moduleStates = defaultModuleStates;
    }
});

// Save module states when modified
function saveModuleStates() {
    try {
        world.setDynamicProperty(MODULE_STATES_KEY, JSON.stringify(main.moduleStates));
    } catch (error) {
        console.error(`Error saving module states: ${error.message}`);
    }
}

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
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse: §3!module enable/disable <module> §7or §3!module list`);
        return;
    }

    if (action === "list") {
        let moduleList = "§7[§b#§7] §aModule States:\n";
        let count = 1;
        for (const [key, state] of Object.entries(main.moduleStates)) {
            moduleList += `§7[§e${count}§7] §7[${state ? "§aENABLED" : "§cDISABLED"}§7] §e${key}\n`;
            count++;
        }
        player.sendMessage(moduleList);
        return;
    }

    const availableModules = Object.keys(main.moduleStates);
    if (!availableModules.map((key) => key.toLowerCase()).includes(moduleName)) {
        player.sendMessage(`§7[§b#§7] §cInvalid module name. Available modules: ${availableModules.join(", ")}`);
        return;
    }

    if (action === "enable") {
        const actualModuleName = availableModules.find((key) => key.toLowerCase() === moduleName);
        if (main.moduleStates[actualModuleName]) {
            player.sendMessage(`§7[§b#§7] §cModule §e${actualModuleName} §cis already enabled.`);
        } else {
            main.moduleStates[actualModuleName] = true;
            saveModuleStates();
            player.sendMessage(`§7[§b#§7] §aModule §e${actualModuleName} §ahas been enabled.`);
        }
    } else if (action === "disable") {
        const actualModuleName = availableModules.find((key) => key.toLowerCase() === moduleName);
        if (!main.moduleStates[actualModuleName]) {
            player.sendMessage(`§7[§b#§7] §cModule §e${actualModuleName} §cis already disabled.`);
        } else {
            main.moduleStates[actualModuleName] = false;
            saveModuleStates();
            player.sendMessage(`§7[§b#§7] §aModule §e${actualModuleName} §ahas been disabled.`);
        }
    }
});

function isModuleEnabled(module) {
    return main.moduleStates[module];
}

function dangerItemCheck() {
    if (!isModuleEnabled("dangerItemCheck")) return;
    world.getPlayers().forEach((player) => {

        const inventory = player.getComponent("inventory").container;
        if (!inventory || inventory.size === inventory.emptySlotsCount) return;

        let itemRemoved = false;
        let removedItemType = null;

        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);

            if (item && isDanger.includes(item.typeId)) {
                removedItemType = item.typeId;
                inventory.setItem(i, null);
                itemRemoved = true;
            }
        }

        if (itemRemoved) {
            player.sendMessage("§7[§b#§7] §cYou are not allowed to use this item, make sure that you have permission to use it.");
            player.runCommandAsync(`playsound random.break @s`);
            // Notification for Admins
            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                if (removedItemType) {
                    const itemName = removedItemType.replace('minecraft:', '').replace(/_/g, ' ');
                    admin.sendMessage(`§7[§d#§7] §e${player.name} §ais trying to use illegal item: §e${itemName}`);
                    admin.runCommandAsync(`playsound random.break @s`);
                }
            });
        }
    });
    system.run(dangerItemCheck);
}

function operatorItemCheck() {
    if (!isModuleEnabled("operatorItemCheck")) return;
    world.getPlayers().forEach((player) => {
        if (player.hasTag(trustedTag) || player.hasTag(adminTag)) return;

        const inventory = player.getComponent("inventory").container;
        if (!inventory || inventory.size === inventory.emptySlotsCount) return;

        let itemRemoved = false;
        let removedItemType = null;

        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);

            if (item && isOperator.includes(item.typeId)) {
                removedItemType = item.typeId;
                inventory.setItem(i, null);
                itemRemoved = true;
            }
        }

        if (itemRemoved) {
            player.sendMessage("§7[§b#§7] §cYou are not allowed to use this item, make sure that you have permission to use it.");
            player.runCommandAsync(`playsound random.break @s`);
            // Notification for Admins
            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                if (removedItemType) {
                    const itemName = removedItemType.replace('minecraft:', '').replace(/_/g, ' ');
                    admin.sendMessage(`§7[§d#§7] §e${player.name} §ais trying to use illegal item: §e${itemName}`);
                    admin.runCommandAsync(`playsound random.break @s`);
                }
            });
        }
    });
    system.run(operatorItemCheck);
}

function eggItemCheck() {
    if (!isModuleEnabled("eggItemCheck")) return;
    world.getPlayers().forEach((player) => {
        if (player.hasTag(trustedTag) || player.hasTag(adminTag)) return;

        const inventory = player.getComponent("inventory").container;
        if (!inventory || inventory.size === inventory.emptySlotsCount) return;

        let itemRemoved = false;
        let removedItemType = null;

        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);

            if (item && isSpawnEgg.includes(item.typeId)) {
                removedItemType = item.typeId;
                inventory.setItem(i, null);
                itemRemoved = true;
            }
        }

        if (itemRemoved) {
            player.sendMessage("§7[§b#§7] §cYou are not allowed to use this item, make sure that you have permission to use it.");
            player.runCommandAsync(`playsound random.break @s`);
            
            // Notification for Admins
            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                if (removedItemType) {
                    const itemName = removedItemType.replace('minecraft:', '').replace(/_/g, ' ');
                    admin.sendMessage(`§7[§d#§7] §e${player.name} §ais trying to use illegal item: §e${itemName}`);
                    admin.runCommandAsync(`playsound random.break @s`);
                }
            });
        }
    });
    system.run(eggItemCheck);
}

function unknownItemCheck() {
    if (!isModuleEnabled("unknownItemCheck")) return;
    world.getPlayers().forEach((player) => {
        if (player.hasTag(adminTag)) return;

        const inventory = player.getComponent("inventory").container;
        if (!inventory || inventory.size === inventory.emptySlotsCount) return;

        let itemRemoved = false;
        let removedItemType = null;

        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);

            if (item && isUnknown.includes(item.typeId)) {
                removedItemType = item.typeId;
                inventory.setItem(i, null);
                itemRemoved = true;
            }
        }
        
        if (itemRemoved) {
            player.sendMessage("§7[§b#§7] §cYou are not allowed to use this item, make sure that you have permission to use it.");
            player.runCommandAsync(`playsound random.break @s`);
            // Notification for Admins
            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                if (removedItemType) {
                    const itemName = removedItemType.replace('minecraft:', '').replace(/_/g, ' ');
                    admin.sendMessage(`§7[§d#§7] §e${player.name} §ais trying to use illegal item: §e${itemName}`);
                    admin.runCommandAsync(`playsound random.break @s`);
                }
            });
        }
    });
    system.run(unknownItemCheck);
}

system.run(dangerItemCheck);
system.run(operatorItemCheck);
system.run(eggItemCheck);
system.run(unknownItemCheck);