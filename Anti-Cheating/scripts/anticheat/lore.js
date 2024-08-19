import { world, system } from "@minecraft/server";
import main from "../commands/config.js";

const items = [
    "minecraft:lit_furnace",
    "minecraft:lit_blast_furnace",
    "minecraft:brewing_stand",
    "minecraft:chest",
    "minecraft:trapped_chest",
    "minecraft:despenser",
    "minecraft:dropper",
    "minecraft:furnace",
    "minecraft:blast_furnace",
    "minecraft:smoker",
    "minecraft:hopper",
    "minecraft:barrel",
    "minecraft:shulker_box",
    "minecraft:ender_chest",
    "minecraft:colored_shulker_box"
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
                    player.addTag("nolore");
                }
            }
        }
    } catch (error) {
        console.error("Error in loreCheck:", error);
    }
}, 1);
