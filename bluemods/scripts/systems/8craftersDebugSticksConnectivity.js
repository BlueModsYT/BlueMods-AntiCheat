import { system, world } from "@minecraft/server";
import { main } from "../commands/config"
globalThis.debug_sticks_format_version = null;
globalThis.multipleDebugSticksVersionsDetected = false;
globalThis.format_version = main.bmversion.match(/[0-9]+\.[0-9]+\.[0-9]+/)?.[0];
globalThis.debugSticksHasDisabledChatModification = false;
if(globalThis.format_version == undefined){
    throw new Error("The BlueMods version could not be found or was invalid. Please make sure that the BlueMods version is defined in the config.js file and contains a sequence of three numbers separated by decimal points.");
};
export async function checkIfCompatibleDebugSticksIsActive(init = false, maxWaitTicks = 20) {
    const promise1Result = await new Promise((resolve, reject) => {
        world.getDimension("overworld").runCommand(`/scriptevent andexdb:blueMods${init ? "Init" : "Test"}Signal ${format_version}`);
        const rId1 = system.afterEvents.scriptEventReceive.subscribe((event) => {
            if (event.id == `bluemods:blueMods${init ? "Init" : "Test"}SignalReceivedByDebugSticks`) {
                system.afterEvents.scriptEventReceive.unsubscribe(rId1);
                resolve(event.message);
            }
        });
        if (maxWaitTicks != Infinity) {
            system
                .waitTicks(maxWaitTicks)
                .then((v) =>
                    reject(
                        new Error(`The request to see if a compatible version of debug sticks is active timed out. It took longer than ${maxWaitTicks} ticks.`)
                    )
                );
        }
    }).then(
        (v) => v,
        (v) => {
            return false;
        }
    );
    return promise1Result;
}
world.afterEvents.worldInitialize.subscribe(async (event) => {
    try {
        const r = await checkIfCompatibleDebugSticksIsActive(true, 5);
        if (r != false) {
            if (debug_sticks_format_version != null && r.trim() != debug_sticks_format_version) {
                globalThis.multipleDebugSticksVersionsDetected = true;
            }
            debug_sticks_format_version = r.trim();
            world.getDimension("overworld").runCommand(`/scriptevent andexdb:blueModsAnticheatConfig ${JSON.stringify({prefix: main.prefix, bmversion: main.bmversion})}`);
        }
    } catch (e) {
        console.error(e, e.stack);
    }
});
system.afterEvents.scriptEventReceive.subscribe((event) => {
    const { id, message } = event;
    if (id == "bluemods:debugSticksInitSignal") {
        world.getDimension("overworld").runCommand(`/scriptevent andexdb:debugSticksInitSignalReceivedByBlueModsAnticheat ${format_version}`);
        if (debug_sticks_format_version != null && message.trim() != debug_sticks_format_version) {
            globalThis.multipleDebugSticksVersionsDetected = true;
        }
        debug_sticks_format_version = message.trim();
        return;
    } else if (id == "bluemods:debugSticksTestSignal") {
        world.getDimension("overworld").runCommand(`/scriptevent andexdb:debugSticksTestSignalReceivedByBlueModsAnticheat ${format_version}`);
        if (debug_sticks_format_version != null && message.trim() != debug_sticks_format_version) {
            globalThis.multipleDebugSticksVersionsDetected = true;
        }
        debug_sticks_format_version = message.trim();
        return;
    } else if (id == "bluemods:debugSticksSetChatModificationEnabled") {
        globalThis.debugSticksHasDisabledChatModification = message.trim().toLowerCase() === "false";
        return;
    }
});
