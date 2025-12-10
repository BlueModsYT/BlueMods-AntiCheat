import { world, system } from "@minecraft/server";
import { BLOCK_CONTAINERS, VAILD_BLOCK_TAGS, IMPOSSIBLE_BREAKS } from "./configuration/nuker_config.js";
import { PlayerLog } from "./player/playerLog.js";
import main from "../commands/config.js";

//░███░░██░░██░░█░████░██░░██░░████░░████░░░███░
//░█░░█░█░░░░█░░█░█░░░░██░░██░█░░░█░░█░░░█░█░░█░
//░███░░█░░░░█░░█░███░░██░░██░█░░░░█░█░░░█░██░░░
//░█░░█░█░░░░█░░█░█░░░░█░██░█░█░░░░█░█░░░█░░░█░░
//░█░░█░█░░█░█░░█░█░░█░█░██░█░█░░░█░░█░░░█░█░░█░
//░███░░████░███░░████░█░█░░█░░███░░░████░░███░░
// https://dsc.gg/bluemods

const adminTag = main.adminTag;
const log = new PlayerLog();
const break_time = 70;

world.afterEvents.playerBreakBlock.subscribe(({ block, brokenBlockPermutation, dimension, player }) => {
    if (player.hasTag(adminTag)) return;
    
    if (block.getTags().some(tag => VAILD_BLOCK_TAGS.includes(tag))) return;
    
    const old = log.get(player);
    log.set(player, Date.now());
    
    if (!old) return;
    if (IMPOSSIBLE_BREAKS.includes(block.id)) return;
    if (Date.now() - old > break_time) return;
    
    block.setPermutation(brokenBlockPermutation);
    
    if (BLOCK_CONTAINERS.includes(brokenBlockPermutation.type.id)) {
        system.run(() => {
            const nearbyItems = [
                ...dimension.getEntities({
                    maxDistance: 2,
                    type: "minecraft:item",
                    location: block.location
                })
            ];
            
            nearbyItems.forEach(entity => {
                const inventoryComponent = block.getComponent('inventory');
                const itemComponent = entity.getComponent('item');
                
                if (inventoryComponent && itemComponent) {
                    inventoryComponent.container.addItem(itemComponent.itemStack);
                    entity.kill();
                }
            });
        });
    }
});