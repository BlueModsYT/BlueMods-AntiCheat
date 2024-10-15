import { world, system } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// alrights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

function isCommandEnabled(commandName) {
    return main.enabledCommands[commandName] !== undefined ? main.enabledCommands[commandName] : true;
}

const isAuthorized = (player, commandName) => {
    if (!isCommandEnabled(commandName)) {
        player.sendMessage(`§7[§b#§7] §cThis command §e${commandName} §cis currently disabled.`);
        player.runCommandAsync(`playsound random.break @s`);
        return false;
    }
    return true;
};

const BANNED_ITEMS_KEY = "bannedItems";
let bannedItems = [];

system.run(() => {
    const storedBannedItems = world.getDynamicProperty(BANNED_ITEMS_KEY);
    if (!storedBannedItems) {
        world.setDynamicProperty(BANNED_ITEMS_KEY, JSON.stringify(bannedItems));
    } else {
        bannedItems = JSON.parse(storedBannedItems);
    }
});

function saveBannedItems() {
    world.setDynamicProperty(BANNED_ITEMS_KEY, JSON.stringify(bannedItems));
}

Command.register({
    name: "banitem",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "!banitem")) return;
    
    const action = args[0]?.toLowerCase();
    const itemName = args[1]?.toLowerCase();

    if (!["add", "remove", "list"].includes(action)) {
        player.sendMessage('§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!banitem §aadd §7<§aitem§7> / §3!banitem §cremove §7<§aitem§7> / §3!banitem §alist.');
        return player.runCommandAsync('playsound random.break @s');
    }

    if (action === "add") {
        if (!itemName) {
            player.sendMessage('§7[§b#§7] §cPlease specify an item to ban.');
            player.runCommandAsync('playsound random.break @s');
            return;
        }

        const formattedItemName = itemName.startsWith("minecraft:") ? itemName : `minecraft:${itemName}`;

        if (bannedItems.includes(formattedItemName)) {
            player.sendMessage(`§7[§b#§7] §cThe item §e${formattedItemName}§c is already banned.`);
            player.runCommandAsync('playsound random.bell @s');
            return;
        }
        
        bannedItems.push(formattedItemName);
        saveBannedItems();
        
        player.sendMessage(`§7[§b#§7] §e${formattedItemName} §ahas been added to the banned items list.`);
        player.runCommandAsync('playsound note.bell @s');

    } else if (action === "remove") {
        if (!itemName) {
            player.sendMessage('§7[§b#§7] §cPlease specify an item to remove from the ban list.');
            player.runCommandAsync('playsound random.break @s');
            return;
        }

        const formattedItemName = itemName.startsWith("minecraft:") ? itemName : `minecraft:${itemName}`;
        const index = bannedItems.indexOf(formattedItemName);
        if (index === -1) {
            player.sendMessage(`§7[§b#§7] §cThe item §e${formattedItemName}§c is not banned.`);
            player.runCommandAsync('playsound random.break @s');
            return;
        }

        bannedItems.splice(index, 1);
        saveBannedItems();

        player.sendMessage(`§7[§b#§7] §e${formattedItemName} §ahas been removed from the banned items list.`);
        player.runCommandAsync('playsound note.bell @s');

    } else if (action === "list") {
        if (bannedItems.length === 0) {
            player.sendMessage('§7[§b#§7] §cThere are no banned items.');
        } else {
            const itemList = bannedItems.map(item => `§e${item}`).join(", ");
            player.sendMessage(`§7[§b#§7] §aBanned items: §e${itemList}`);
        }
        player.runCommandAsync('playsound note.bell @s');
    }
});

world.afterEvents.itemUse.subscribe((event) => {
    const { source: player, itemStack } = event;

    if (player.hasTag(main.adminTag)) return; // Admins are exempt
    if (bannedItems.includes(itemStack.typeId)) {
        player.runCommandAsync('clear @s ' + itemStack.typeId);
        player.sendMessage(`§7[§b#§7] §cThe item §e${itemStack.typeId} §chas been banned and removed from your inventory.`);
        player.runCommandAsync('playsound random.break @s');
    }
});

system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const inventory = player.getComponent("inventory").container;
        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            if (player.hasTag(main.adminTag)) return;
            if (item && bannedItems.includes(item.typeId)) {
                inventory.setItem(i, null);
                player.sendMessage(`§7[§b#§7] §cThe item §e${item.typeId}§c is banned and has been removed.`);
                player.runCommandAsync('playsound random.break @s');
            }
        }
    }
}, 5);
