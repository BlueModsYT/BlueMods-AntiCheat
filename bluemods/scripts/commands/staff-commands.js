import { world, system } from "@minecraft/server";
import { Command } from "../systems/handler/CommandHandler.js";
import { banPlayer, unbanPlayer, mutePlayer, unmutePlayer, freezePlayer, unfreezePlayer } from "../systems/handler/ModHandler.js";
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

    // if (player.hasTag(main.adminTag)) return;
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
    const targetName = args[1] || player.name;
    const [targetPlayer] = world.getPlayers({ name: targetName });
    
    if (action === "list") {
        const freezedPlayers = world.getPlayers().filter(p => p.hasTag('freezed')).map(p => p.name).join('§7,§r ');
        player.sendMessage(`§7[§b#§7] §aFreezed: §e${freezedPlayers || 'No freezed player found'}`);
        return;
    }

    if (!["add", "remove"].includes(action)) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!freeze §aadd ${main.player} §7/ §3!freeze §cremove ${main.player} §7/ §3!freeze §alist`);
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    if (!targetPlayer) {
        player.sendMessage('§7[§b#§7] §aPlayer not found! Please specify a valid player name.');
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    try {
        if (action === "add") {
            if (targetPlayer.hasTag(main.adminTag) || targetPlayer.name === player.name) {
                player.sendMessage(`§7[§b#§7] §cYou cannot freeze yourself or admin.`);
                return;
            }
            
            if (!targetPlayer.hasTag("freezed")) {
                await system.run(() => targetPlayer.addTag("freezed"));
                player.runCommandAsync(`playsound note.bell @s`);
                player.runCommandAsync(`inputpermission set "${targetPlayer.name}" camera disabled`);
                player.runCommandAsync(`inputpermission set "${targetPlayer.name}" movement disabled`);
                player.sendMessage(`§7[§b#§7] §aSuccessfully §3added §amute status to §e${targetPlayer.name}`);
                
                // Notification for Admins
                world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                    admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!freeze add §ato §e${targetPlayer.name}`);
                    admin.runCommandAsync(`playsound note.pling @s`);
                });
            } else {
                player.runCommandAsync('playsound random.break @s');
                player.sendMessage(`§7[§b#§7] §c${targetPlayer.name} this player is already freezed`);
            }
        } else if (action === "remove") {
            if (targetPlayer.hasTag("freezed")) {
                await system.run(() => targetPlayer.removeTag("freezed"));
                player.runCommandAsync(`playsound note.bell @s`);
                player.runCommandAsync(`inputpermission set "${targetPlayer.name}" camera disabled`);
                player.runCommandAsync(`inputpermission set "${targetPlayer.name}" movement disabled`);
                player.sendMessage(`§7[§b#§7] §aSuccessfully §cremoved §amute status from §e${targetPlayer.name}`);
                
                // Notification for Admins
                world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                    admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!freeze remove §ato §e${targetPlayer.name}`);
                    admin.runCommandAsync(`playsound note.pling @s`);
                });
            } else {
                player.runCommandAsync('playsound random.break @s');
                player.sendMessage(`§7[§b#§7] §c${targetPlayer.name} this player is not freezed.`);
            }
        }
    } catch (error) {
        player.sendMessage(`§7[§b#§7] §cError modifying player tags: ${error.message}`);
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
        return player.runCommandAsync('playsound random.break @s');
  }

  const [item, amount, ...dataArgs] = args;
  const dataValue = dataArgs.join(" ") || "0"; // Join remaining args for optional data and default to "0" if not provided

  const parsedAmount = parseInt(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return player.sendMessage('§7[§b#§7] §cAmount must be a valid number greater than 0.');
  }

  player.runCommandAsync(`give @s ${item} ${parsedAmount} ${dataValue}`)
    .then(() => {
      player.sendMessage(`§7[§b#§7] §aSuccessfully gave yourself §e${parsedAmount} ${item}§a(s).`);
    })
    .catch((error) => {
      player.sendMessage(`§7[§b#§7] §eFailed to give item: ${error}`);
    });
});

Command.register({
    name: "invsee",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!invsee")) return;
    

    if (args.length < 1) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!invsee ${main.player}`);
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    const targetPlayerName = args[0];
    const targetPlayer = world.getPlayers().find(p => p.name === targetPlayerName);

    if (targetPlayer) {
        const inventory = targetPlayer.getComponent("minecraft:inventory").container;
        let items = [];

        for (let i = 0; i < inventory.size; i++) {
            let item = inventory.getItem(i);
            if (item) {
                items.push(`§7[§a${i + 1}§7] "§e${item.typeId}§7" "§f${item.amount}§7"`);
            }
        }

        if (items.length > 0) {
            player.sendMessage(`§7[§b#§7] §e${targetPlayerName} §7Inventory:\n${items.join("\n")}`);
            // Notification for Admins
            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!invsee §ato §e${targetPlayer.name}`);
                admin.runCommandAsync(`playsound note.pling @s`);
            });
        } else {
            player.sendMessage(`§7[§b#§7] §cLooks like this user §e${targetPlayerName} §chas an empty inventory.`);
            player.runCommandAsync('playsound random.break @s');
            return;
        }
    } else {
        player.sendMessage(`§7[§b#§7] §aPlayer name must be someone currently on the server`);
        player.runCommandAsync('playsound random.break @s');
        return;
    }
});

Command.register({
    name: "invwipe",
    description: "",
    aliases: ["clear"],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!invwipe")) return;
    

    if (args.length < 1) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!invwipe ${main.player}`);
        return player.runCommandAsync('playsound random.break @s');
    }

    const targetPlayerName = args[0];
    const targetPlayer = world.getPlayers().find(p => p.name === targetPlayerName);

    if (targetPlayer) {
        player.runCommandAsync(`clear ${targetPlayerName}`);
        player.runCommandAsync(`playsound level.up @s`);
        player.sendMessage(`§7[§b#§7] §aSuccessfully Cleared §e${targetPlayerName}§a's inventory.`);
        // Notification for Admins
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!invsee §ato §e${targetPlayer.name}`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } else {
        player.sendMessage(`§7[§b#§7] §aPlayer name must be someone currently on the server`);
        player.runCommandAsync(`playsound random.break @s`);
    }
});

Command.register({
    name: "kick",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!kick")) return;
    

    if (args.length < 2) {
        player.sendMessage('§7[§b#§7] §aUse this method to kick the user§7: §3!kick §a<player> <reason>');
        return player.runCommandAsync('playsound random.break @s');
    }

    const targetPlayerName = args[0];
    const reason = args.slice(1).join(" ");

    let targetPlayer;
    try {
        targetPlayer = world.getPlayers().find(p => p.name === targetPlayerName);
    } catch (error) {
        return player.sendMessage(`§7[§b#§7] §aError finding player: ${error.message}`);
    }
    
    if (!targetPlayer) {
        player.sendMessage('§7[§b#§7] §aPlayer name must be someone currently on the server');
        return player.runCommandAsync('playsound random.break @s');
    }
    
    if (targetPlayer === player) {
        player.sendMessage('§7[§b#§7] §cYou cannot kick yourself.');
        return player.runCommandAsync('playsound random.break @s');
    }
    if (targetPlayer.hasTag(main.adminTag)) {
        player.sendMessage('§7[§b#§7] §cYou can\'t kick a staff member.');
        return player.runCommandAsync('playsound random.break @s');
    }
    
    try {
        player.runCommandAsync(`playsound note.bell @s`);
        player.sendMessage(`§7[§b#§7] §aSuccessfully kicked out §e${targetPlayer.name} §afrom the server for§7: §g${reason}`);
        player.runCommandAsync(`kick "${targetPlayer.name}" "\n§bBlueMods §7>> §aYou have been kicked from the server\n§eModerator§7: §g${player.name}\n§eReason§7: §g${reason}"`);
        // Notification for Admins
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!kick §ato §e${targetPlayer.name} §aReason§7: §e${reason}`);
            admin.runCommandAsync(`playsound note.pling @s`);
        });
    } catch (error) {
        player.sendMessage(`§7[§b#§7] §aError executing kick: ${error.message}`);
    }
});

Command.register({
    name: "lagclear",
    description: "",
    aliases: ["lc"],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "!lagclear")) return;
    
    const action = args[0]?.toLowerCase();
    
    if (!["default", "mobs", "all"].includes(action)) {
        player.sendMessage('§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!lagclear §adefault §7/ §3!lagclear §amobs §7/ §3!lagclear §aall');
        player.runCommandAsync('playsound random.break @s');
        return;
    }
    
    if (action === "default") {
        player.runCommandAsync(`kill @e[type=item]`);
        player.runCommandAsync(`kill @e[type=arrow]`);
        player.runCommandAsync(`kill @e[type=xp_orb]`);
        player.runCommandAsync(`playsound note.bell @s`);
        player.sendMessage(`§7[§b#§7] §aSuccesfully use Default§7: §aItem Entities, XP Orbs, Arrows.`);
    } else if (action === "mobs") {
        player.runCommandAsync(`kill @e[type=!player, type=!armor_stand]`);
        player.runCommandAsync(`playsound note.bell @s`);
        player.sendMessage(`§7[§b#§7] §aSuccessfully use Mobs§7: §aMob Entities.`);
    } else if (action === "all") {
        player.runCommandAsync(`kill @e[type=!player]`);
        player.runCommandAsync(`playsound note.bell @s`);
        player.sendMessage(`§7[§b#§7] §aSuccessfully use All§7: §aAll Mob Entities.`);
    }
}); 

const mutedPlayers = new Set();

function listMutes(player) {
    if (mutedPlayers.size === 0) {
        player.sendMessage("§7[§b#§7] §aNo players are currently muted.");
        return;
    }

    const muteList = Array.from(mutedPlayers).join(", ");
    player.sendMessage(`§7[§b#§7] §aMuted players: §e${muteList}`);
}

Command.register({
    name: "mute",
    description: "Manage player mutes",
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;

    if (args.length < 2) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!mute ${main.addremove} ${main.player} §7/ §3!mute §alist`);
        return;
    }

    const action = args[0].toLowerCase(); 
    const targetName = args[1];

    if (action === "list") {
        listMutes(player);
        return;
    }

    if (!targetName) {
        player.sendMessage(`§7[§b#§7] §cUsage: §e!mute ${action} <player>`);
        return;
    }

    switch (action) {
        case "add":
            mutePlayer(player, targetName);
            break;
        case "remove":
            unmutePlayer(player, targetName);
            break;
        default:
            player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!mute ${main.addremove} ${main.player} §7/ §3!mute §alist`);
            break;
    }
});

world.beforeEvents.chatSend.subscribe((data) => {
    const { sender } = data;
    if (mutedPlayers.has(sender.name)) {
        data.cancel = true;
        sender.sendMessage("§7[§b#§7] §cYou are muted and cannot send messages.");
    }
});

Command.register({
    name: "notify",
    description: "",
    aliases: [],
    permission: (player) => (player.hasTag(main.adminTag) || player.isOp())
}, async (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!notify")) return;
    
    const action = args[0]?.toLowerCase();
    const targetName = args[1] || player.name;
    const [targetPlayer] = world.getPlayers({ name: targetName });
    
    if (action === "list") {
        const notifyPlayers = world.getPlayers().filter(p => p.hasTag('notify')).map(p => p.name).join(', ');
        player.sendMessage(`§7[§b#§7] §aNotify List: §e${notifyPlayers || 'No notify player found'}`);
        return;
    }

    if (!["add", "remove"].includes(action)) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!notify §aadd ${main.player} §7/ §3!notify §cremove ${main.player} §7/ §3!notify §alist`);
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    if (!targetPlayer) {
        player.sendMessage('§7[§b#§7] §aPlayer not found! Please specify a valid player name.');
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    try {
        if (action === "add") {
            if (!targetPlayer.hasTag("notify")) {
                await system.run(() => targetPlayer.addTag("notify"));
                player.runCommandAsync(`playsound note.bell @s`);
                player.sendMessage(`§7[§b#§7] §aSuccessfully §3added §anotify status to §e${targetPlayer.name}`);
                
            } else {
                player.sendMessage(`§7[§b#§7] §c${targetPlayer.name} already has notify status.`);
            }
        } else if (action === "remove") {
            if (targetPlayer.hasTag("notify")) {
                await system.run(() => targetPlayer.removeTag("notify"));
                player.runCommandAsync(`playsound note.bell @s`);
                player.sendMessage(`§7[§b#§7] §aSuccessfully §cremoved §anotify status from §e${targetPlayer.name}`);
                
            } else {
                player.sendMessage(`§7[§b#§7] §c${targetPlayer.name} does not have notify status.`);
            }
        }
    } catch (error) {
        player.sendMessage(`§7[§b#§7] §cError modifying player tags: ${error.message}`);
    }
});

Command.register({
    name: "op",
    description: "",
    aliases: [],
    permission: (player) => (player.hasTag(main.adminTag) || player.isOp())
}, async (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!op")) return;
    
    const action = args[0]?.toLowerCase(); // First argument: add, remove, or list
    const targetName = args[1] || player.name; // Second argument: target player's name, default to the command executor
    const [targetPlayer] = world.getPlayers({ name: targetName });
    
    if (action === "list") {
        const adminPlayers = world.getPlayers().filter(p => p.hasTag('admin')).map(p => p.name).join(', ');
        player.sendMessage(`§7[§b#§7] §aAdmins: §e${adminPlayers || 'No admins found'}`);
        return;
    }

    if (!["add", "remove"].includes(action)) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!op §aadd ${main.player} §7/ §3!op §cremove ${main.player} §7/ §3!op §alist`);
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    if (!targetPlayer) {
        player.sendMessage('§7[§b#§7] §aPlayer not found! Please specify a valid player name.');
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    try {
        if (action === "add") {
            if (!targetPlayer.hasTag("admin")) {
                await system.run(() => targetPlayer.addTag("admin"));
                player.runCommandAsync(`playsound note.bell @s`);
                player.sendMessage(`§7[§b#§7] §aSuccessfully §3added §aadmin status to §e${targetPlayer.name}`);
                
            } else {
                player.sendMessage(`§7[§b#§7] §c${targetPlayer.name} already has admin status.`);
            }
        } else if (action === "remove") {
            if (targetPlayer.hasTag("admin")) {
                await system.run(() => targetPlayer.removeTag("admin"));
                player.runCommandAsync(`playsound note.bell @s`);
                player.sendMessage(`§7[§b#§7] §aSuccessfully §cremoved §aadmin status from §e${targetPlayer.name}`);
                
            } else {
                player.sendMessage(`§7[§b#§7] §c${targetPlayer.name} does not have admin status.`);
            }
        }
    } catch (error) {
        player.sendMessage(`§7[§b#§7] §cError modifying player tags: ${error.message}`);
    }
});

const playerCooldowns = new Map();
let defaultCooldownSeconds = 10; // Default cooldown in seconds
const MIN_COOLDOWN_SECONDS = 5;  // Minimum allowed cooldown duration

system.runInterval(() => {
    const currentTick = system.currentTick;

    for (const player of world.getPlayers()) {
        const playerName = player.name;
        const cooldownEndTick = playerCooldowns.get(playerName);

        if (cooldownEndTick && currentTick >= cooldownEndTick) {
            player.sendMessage("§7[§b#§7] §aYou can now use Ender Pearls again!");
            player.runCommandAsync(`playsound note.bell @s`);
            playerCooldowns.delete(playerName);
        }
    }
}, 20);

world.beforeEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const { itemStack } = event;

    if (itemStack.typeId === "minecraft:ender_pearl") {
        const playerName = player.name;
        const currentTick = system.currentTick;

        if (playerCooldowns.has(playerName)) {
            const cooldownEndTick = playerCooldowns.get(playerName);

            if (currentTick < cooldownEndTick) {
                const remainingTicks = cooldownEndTick - currentTick;
                const remainingSeconds = Math.ceil(remainingTicks / 20);

                player.sendMessage(`§7[§b#§7] §cYou are on cooldown for using Ender Pearls! Please wait §e${remainingSeconds} §cseconds.`);
                player.runCommandAsync(`playsound random.break @s`);
                
                event.cancel = true;
                return;
            }
        }

        const cooldownTicks = defaultCooldownSeconds * 20;
        playerCooldowns.set(playerName, currentTick + cooldownTicks);
        player.sendMessage(`§7[§b#§7] §aEnder Pearl used! You are now on a ${defaultCooldownSeconds}-second cooldown.`);
    }
});

Command.register({
    name: "pearl",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),  // Only admins can use this command
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "!pearl")) return;
    
    const action = args[0]?.toLowerCase();
    const duration = parseInt(args[1]);

    if (!["set", "remove"].includes(action)) {
        player.sendMessage('§7[§b#§7] §cInvalid action! Use: §3!pearl §eset §7<§aseconds§7> §7/ §3!pearl §cremove');
        return player.runCommandAsync('playsound random.break @s');
    }

    if (action === "set") {
        if (isNaN(duration) || duration < MIN_COOLDOWN_SECONDS) {
            player.sendMessage(`§7[§b#§7] §cInvalid duration! It must be at least §e${MIN_COOLDOWN_SECONDS} §cseconds.`);
            return player.runCommandAsync('playsound random.break @s');
        }

        defaultCooldownSeconds = duration;
        player.sendMessage(`§7[§b#§7] §aEnder Pearl cooldown set to §e${duration} §aseconds.`);
        player.runCommandAsync('playsound random.levelup @s');

    } else if (action === "remove") {
        defaultCooldownSeconds = 10;  // Reset to default 10s
        player.sendMessage(`§7[§b#§7] §aEnder Pearl cooldown reset to default §e${defaultCooldownSeconds} §aseconds.`);
        player.runCommandAsync('playsound random.levelup @s');
    }
});

Command.register({
    name: "rank",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "!rank")) return;

    if (args.length < 3 || args.length > 4) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!rank ${main.addremove} §7<§arank§7> §7[§gcolor(optional)§7] ${main.player}`);
        return player.runCommandAsync(`playsound random.break @s`);
    }

    const action = args[0].toLowerCase();
    const rankName = args[1];
    let rankColor = main.colors.white; // default color

    if (args.length === 4) {
        const colorName = args[2].toLowerCase();
        if (main.colors[colorName]) {
            rankColor = main.colors[colorName];
        } else {
            player.sendMessage(`§7[§b#§7] §cInvalid color! §aAvailable colors§7: §0black §7| §1dark_blue §7| §2dark_green §7| §3dark_aqua §7| §4dark_red §7| §5dark_purple §7| §6gold §7| §7gray §7| §8dark_gray §7| §9blue §7| §agreen §7| §baqua §7| §cred §7| §dlight_purple §7| §eyellow §7| §fwhite`); ///////////////
            return player.runCommandAsync(`playsound random.break @s`);
        }
    }

    const playerName = args[args.length - 1];
    const targetPlayer = [...world.getPlayers()].find(player => player.name === playerName);

    if (!targetPlayer) {
        player.sendMessage(`§7[§b#§7] §cPlayer "${playerName}" not found.`);
        return player.runCommandAsync(`playsound random.break @s`);
    }

    let ranks = targetPlayer.getTags().filter(tag => tag.startsWith("rank:"));

    if (action === "add") {
        if (ranks.length >= 3) {
            player.sendMessage("§7[§b#§7] §cThe player already has the maximum of 3 ranks.");
            return player.runCommandAsync(`playsound random.break @s`);
        }
        targetPlayer.runCommandAsync(`tag "${playerName}" add "rank:${rankColor}${rankName}"`);
        player.sendMessage(`§7[§b#§7] §aAdded rank "${rankColor}${rankName}§a" to ${playerName}.`);
        player.runCommandAsync(`playsound note.bell @s`);
    } else if (action === "remove") {
        const rankToRemove = `rank:${rankColor}${rankName}`;
        if (!ranks.includes(rankToRemove)) {
            player.sendMessage(`§7[§b#§7] §cThe player does not have the rank "${rankColor}${rankName}§c".`);
            return player.runCommandAsync(`playsound random.break @s`);
        }
        targetPlayer.runCommandAsync(`tag "${playerName}" remove "${rankToRemove}"`);
        player.sendMessage(`§7[§b#§7] §aRemoved rank "${rankColor}${rankName}§a" from ${playerName}.`);
        player.runCommandAsync(`playsound random.bell @s`);
    } else {
        player.sendMessage("§7[§b#§7] §cInvalid action! §aUse 'add' or 'remove'.");
        return player.runCommandAsync(`playsound random.break @s`);
    }
});

const cooldowns = {};

Command.register({
    name: "troll",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "!troll")) return;
    
    const { id, name } = player;
    const trollTypes = ["creeper", "endermen", "ghast", "zombie", "skeleton"];
    const COOLDOWN_TIME = 10000;

    const currentTime = Date.now();
    if (cooldowns[id] && currentTime - cooldowns[id] < COOLDOWN_TIME) {
        const remainingTime = ((COOLDOWN_TIME - (currentTime - cooldowns[id])) / 1000).toFixed(1);
        player.sendMessage(`§7[§b#§7] §aPlease wait §e${remainingTime}s §abefore using the troll command again.`);
        return player.runCommandAsync('playsound random.break @s');
    }

    if (args.length < 2) {
        player.sendMessage('§7[§b#§7] §cInvalid action! §aUse this Method§7: !troll <troll> <player>');
        player.sendMessage('§7[§b#§7] §aTroll list §7(§ecreeper§7/§eendermen§7/§eghast§7/§ezombie§7/§eskeleton§7)');
        return player.runCommandAsync('playsound random.break @s');
    }

    const trollType = args[0];
    const targetPlayerName = args[1];

    if (!trollTypes.includes(trollType)) {
        player.sendMessage('§7[§b#§7] §aInvalid troll type. You have to choose one of these §7(§ecreeper§7/§eendermen§7/§eghast§7/§ezombie§7/§eskeleton§7)');
        return player.runCommandAsync('playsound random.break @s');
    }

    const targetPlayer = world.getPlayers().find(p => p.name === targetPlayerName);
    if (!targetPlayer) {
        player.sendMessage(`§7[§b#§7] §cCan\'t find the player§7: §e${targetPlayerName}`);
        return player.runCommandAsync('playsound random.break @s');
    }

    switch (trollType) {
        case "creeper":
            player.sendMessage(`§7[§b#§7] §aSuccessfully sent a creeper troll to§7: §e${targetPlayerName}`);
            player.runCommandAsync(`playsound random.fuse "${targetPlayerName}"`);
            break;
        case "endermen":
            player.sendMessage(`§7[§b#§7] §aSuccessfully sent an endermen troll to§7: §e${targetPlayerName}`);
            player.runCommandAsync(`playsound mob.endermen.scream "${targetPlayerName}"`);
            break;
        case "ghast":
            player.sendMessage(`§7[§b#§7] §aSuccessfully sent a ghast troll to§7: §e${targetPlayerName}`);
            player.runCommandAsync(`playsound mob.ghast.scream "${targetPlayerName}"`);
            break;
        case "zombie":
            player.sendMessage(`§7[§b#§7] §aSuccessfully sent a zombie troll to§7: §e${targetPlayerName}`);
            player.runCommandAsync(`playsound mob.zombie.say "${targetPlayerName}"`);
            break;
        case "skeleton":
            player.sendMessage(`§7[§b#§7] §aSuccessfully sent a skeleton troll to§7: §e${targetPlayerName}`);
            player.runCommandAsync(`playsound mob.skeleton.say "${targetPlayerName}"`);
            break;
    }

    cooldowns[id] = currentTime;
});

Command.register({
    name: "trusted",
    description: "",
    aliases: [],
    permission: (player) => (player.hasTag(main.adminTag) || player.isOp())
}, async (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!trusted")) return;
    
    const action = args[0]?.toLowerCase();
    const targetName = args[1] || player.name;
    const [targetPlayer] = world.getPlayers({ name: targetName });
    
    if (action === "list") {
        const trustedPlayers = world.getPlayers().filter(p => p.hasTag('trusted')).map(p => p.name).join(', ');
        player.sendMessage(`§7[§b#§7] §aTrusted List: §e${trustedPlayers || 'No trusted player found'}`);
        return;
    }

    if (!["add", "remove"].includes(action)) {
        player.sendMessage(`§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!trusted §aadd ${main.player} §7/ §3!trusted §cremove ${main.player} §7/ §3!trusted §alist`);
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    if (!targetPlayer) {
        player.sendMessage('§7[§b#§7] §aPlayer not found! Please specify a valid player name.');
        player.runCommandAsync('playsound random.break @s');
        return;
    }

    try {
        if (action === "add") {
            if (!targetPlayer.hasTag("trusted")) {
                await system.run(() => targetPlayer.addTag("trusted"));
                player.runCommandAsync(`playsound note.bell @s`);
                player.sendMessage(`§7[§b#§7] §aSuccessfully §3added §atrusted status to §e${targetPlayer.name}`);
                
            } else {
                player.sendMessage(`§7[§b#§7] §c${targetPlayer.name} already has trusted status.`);
            }
        } else if (action === "remove") {
            if (targetPlayer.hasTag("trusted")) {
                await system.run(() => targetPlayer.removeTag("trusted"));
                player.runCommandAsync(`playsound note.bell @s`);
                player.sendMessage(`§7[§b#§7] §aSuccessfully §cremoved §atrusted status from §e${targetPlayer.name}`);
                
            } else {
                player.sendMessage(`§7[§b#§7] §c${targetPlayer.name} does not have trusted status.`);
            }
        }
    } catch (error) {
        player.sendMessage(`§7[§b#§7] §cError modifying player tags: ${error.message}`);
    }
});


const WELCOME_MESSAGE_KEY = "welcomeMessage";
const LEAVE_MESSAGE_KEY = "leaveMessage";
const WELCOME_TOGGLE_KEY = "welcomeToggle";
const LEAVE_TOGGLE_KEY = "leaveToggle";

const defaultWelcomeMessage = `§bBlueMods §7>> §e{name}§a has joined the server.`;
const defaultLeaveMessage = `§bBlueMods §7>> §e{name} §chas left the server.`;

let welcomeMessage = defaultWelcomeMessage;
let leaveMessage = defaultLeaveMessage;
let welcomeEnabled = true;
let leaveEnabled = true;

system.run(() => {
    const storedWelcomeMessage = world.getDynamicProperty(WELCOME_MESSAGE_KEY);
    const storedLeaveMessage = world.getDynamicProperty(LEAVE_MESSAGE_KEY);
    const storedWelcomeToggle = world.getDynamicProperty(WELCOME_TOGGLE_KEY);
    const storedLeaveToggle = world.getDynamicProperty(LEAVE_TOGGLE_KEY);

    if (!storedWelcomeMessage) {
        world.setDynamicProperty(WELCOME_MESSAGE_KEY, defaultWelcomeMessage);
    } else {
        welcomeMessage = storedWelcomeMessage;
    }

    if (!storedLeaveMessage) {
        world.setDynamicProperty(LEAVE_MESSAGE_KEY, defaultLeaveMessage);
    } else {
        leaveMessage = storedLeaveMessage;
    }

    welcomeEnabled = storedWelcomeToggle !== false;
    leaveEnabled = storedLeaveToggle !== false;
});

function saveWelcomeMessage(message) {
    world.setDynamicProperty(WELCOME_MESSAGE_KEY, message);
}

function saveLeaveMessage(message) {
    world.setDynamicProperty(LEAVE_MESSAGE_KEY, message);
}

function saveWelcomeToggle(enabled) {
    world.setDynamicProperty(WELCOME_TOGGLE_KEY, enabled);
}

function saveLeaveToggle(enabled) {
    world.setDynamicProperty(LEAVE_TOGGLE_KEY, enabled);
}

world.afterEvents.playerJoin.subscribe((event) => {
    const { playerName } = event;

    if (welcomeEnabled) {
        const formattedMessage = welcomeMessage.replace("{name}", playerName);
        world.sendMessage(formattedMessage);
    }
});

world.afterEvents.playerLeave.subscribe((event) => {
    const { playerName } = event;

    if (leaveEnabled) {
        const formattedMessage = leaveMessage.replace("{name}", playerName);
        world.sendMessage(formattedMessage);
    }
});

Command.register({
    name: "welcome",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const { player } = data;
    if (!isAuthorized(player, "!welcome")) return;

    const action = args[0]?.toLowerCase();
    const customMessage = args.slice(1).join(" ");

    if (action === "disable") {
        welcomeEnabled = false;
        leaveEnabled = false;
        saveWelcomeToggle(welcomeEnabled);
        saveLeaveToggle(leaveEnabled);
        player.sendMessage("§7[§b#§7] §cBoth join and leave messages are now disabled.");
    } else if (action === "enable") {
        welcomeEnabled = true;
        leaveEnabled = true;
        saveWelcomeToggle(welcomeEnabled);
        saveLeaveToggle(leaveEnabled);
        player.sendMessage("§7[§b#§7] §aBoth join and leave messages are now enabled.");
    } else if (action === "set") {
        const type = args[1]?.toLowerCase();
        if (!["join", "leave"].includes(type) || !customMessage) {
            player.sendMessage(
                `§7[§b#§7] §cInvalid usage! Use: §3!welcome set <join|leave> <message>`
            );
            return;
        }

        if (type === "join") {
            welcomeMessage = customMessage;
            saveWelcomeMessage(welcomeMessage);
            player.sendMessage(`§7[§b#§7] §aJoin message updated to: §e${welcomeMessage}`);
        } else if (type === "leave") {
            leaveMessage = customMessage;
            saveLeaveMessage(leaveMessage);
            player.sendMessage(`§7[§b#§7] §aLeave message updated to: §e${leaveMessage}`);
        }
    } else if (action === "default") {
        welcomeMessage = defaultWelcomeMessage;
        leaveMessage = defaultLeaveMessage;
        saveWelcomeMessage(welcomeMessage);
        saveLeaveMessage(leaveMessage);
        player.sendMessage("§7[§b#§7] §aJoin and leave messages have been reset to their default values.");
    } else {
        player.sendMessage(
            "§7[§b#§7] §cInvalid command! Use one of the following options:\n" +
            "§7- §3!welcome §aenable §7- Enable join and leave messages.\n" +
            "§7- §3!welcome §cdisable §7- Disable join and leave messages.\n" +
            "§7- §3!welcome §eset <join|leave> <message> §7- Set custom messages.\n" +
            "§7- §3!welcome §fdefault §7- Reset messages to default values."
        );
    }
});