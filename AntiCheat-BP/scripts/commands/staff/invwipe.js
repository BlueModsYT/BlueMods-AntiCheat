import { world } from '@minecraft/server';
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
