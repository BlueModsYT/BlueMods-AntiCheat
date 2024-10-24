import { world } from "@minecraft/server";
import { Command } from "../CommandHandler.js";
import main from "../config.js";

// All rights reserved @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods

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
