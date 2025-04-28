import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import { Command } from "../../handlings/CommandHandler.js";
import main from "../config.js";

// all rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

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

// Register the dupe command
Command.register({
    name: "dupe",
    description: "Duplicates the item in your hand or from inventory",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag) // Admin restriction if needed
}, (data, args) => {
    const { player } = data;

    const inventory = player.getComponent("minecraft:inventory");
    if (!inventory) {
        player.sendMessage("§7[§b#§7] §cFailed to access inventory!");
        return;
    }

    const container = inventory.container;
    if (!container) {
        player.sendMessage("§7[§b#§7] §cInventory container is missing!");
        return;
    }

    const items = [];
    for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (item) items.push({ slot: i, item });
    }

    if (!items.length) {
        player.sendMessage("§7[§b#§7] §cYour inventory is empty!");
        return;
    }

    // Show action form for item selection
    const form = new ActionFormData()
        .title("§l§bBlueMods §7| §aDupe Item")
        .body("Select an item to duplicate:");

    items.forEach(entry => {
        form.button(`§e${entry.item.typeId} (§b${entry.item.amount}§e)`, `textures/items/${entry.item.typeId.split(":")[1]}`);
    });

    form.button("§7Back", "textures/ui/arrow_left");
    form.button("§7Close", "textures/ui/cancel");

    form.show(player).then((response) => {
        if (response.canceled || response.selection === items.length) return; // Close or back
        const selectedItem = items[response.selection];
        if (!selectedItem) {
            player.sendMessage("§7[§b#§7] §cItem no longer exists!");
            return;
        }

        // Duplicate the item and add to inventory
        const itemStack = selectedItem.item.clone();
        itemStack.amount *= 2;  // Double the amount

        const added = container.addItem(itemStack);
        if (added) {
            player.sendMessage(`§7[§b#§7] §aSuccessfully duplicated §e${selectedItem.item.typeId}§a!`);
        } else {
            // If inventory is full, drop excess items
            player.dimension.spawnEntity("minecraft:item", player.location).addItem(itemStack);
            player.sendMessage("§7[§b#§7] §cInventory full, excess items dropped!");
        }
    });
});