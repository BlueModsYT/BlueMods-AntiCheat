import { world, system } from "@minecraft/server";
import main from "../commands/config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

const adminTag = main.adminTag;

function enchantCheck() {
    try {
        for (const player of world.getPlayers()) {
            if (player.hasTag(adminTag)) continue;

            const inventory = player.getComponent("inventory")?.container;
            if (!inventory || inventory.size === inventory.emptySlotsCount) continue;

            for (let i = 0; i < inventory.size; i++) {
                const item = inventory.getItem(i);
                if (!item || !item.typeId) continue;

                const enchantmentComponent = item.getComponent("enchantable");
                if (!enchantmentComponent) continue;

                const enchantments = enchantmentComponent.getEnchantments();
                let modified = false;

                /**
                 * @type {Enchantment[]}
                 */
                const newEnchantments = [];
                for (const enchant of enchantments) {
                    if (enchant.level > enchant.type.maxLevel) {
                        modified = true;
                    } else {
                        newEnchantments.push(enchant);
                    }
                }

                if (modified) {
                    enchantmentComponent.removeAllEnchantments();
                    for (const enchant of newEnchantments) {
                        enchantmentComponent.addEnchantment(enchant);
                    }
                    inventory.setItem(i, item);

                    player.sendMessage(`§7[§b#§7] §cIllegal enchantments removed§7: §e${item.typeId.replace("minecraft:", "")}`);

                    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                        admin.sendMessage(`§7[§d#§7] §e${player.name} §ais trying to get illegal enchantments§7: §e${item.typeId.replace("minecraft:", "")}`);
                        admin.runCommand(`playsound random.break @s`);
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error in enchantCheck:", error);
    }

    system.run(enchantCheck);
}

system.run(enchantCheck);