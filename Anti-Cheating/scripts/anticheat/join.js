import { world } from "@minecraft/server";
// alrights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods.
world.afterEvents.playerSpawn.subscribe(data => {
    const player = data.player
    if (!player.hasTag('old')) {
        world.sendMessage(`§bBlueMods §7>> §e${player.name}§a, Welcome new member\n§c hacking on this server will be automatically banned!.`)
        player.addTag('old')
    }
});