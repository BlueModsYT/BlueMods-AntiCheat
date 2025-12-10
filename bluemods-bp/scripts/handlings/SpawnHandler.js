import { world } from "@minecraft/server";

//░███░░██░░██░░█░████░██░░██░░████░░████░░░███░
//░█░░█░█░░░░█░░█░█░░░░██░░██░█░░░█░░█░░░█░█░░█░
//░███░░█░░░░█░░█░███░░██░░██░█░░░░█░█░░░█░██░░░
//░█░░█░█░░░░█░░█░█░░░░█░██░█░█░░░░█░█░░░█░░░█░░
//░█░░█░█░░█░█░░█░█░░█░█░██░█░█░░░█░░█░░░█░█░░█░
//░███░░████░███░░████░█░█░░█░░███░░░████░░███░░
// https://dsc.gg/bluemods

let SPAWN_LOCATION = null;

function saveSpawnLocation(location) {
    world.setDynamicProperty("spawnLocation", JSON.stringify(location));
}

function loadSpawnLocation() {
    const locationData = world.getDynamicProperty("spawnLocation");
    return locationData ? JSON.parse(locationData) : null;
}

function getSpawnLocation() {
    return SPAWN_LOCATION;
}

function setSpawnLocation(location) {
    SPAWN_LOCATION = location;
    saveSpawnLocation(location);
}

function clearSpawnLocation() {
    SPAWN_LOCATION = null;
    world.setDynamicProperty("spawnLocation", null);
}

SPAWN_LOCATION = loadSpawnLocation();

export default {
    getSpawnLocation,
    setSpawnLocation,
    clearSpawnLocation,
};