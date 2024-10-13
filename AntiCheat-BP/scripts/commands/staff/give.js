import { world } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods

Command.register({
  name: "give",
  description: "",
  aliases: ['i'],
  permission: (player) => player.hasTag(main.adminTag),
}, (data, args) => {
  const player = data.player;

  if (args.length < 2) {
        player.sendMessage('§7[§b#§7] §cInvalid action! §aUse this Method§7: §3!give §a<item> <amount> §e[data]');
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
