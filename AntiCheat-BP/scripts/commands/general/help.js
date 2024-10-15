import { world } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. || Please report any bugs or glitches in our Discord server: https://dsc.gg/bluemods

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
    name: "help",
    description: "",
    aliases: ["?"]
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "!help")) return;
    
    const category = args[0]?.toLowerCase();
 
    if (player.hasTag("admin")) {
        if (category === "spawn") {
            data.player.runCommandAsync(`playsound note.bell @s`);
            player.sendMessage(`\n§l§eSpawn Commands§r
§7> §a!spawn §7- §3go back to lobby.
§7> §a!rspawn §7- §3remove the current spawn set.
§7> §a!setspawn §7- §3make a setspawn to able to use !spawn.

${main.developer}`);
            // Notification for Admins:
            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!help spawn`);
                admin.runCommandAsync(`playsound note.pling @s`);
            });
        } else if (category === "tpa") {
            data.player.runCommandAsync(`playsound note.bell @s`);
            player.sendMessage(`\n§l§eTPA Commands§r
§7> §a!tpa §asend ${main.player} §7- §3allows you to request a teleport from any players.
§7> §a!tpa §aaccept §7- §3allows you to accept a current request from other player.
§7> §a!tpa §cdecline §7- §3you can only decline a request from other player.
§7> §a!tpa §ccancel §7- §3you can cancel a request from the player.
§7> §a!tpa §dblock ${main.player} §7- §3allows you to block a player from sending a teleport request.
§7> §a!tpa §dunblock ${main.player} §7- §3unblock the blocked player so they can able to send a request to you again.

${main.developer}`)
        } else if (category === "gamemodes" || category === "gamemode" || category === "gm") {
            data.player.runCommandAsync(`playsound note.bell @s`);
            player.sendMessage(`\n§l§eGamemode Commands§r
§7> §a!gma ${main.player} §7- §3change gamemode to adventure.
§7> §a!gmc ${main.player} §7- §3change gamemode to creative.
§7> §a!gms ${main.player} §7- §3change gamemode to survival.
§7> §a!gmsp ${main.player} §7- §3change gamemode to spectator.
§7> §a!vanish ${main.player} §7- §3makes yourself invisibility.

${main.developer}`);
            // Notification for Admins
            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!help gamemode`);
                admin.runCommandAsync(`playsound note.pling @s`);
            });
        } else if (category === "staff" || category === "moderations" || category === "mods") {
            data.player.runCommandAsync(`playsound note.bell @s`);
            player.sendMessage(`\n§l§eModeration Commands§r
§7> §a!kick ${main.player} ${main.reason} §7- §3kick a specific player in server.
§7> §a!ban §aadd ${main.player} ${main.reason} §7- §3ban a specific player in server.
§7> §a!ban §cremove ${main.player} §7- §3unban a specific player in server.
§7> §a!ban list §7- §3see the list of the banned players on the server.
§7> §a!cmdsf ${main.enabledisable} §7- §3disabled command block logs and popping on chats. §7[§aMODULE§7]
§7> §a!mute ${main.addremove} ${main.player} §7- §3mute a specific player in server.
§7> §a!mute list §7- §3see the list of muted user.
§7> §a!freeze ${main.addremove} ${main.player} §7- §3freeze a specific player.
§7> §a!freeze list §7- §3see the list of freezed user.
§7> §a!lagclear §7<§adefault§7/§amobs§7/§aall§7> §7- §3kill all items on the ground.
§7> §a!give §7<§aitem§7> ${main.valuedata} §7- §3give yourself an item(s).
§7> §a!troll §7<§dtroll§7> ${main.player} §7- §3troll someone in the server.
§7> §a!welcome §7<§ajoin§7/§cleave§7> §7<§eset§7/§cremove§7> §7[§atext§7] §7- §3add or remove specific set text.
§7> §a!banitem ${main.addremove} §7<§aitem§7> §7- §3add or remove ban items.
§7> §a!banitem list §7- §3see the list of banned.
§7> §a!clearchat §7- §3clear your chat (only you can see it)
§7> §a!ecwipe ${main.player} §7- §3allows you to remove items on their ender_chest.
§7> §a!invsee ${main.player} §7- §3allows you to see other player(s) Inventory.
§7> §a!invwipe ${main.player} §7- §3this will clear the player(s) inventory.
§7> §a!module ${main.enabledisable} <§acommand§7> §7- §3allows you to enable or disable a specific command. §7[§aMODULE§7]
§7> §a!module list §7- §3see the list of commands module.

${main.developer}`);
            // Notification for Admins
            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!help staff`);
                admin.runCommandAsync(`playsound note.pling @s`);
            });
        } else if (category === "operator" || category === "staff") {
            data.player.runCommandAsync(`playsound note.bell @s`);
            player.sendMessage(`\n§l§eOperator Commands§r
§7> §a!op ${main.addremove} ${main.player} §7- §3op a specific player in server to immune to any anticheat.
§7> §a!op list §7- §3see the list of the admins on the anticheat.
§7> §a!notify ${main.addremove} ${main.player} §7- §3notification when someone got flagged by the anticheat.
§7> §a!notify list §7- §3see the list of the notify on the anticheat.
§7> §a!trusted ${main.addremove} ${main.player} §7- §3add trusted or remove on specific player.
§7> §a!trusted list §7- §3see the list of the trusted on the anticheat.

${main.developer}`);
            // Notification for Admins
            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!help operator`);
                admin.runCommandAsync(`playsound note.pling @s`);
            });
        } else {
            data.player.runCommandAsync(`playsound note.bell @s`);
            player.sendMessage(`\n§l§eList of Commands§r
§7> §a!help §7- §3shows the list of the commands.
§7> §a!about §7- §3shows the developer of the addon.

§l§eSpawn Commands§r
§7> §a!spawn §7- §3go back to lobby.
§7> §a!rspawn §7- §3remove the current spawn set.
§7> §a!setspawn §7- §3make a setspawn to able to use !spawn.

§l§eTPA Commands§r
§7> §a!tpa §asend ${main.player} §7- §3allows you to request a teleport from any players.
§7> §a!tpa §aaccept §7- §3allows you to accept a current request from other player.
§7> §a!tpa §cdecline §7- §3you can only decline a request from other player.
§7> §a!tpa §ccancel §7- §3you can cancel a request from the player.
§7> §a!tpa §dblock ${main.player} §7- §3allows you to block a player from sending a teleport request.
§7> §a!tpa §dunblock ${main.player} §7- §3unblock the blocked player so they can able to send a request to you again.

§l§eGamemode Commands§r
§7> §a!gma ${main.player} §7- §3change gamemode to adventure.
§7> §a!gmc ${main.player} §7- §3change gamemode to creative.
§7> §a!gms ${main.player} §7- §3change gamemode to survival.
§7> §a!gmsp ${main.player} §7- §3change gamemode to spectator.
§7> §a!vanish ${main.player} §7- §3makes yourself invisibility.

§l§eModeration Commands§r
§7> §a!kick ${main.player} ${main.reason} §7- §3kick a specific player in server.
§7> §a!ban §aadd ${main.player} ${main.reason} §7- §3ban a specific player in server.
§7> §a!ban §cremove ${main.player} §7- §3unban a specific player in server.
§7> §a!ban list §7- §3see the list of the banned players on the server.
§7> §a!cmdsf ${main.enabledisable} §7- §3disabled command block logs and popping on chats. §7[§aMODULE§7]
§7> §a!mute ${main.addremove} ${main.player} §7- §3mute a specific player in server.
§7> §a!mute list §7- §3see the list of muted user.
§7> §a!freeze ${main.addremove} ${main.player} §7- §3freeze a specific player.
§7> §a!freeze list §7- §3see the list of freezed user.
§7> §a!lagclear §7<§adefault§7/§amobs§7/§aall§7> §7- §3kill all items on the ground.
§7> §a!give §7<§aitem§7> ${main.valuedata} §7- §3give yourself an item(s).
§7> §a!troll §7<§dtroll§7> ${main.player} §7- §3troll someone in the server.
§7> §a!welcome §7<§ajoin§7/§cleave§7> §7<§eset§7/§cremove§7> §7[§atext§7] §7- §3add or remove specific set text.
§7> §a!banitem ${main.addremove} §7<§aitem§7> §7- §3add or remove ban items.
§7> §a!banitem list §7- §3see the list of banned.
§7> §a!clearchat §7- §3clear your chat (only you can see it)
§7> §a!ecwipe ${main.player} §7- §3allows you to remove items on their ender_chest.
§7> §a!invsee ${main.player} §7- §3allows you to see other player(s) Inventory.
§7> §a!invwipe ${main.player} §7- §3this will clear the player(s) inventory.
§7> §a!module ${main.enabledisable} <§acommand§7> §7- §3allows you to enable or disable a specific command. §7[§aMODULE§7]
§7> §a!module list §7- §3see the list of commands module.

§l§eOperator Commands§r
§7> §a!op ${main.addremove} ${main.player} §7- §3op a specific player in server to immune to any anticheat.
§7> §a!op list §7- §3see the list of the admins on the anticheat.
§7> §a!notify ${main.addremove} ${main.player} §7- §3notification when someone got flagged by the anticheat.
§7> §a!notify list §7- §3see the list of the notify on the anticheat.
§7> §a!trusted ${main.addremove} ${main.player} §7- §3add trusted or remove on specific player.
§7> §a!trusted list §7- §3see the list of the trusted on the anticheat.

${main.developer}`);
            // Notification for Admins
            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!help §afor admins`);
                admin.runCommandAsync(`playsound note.pling @s`);
            });
        }
    }
    
    if (!player.hasTag("admin")) {
        data.player.runCommandAsync(`playsound note.bell @s`);
        player.sendMessage(`\n§l§eList of Commands§r
§7> §a!help §7- §3shows the list of the commands.
§7> §a!about §7- §3shows the developer of the addon.
§7> §a!spawn §7- §3go back to lobby.

§l§eTPA Commands§r
§7> §a!tpa §asend ${main.player} §7- §3allows you to request a teleport from any players.
§7> §a!tpa §aaccept §7- §3allows you to accept a current request from other player.
§7> §a!tpa §cdecline §7- §3you can only decline a request from other player.
§7> §a!tpa §ccancel §7- §3you can cancel a request from the player.
§7> §a!tpa §dblock ${main.player} §7- §3allows you to block a player from sending a teleport request.
§7> §a!tpa §dunblock ${main.player} §7- §3unblock the blocked player so they can able to send a request to you again.

${main.developer}`);
        // Notification for Admins
            world.getPlayers({ tags: ["notify"] }).forEach(admin => {
                admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!help for member`);
                admin.runCommandAsync(`playsound note.pling @s`);
            });
    }
});