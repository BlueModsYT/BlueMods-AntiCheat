import { Command } from "../CommandHandler.js";
import { world } from "@minecraft/server";
import main from "../config.js";

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
