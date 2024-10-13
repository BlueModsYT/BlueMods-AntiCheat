import { world, system } from "@minecraft/server";
import main from "../commands/config.js";

// alrights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods.

const adminTag = main.adminTag

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    if (player.hasTag(adminTag)) return;
    if (
      Math.abs(player.location.x) > 30000000 ||
      Math.abs(player.location.y) > 30000000 ||
      Math.abs(player.location.z) > 30000000
    ) {
      player.runCommandAsync(`kick "${player.name}" \n§bBlueMods §7>> §aYou have been kicked out from the server.\n§eReason§7: §cInvalid Item Detected.`);
      // Notification for Admins
      world.getPlayers({ tags: ["notify"] }).forEach(admin => {
            admin.sendMessage(`§7[§d#§7] §e${player.name} §ahas been kicked out for trying to crash the server.`);
            admin.runCommandAsync(`playsound random.break @s`);
      });
    }
  }
}, 1);
