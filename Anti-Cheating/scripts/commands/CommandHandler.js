import { world, Player } from "@minecraft/server";
import main from "./config.js";

class Commands {

    register(info, callback) {
        Commands.registeredCommands.push({
            name: info.name.toLowerCase().split(' ')[0],
            description: info.description ?? undefined,
            aliases: info.aliases?.map(aL => aL.toLowerCase().split(' ')[0]) ?? [],
            permission: info.permission,
            callback
        });
    }

    remove(command) {
        const index = Commands.registeredCommands.findIndex(cmd => cmd.name === command.toLowerCase());
        if (index === -1)
            return;
        Commands.registeredCommands.splice(index, 1);
    }

    forEach(callback, thisArg) {
        Commands.registeredCommands.forEach(callback, thisArg);
    }

    clear() {
        Commands.registeredCommands = [];
    }
}

export const Command = new Commands()

Commands.registeredCommands = [];

world.beforeEvents.chatSend.subscribe((data) => {
    const { message, sender: player } = data;
    const prefix = main.prefix
    if (!message.startsWith(prefix))
        return;
    data.cancel = true;
    const args = message.substring(prefix.length).replace(/@(?=\w{2})|@(?!s)/g, '').trim().replace(/ {2,}/g, ' ').match(/".*?"|[\S]+/g)?.map(item => item.replaceAll('"', '')) ?? [];
    const cmd = args.shift();
    const cmdData = Commands.registeredCommands.find(c => c.name === cmd || c.aliases?.includes(cmd));
     if (!cmdData) return player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§4Error §7>> §cUnknown command§7: §g${message.replace(prefix, '')}§c. Please check that the command exists and that you have permission to use it."}]}`)
     
    if (cmdData.permission && !cmdData.permission(player)) return player.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§4Error §7>> §cUnknown command: §g${message.replace(prefix, '')}§c. Please check that the command exists and that you have permission to use it."}]}`)
    cmdData.callback({ player, message }, args);
});