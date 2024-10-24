import { world, system } from "@minecraft/server";
import main from "../commands/config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

const adminTag = main.adminTag;

const isOperator = [
    "minecraft:command_block",
    "minecraft:chain_command_block",
    "minecraft:repeating_command_block",
    "minecraft:command_block_minecart",
    "minecraft:structure_block",
    "minecraft:structure_void",
    "minecraft:barrier",
    "minecraft:border_block",
    "minecraft:jigsaw",
    "minecraft:allow",
    "minecraft:deny",
    "minecraft:mob_spawner",
    "minecraft:trial_spawner",
    "minecraft:vault",
    "minecraft:light_block",
    "minecraft:light_block_0",
    "minecraft:light_block_1",
    "minecraft:light_block_2",
    "minecraft:light_block_3",
    "minecraft:light_block_4",
    "minecraft:light_block_5",
    "minecraft:light_block_6",
    "minecraft:light_block_7",
    "minecraft:light_block_8",
    "minecraft:light_block_9",
    "minecraft:light_block_10",
    "minecraft:light_block_11",
    "minecraft:light_block_12",
    "minecraft:light_block_13",
    "minecraft:light_block_14",
    "minecraft:light_block_15"
];

function operatorItemCheck() {
    world.getPlayers().forEach((player) => {
        if (player.hasTag(adminTag)) return;

        const inventory = player.getComponent("inventory").container;
        if (!inventory || inventory.size === inventory.emptySlotsCount) return;

        let itemRemoved = false;
        let removedItemType = null;  // Store the removed item type

        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);

            if (item && isOperator.includes(item.typeId)) {
                removedItemType = item.typeId;  // Store the type before removing
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
                    admin.sendMessage(`§7[§d#§7] §e${player.name} §ais trying to use operator item§7: §e${removedItemType.replace('minecraft:').replace(/_/g, ' ').replace('undefined', '')}`);
                    admin.runCommandAsync(`playsound random.break @s`);
                }
            });
        }
    });

    system.run(operatorItemCheck);
}

system.run(operatorItemCheck);
