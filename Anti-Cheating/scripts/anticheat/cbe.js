import { world, system } from "@minecraft/server";
import main from "../commands/config.js";
// alrights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods.
const all = [
    "minecraft:missing_tile",
    "minecraft:moving_block",
    "minecraft:movingBlock",
    "minecraft:movingblock",
    "minecraft:water",
    "minecraft:lava",
    "minecraft:flowing_water",
    "minecraft:flowing_lava"
]

const trusted = [
	"minecraft:command_block_minecart"
]

world.beforeEvents.itemUseOn.subscribe(data => {
    if (!data.source.hasTag(main.adminTag)) {
        if (all.includes(data.itemStack.typeId)) {
            data.cancel = true
            data.source.runCommandAsync(`clear @s ${data.itemStack.typeId}`)
            data.source.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§bBlueMods §7>> §e${data.source.name} §cyoure not allowed to place this block."}]}`)
            data.source.runCommandAsync('playsound mob.ghast.scream @a')
            data.source.runCommandAsync(`tellraw @a {"rawtext":[{"text":"§bBlueMods §7>> §e${data.source.name} §atried to place a §e${data.itemStack.typeId.replace('minecraft:').replace(/_/g, ' ').replace('undefined', '')}"}]}`)
        }
    }
    if (!data.source.hasTag(main.adminTag) && !data.source.hasTag(main.trustTag)) {
        if (trusted.includes(data.itemStack.typeId)) {
            data.cancel = true
            data.source.runCommandAsync(`clear @s ${data.itemStack.typeId}`)
            data.source.runCommandAsync(`tellraw @s {"rawtext":[{"text":"§bBlueMods §7>> §e${data.source.name} §cyoure not allowed to place this block."}]}`)
            data.source.runCommandAsync('playsound random.orb @a')
            data.source.runCommandAsync(`tellraw @a {"rawtext":[{"text":"§bBlueMods §7>> §e${data.source.name} §atried to place a ${data.itemStack.typeId.replace('minecraft:').replace(/_/g, ' ').replace('undefined', '')}"}]}`)
        }
    }
});