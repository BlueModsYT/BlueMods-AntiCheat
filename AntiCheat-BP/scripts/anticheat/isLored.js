import { world, system } from "@minecraft/server";
import main from "../commands/config.js";

// All rights reserved @bluemods.lol - discord account. Please report any bugs or glitches in our discord server: https://dsc.gg/bluemods.

const items = [
    "minecraft:lit_furnace",
    "minecraft:lit_blast_furnace",
    "minecrart:lit_smoker",
    "minecraft:brewing_stand",
    "minecraft:chest",
    "minecraft:trapped_chest",
    "minecraft:dispenser",
    "minecraft:dropper",
    "minecraft:furnace",
    "minecraft:blast_furnace",
    "minecraft:smoker",
    "minecraft:hopper",
    "minecraft:barrel",
    "minecraft:shulker_box",
    "minecraft:ender_chest",
    "minecraft:colored_shulker_box",
    "minecraft:crafter",
    "minecrart:command_block",
    "minecrart:repeating_command_block",
    "minecrart:chain_command_block",
    "minecrart:structure_block",
    "minecrart:jigsaw"
];

function hasLore(item) {
    return Boolean(item?.getLore().length);
}

system.runInterval(() => {
    try {
        for (const player of world.getPlayers()) {
            if (player.hasTag(main.adminTag)) return;
            const inv = player.getComponent("inventory").container;
            for (let i = 0; i < inv.size; i++) {
                const item = inv.getItem(i);
                if (items.includes(item?.typeId) && hasLore(item)) {
                    player.runCommandAsync(`clear @s ${item?.typeId.replace('minecraft:').replace(/_/g, ' ').replace('undefined', '')}`);
                    player.sendMessage(`§7[§b#§7] §cYou are not allowed to use this item, make sure that you have permission to use it.`);
                    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                        admin.sendMessage(`§7[§d#§7] §e${player.name} §ais trying to use "§e${item?.typeId.replace('minecraft:').replace(/_/g, ' ').replace('undefined', '')}§a" or lored containers.`);
                        admin.runCommandAsync(`playsound random.break @s`);
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error in loreCheck:", error);
    }
}, 1);