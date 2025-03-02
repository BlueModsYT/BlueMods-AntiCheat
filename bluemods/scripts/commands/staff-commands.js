import { world, system } from "@minecraft/server";
import { Command } from "./CommandHandler.js";
import main from "./config.js";

// all rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

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

const BANNED_PLAYERS_KEY = "bannedPlayers";
let bannedPlayers = [];

system.run(() => {
    const storedBannedPlayers = world.getDynamicProperty(BANNED_PLAYERS_KEY);
    if (!storedBannedPlayers) {
        world.setDynamicProperty(BANNED_PLAYERS_KEY, JSON.stringify(bannedPlayers));
    } else {
        bannedPlayers = JSON.parse(storedBannedPlayers);
    }
});

function saveBannedPlayers() {
    world.setDynamicProperty(BANNED_PLAYERS_KEY, JSON.stringify(bannedPlayers));
}

function isPlayerBanned(playerName) {
    const currentTime = Date.now();
    const bannedPlayer = bannedPlayers.find(player => player.name === playerName);
    if (bannedPlayer && bannedPlayer.expiration && bannedPlayer.expiration < currentTime) {
        unbanPlayer(playerName);
        return false;
    }
    return !!bannedPlayer;
}

function parseCustomDuration(durationStr) {
    const timeUnits = {
        "m": 60000,           // minutes to milliseconds
        "h": 3600000,         // hours to milliseconds
        "d": 86400000,        // days to milliseconds
        "w": 604800000,       // weeks to milliseconds
    };

    const match = durationStr.match(/^(\d+)([mhdw])$/); // Match the format: number + unit (m, h, d, w)
    if (match) {
        const value = parseInt(match[1]);
        const unit = match[2];
        return value * timeUnits[unit];
    } else {
        return null;
    }
}

function banPlayer(targetName, reason, moderator, durationStr = null) {
    if (isPlayerBanned(targetName)) {
        moderator.sendMessage(`§7[§b#§7] §e${targetName} §cis already banned.`);
        return;
    }

    let expiration = null;
    if (durationStr) {
        const durationInMs = parseCustomDuration(durationStr);
        if (durationInMs) {
            expiration = Date.now() + durationInMs;
        } else {
            moderator.sendMessage("§7[§b#§7] §cInvalid duration format. Use: 1m, 1h, 1d, etc.");
            return;
        }
    }

    bannedPlayers.push({ name: targetName, reason, moderator: moderator.name, expiration });
    saveBannedPlayers();

    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (targetPlayer) {
        targetPlayer.runCommandAsync(`tag "${targetName}" add ban`);
        let message = `kick "${targetName}" §bBlueMods §7>> You have been banned from the server.\n§eReason§7: §c${reason}`;
        if (expiration) {
            const expirationDate = new Date(expiration);
            message += `\n§eBan Duration§7: §cUntil ${expirationDate.toLocaleString()}`;
        } else {
            message += `\n§eBan Duration§7: §cPermanent`;
        }
        targetPlayer.runCommandAsync(message);
    }

    moderator.sendMessage(`§7[§b#§7] §e${targetName} §ahas been banned for §c${reason}§a by §e${moderator.name}.`);
    moderator.runCommandAsync('playsound random.levelup @s');
}

function unbanPlayer(targetName, player = null) {
    const bannedIndex = bannedPlayers.findIndex(p => p.name === targetName);

    if (bannedIndex === -1) {
        if (player) {
            player.sendMessage(`§7[§b#§7] §e${targetName} §cis not banned.`);
        }
        return;
    }

    bannedPlayers.splice(bannedIndex, 1);
    saveBannedPlayers();

    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (targetPlayer) {
        targetPlayer.runCommandAsync(`tag "${targetName}" remove ban`);
    }

    if (player) {
        player.sendMessage(`§7[§b#§7] §e${targetName} §ahas been unbanned.`);
        player.runCommandAsync('playsound random.levelup @s');
    }
}

Command.register({
    name: "ban",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "!ban")) return;
    
    const action = args[0]?.toLowerCase();
    const durationOrTarget = args[1];
    const targetName = args[2];
    const reason = args.slice(3).join(" ") || "No reason specified";

    if (!["add", "list", "remove"].includes(action)) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this method§7: §3!ban §aadd §7[§aduration§7] ${main.player} <§areason§7> §7/ §3!ban §cremove ${main.player} §7/ §3!ban §alist`);
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    if (action === "add") {
        if (!targetName) {
            player.sendMessage(`§7[§b#§7] §cPlease specified a player to ban`);
            player.runCommandAsync('playsound random.break @s');
            return;
        }
    
        if (targetName === player.name || targetName === player.hasTag(main.adminTag)) {
            player.sendMessage(`§7[§b#§7] §cYou cannot ban yourself or another admin.`);
            return;
        }

        const durationInMs = parseCustomDuration(durationOrTarget);
        if (durationInMs) {
            banPlayer(targetName, reason, player, durationOrTarget);
        } else {
            banPlayer(durationOrTarget, reason, player); // No duration, permanent ban
        }

        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ahas banned §e${targetName} §aReason§7: §e${reason}`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } 
    else if (action === "list") {
        if (bannedPlayers.length === 0) {
            player.sendMessage('§7[§b#§7] §cNo players are currently banned.');
            player.runCommandAsync('playsound random.break @s');
        } else {
            const banList = bannedPlayers.map(p => {
                let expirationText = p.expiration ? `Until ${new Date(p.expiration).toLocaleString()}` : "Permanent";
                return `§e${p.moderator} §7[§gMOD§7] §7| §e${p.name} §aReason§7: ${p.reason} §7(§c${expirationText}§7)`;
            }).join("\n");
            player.sendMessage(`§7[§b#§7] §aBanned Players:\n${banList}`);
        }

    } 
    else if (action === "remove") {
        unbanPlayer(durationOrTarget, player);
    }
});

world.afterEvents.playerSpawn.subscribe((event) => {
    const { player } = event;
    if (isPlayerBanned(player.name)) {
        const bannedPlayer = bannedPlayers.find(p => p.name === player.name);
        let message = `kick "${player.name}" §bBlueMods §7>> You are banned from the server.\n§eReason§7: §c${bannedPlayer.reason}`;
        if (bannedPlayer.expiration) {
            const timeRemaining = Math.ceil((bannedPlayer.expiration - Date.now()) / 60000);
            message += `\n§eTime Left§7: §c${timeRemaining} minutes`;
        } else {
            message += `\n§eBan Duration§7: §cPermanent`;
        }
        player.runCommandAsync(message);
    }
});

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

Command.register({
    name: "clearchat",
    description: "",
    aliases: ["cc"],
    permission: (player) => player.hasTag(main.adminTag),
}, (data) => {
    const player = data.player;
    if (!isAuthorized(player, "!clearchat")) return;
    
    
    player.sendMessage(`\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n`);
    player.runCommandAsync(`playsound note.bell @s`);
});

Command.register({
    name: "cmdsf",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player
    if (!isAuthorized(player, "!cmdsf")) return;
    
    const enable = "enable", disable = "disable";
    
    if (disable.includes(args[0])) { 
        player.runCommandAsync(`playsound note.bell @s`);
        player.runCommandAsync('gamerule commandblockoutput false');
        player.runCommandAsync('gamerule sendcommandfeedback false');
        player.sendMessage(`§7[§b#§7] §aSuccesfully §cdisabled §aCommand Logs`);
        // Notification for Admins
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!cmdsf disable`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } else if (enable.includes(args[0])) {
        player.runCommandAsync(`playsound note.bell @s`);
        player.runCommandAsync('gamerule commandblockoutput true');
        player.runCommandAsync('gamerule sendcommandfeedback true');
        player.sendMessage(`§7[§b#§7] §aSuccesfully §3enabled §aCommand Logs`);
        // Notification for Admins
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!cmdsf enable`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } else {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!cmdsf ${main.enabledisable}`);
        player.runCommandAsync(`playsound random.break @s`);
    }
});

Command.register({
    name: "ecwipe",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, async (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!ecwipe")) return;
    
    if (!args[0]) {
        player.sendMessage(`§7[§b#§7] §aTry to mention a player to remove there ender_chest. §3!ecwipe ${main.playerl}`);
        return player.runCommandAsync('playsound random.break @s');
    }

    let targetPlayer;
    try {
        targetPlayer = world.getPlayers().find(p => p.name === args[0]);
    } catch (error) {
        return player.sendMessage(`§7[§b#§7] §aError finding player: ${error.message}`);
    }

    if (!targetPlayer) {
        player.sendMessage('§7[§b#§7] §aPlayer name must be someone currently on the server');
        return player.runCommandAsync('playsound random.break @s');
    }

    if (targetPlayer === player) {
         player.sendMessage('§7[§b#§7] §cYou cannot clear your own ender_chest.');
         return player.runCommandAsync('playsound random.break @s');
    }
     if (targetPlayer.hasTag(main.adminTag)) {
         player.sendMessage('§7[§b#§7] §cYou can\'t clear a staff member ender_chest.');
         return player.runCommandAsync('playsound random.break @s');
    }

    try {
        player.runCommandAsync(`playsound note.bell @s`)
        player.sendMessage(`§7[§b#§7] §aSuccessfully §cremove ender_chest items on §e${targetPlayer.name}.`);
        for (let i = 0; i < 27; i++) player.runCommandAsync(`replaceitem entity "${targetPlayer.name}" slot.enderchest ${i} air`);
        // Notification for Admins
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!ecwipe to ${targetPlayer.name}`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } catch (error) {
        player.sendMessage(`§7[§b#§7] §aError adding notify tag: ${error.message}`);
    }
});

Command.register({
    name: "freeze",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag)
}, async (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!freeze")) return;
    
    const action = args[0]?.toLowerCase();
    const targetName = args[1];
    
    if (!targetName) {
        player.sendMessage('§7[§b#§7] §cPlease specify a player name.');
        return;
    }

    const [targetPlayer] = world.getPlayers({ name: targetName });
    
    if (action === "list") {
        const frozenPlayers = world.getPlayers()
            .filter(p => p.hasTag('freezed'))
            .map(p => p.name)
            .join('§7, §r');
        player.sendMessage(`§7[§b#§7] §aFrozen Players: §e${frozenPlayers || 'None'}`);
        return;
    }

    if (!["add", "remove"].includes(action)) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! Use: §3!freeze §aadd/remove <player> §7or §3!freeze list`);
        return;
    }

    if (!targetPlayer) {
        player.sendMessage('§7[§b#§7] §cPlayer not found!');
        return;
    }

    if (targetPlayer.hasTag(main.adminTag) || targetPlayer.name === player.name) {
        player.sendMessage(`§7[§b#§7] §cYou cannot freeze yourself or another admin.`);
        return;
    }

    const isFreezed = targetPlayer.hasTag("freezed");
    if (action === "add" && isFreezed) {
        player.sendMessage(`§7[§b#§7] §c${targetPlayer.name} is already frozen.`);
        return;
    }
    if (action === "remove" && !isFreezed) {
        player.sendMessage(`§7[§b#§7] §c${targetPlayer.name} is not frozen.`);
        return;
    }

    try {
        if (action === "add") {
            await targetPlayer.addTag("freezed");
            await targetPlayer.runCommandAsync(`ability @s movement false`);
            player.sendMessage(`§7[§b#§7] §aFroze §e${targetPlayer.name}`);
        } else {
            await targetPlayer.removeTag("freezed");
            await targetPlayer.runCommandAsync(`ability @s movement true`);
            player.sendMessage(`§7[§b#§7] §aUnfroze §e${targetPlayer.name}`);
        }
        
        // Notify admins
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §a${action}ed freeze on §e${targetPlayer.name}`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } catch (error) {
        player.sendMessage(`§7[§b#§7] §cError: ${error.message}`);
    }
});

Command.register({
    name: "give",
    description: "",
    aliases: ['i'],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!give")) return;
    
    if (args.length < 2) {
        player.sendMessage('§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!give §7<§aitem§7> §7<§aamount§7> §7[§gdata§7]');
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    const item = args[0];
    const amount = parseInt(args[1]);
    const data = args[2] || 0;

    if (isNaN(amount) || amount < 1) {
        player.sendMessage('§7[§b#§7] §cAmount must be a positive number');
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    try {
        const formattedItem = item.startsWith('minecraft:') ? item : `minecraft:${item}`;
        player.runCommandAsync(`give @s ${formattedItem} ${amount} ${data}`);
        player.sendMessage(`§7[§b#§7] §aGave §e${amount}x ${formattedItem} §awith data §e${data}`);
        player.runCommandAsync('playsound random.levelup @s');

        // Notification for Admins
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §agave themselves §e${amount}x ${formattedItem}`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } catch (error) {
        player.sendMessage(`§7[§b#§7] §cError giving item: ${error.message}`);
        player.runCommandAsync('playsound random.break @s');
    }
});