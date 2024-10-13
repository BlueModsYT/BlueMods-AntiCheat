import { world } from '@minecraft/server';
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// alrights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

Command.register({
    name: "invsee",
    description: "",
    aliases: [],
    permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
    const player = data.player;

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
