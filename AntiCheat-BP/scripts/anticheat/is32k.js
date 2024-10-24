import { world, system } from "@minecraft/server";
import main from "../commands/config.js";

// alrights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

const adminTag = main.adminTag;

function enchantCheck() {
    world.getPlayers().forEach((player) => {
        if (player.hasTag(adminTag)) return;

        const inventory = player.getComponent("inventory").container;
        if (!inventory || inventory.size === inventory.emptySlotsCount) return;

        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);

            if (!item || !item.typeId) continue;

            const enchantmentComponent = item.getComponent("minecraft:enchantments");
            if (!enchantmentComponent) continue;

            const enchantments = enchantmentComponent.enchantments;
            let modified = false;

            for (const enchant of enchantments) {
                const { type: { id, maxLevel }, level } = enchant;

                if (level > maxLevel) {
                    enchantments.removeEnchantment(enchant.type);
                    modified = true;
                }
            }

            if (modified) {
                enchantmentComponent.enchantments = enchantments;
                inventory.setItem(i, item);
                player.sendMessage(`§7[§b#§7] §cIllegal enchantments removed§7: §e${item.typeId}`);
                // Notification for Admins
                world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                    admin.sendMessage(`§7[§d#§7] §e${player.name} §ais trying to get illegal enchantments§7: §e${item.typeId}`);
                    admin.runCommandAsync(`playsound random.break @s`);
                });
            }
        }
    });

    system.run(enchantCheck);
}

system.run(enchantCheck);
