import { world, system } from "@minecraft/server";
import { Command } from "../handlings/CommandHandler.js";
import main from "./config.js";

// all rights reserved @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods

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

Command.register({
    name: "gma",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "gma")) return;
    
    const targetName = args[0] || player.name;
    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (!targetPlayer) {
        system.run(() => player.runCommand('playsound random.break @s'));
        return player.sendMessage('§7[§c-§7] §aPlayer not found! Please specify a valid player name.');
    }
    system.run(() => player.runCommand(`playsound note.bell @s`));
    system.run(() => player.runCommand(`gamemode a "${targetPlayer.name}"`));
    player.sendMessage(`§7[§a/§7] §e${targetPlayer.name} §aGamemode has been set to §6Adventure.`);
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!gma §7/ gamemode adventure.`);
        system.run(() => admin.runCommand(`playsound note.pling @s`));
    });
});

Command.register({
    name: "gmc",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "gmc")) return;
    
    const targetName = args[0] || player.name;
    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (!targetPlayer) {
        system.run(() => player.runCommand('playsound random.break @s'));
        return player.sendMessage('§7[§c-§7] §aPlayer not found! Please specify a valid player name.');
    }
    system.run(() => player.runCommand(`playsound note.bell @s`));
    system.run(() => player.runCommand(`gamemode c "${targetPlayer.name}"`));
    player.sendMessage(`§7[§a/§7] §e${targetPlayer.name} §aGamemode has been set to §6Creative.`);
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!gmc §7/ gamemode creative.`);
        system.run(() => admin.runCommand(`playsound note.pling @s`));
    });
});

Command.register({
    name: "gms",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "gms")) return;
    
    const targetName = args[0] || player.name;
    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (!targetPlayer) {
        system.run(() => player.runCommand('playsound random.break @s'));
        return player.sendMessage('§7[§c-§7] §aPlayer not found! Please specify a valid player name.');
    }
    system.run(() => player.runCommand(`playsound note.bell @s`));
    system.run(() => player.runCommand(`gamemode s "${targetPlayer.name}"`));
    player.sendMessage(`§7[§a/§7] §e${targetPlayer.name} §aGamemode has been set to §6Survival.`);
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!gms §7/ gamemode survival.`);
        system.run(() => admin.runCommand(`playsound note.pling @s`));
    });
});

Command.register({
    name: "gmsp",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "gmsp")) return;
    
    const targetName = args[0] || player.name;
    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (!targetPlayer) {
        system.run(() => player.runCommand('playsound random.break @s'));
        return player.sendMessage('§7[§c-§7] §aPlayer not found! Please specify a valid player name.');
    }
    system.run(() => player.runCommand(`playsound note.bell @s`));
    system.run(() => player.runCommand(`gamemode spectator "${targetPlayer.name}"`));
    player.sendMessage(`§7[§a/§7] §e${targetPlayer.name} §aGamemode has been set to §6Spectator.`);
    world.getPlayers({ tags: ["notify"] }).forEach(admin => {
        admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!gmsp §7/ gamemode spectator.`);
        system.run(() => admin.runCommand(`playsound note.pling @s`));
    });
});

Command.register({
    name: "vanish",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;
    if (!isAuthorized(player, "vanish")) return;
    
    const targetName = args[0] || player.name;
    const [targetPlayer] = world.getPlayers({ name: targetName });
    if (!targetPlayer) {
        player.sendMessage('§7[§c-§7] §aPlayer not found! Please specify a valid player name.');
        return system.run(() => player.runCommand('playsound random.break @s'));
    }
    if (!targetPlayer.hasTag("vanish")) {
        system.run(() => player.runCommand(`playsound note.bell @s`));
        system.run(() => player.runCommand(`tag "${targetPlayer.name}" add vanish`));
        system.run(() => player.runCommand(`effect "${targetPlayer.name}" invisibility 9999999 255 true`));
        system.run(() => player.runCommand(`effect "${targetPlayer.name}" resistance 999999 255 true`));
        player.sendMessage(`§7[§a/§7] §aSuccessfully §3added §avanish to §e${targetPlayer.name}`);
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!vanish add`);
            system.run(() => admin.runCommand(`playsound note.pling @s`));
        });
    } else {
        system.run(() => player.runCommand(`playsound note.bell @s`));
        system.run(() => player.runCommand(`effect "${targetPlayer.name}" clear`));
        system.run(() => player.runCommand(`tag "${targetPlayer.name}" remove vanish`));
        player.sendMessage(`§7[§a/§7] §aSuccessfully §cremoved §avanish from §e${targetPlayer.name}`);
        world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§e#§7] §e${player.name} §ais using §3!vanish remove`);
            system.run(() => admin.runCommand(`playsound note.pling @s`));
        });
    }
});