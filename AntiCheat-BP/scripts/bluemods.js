import { system } from "@minecraft/server";
const Plugins = ["main.js"]



for (const plugin of Plugins) {

  const start = Date.now();

  import(`./${plugin}`)

    .then(() => {

      console.warn(

        `§aLoaded Plugin: §e${plugin}§a Successfully, in §e${Date.now() - start} ms§r`

      );

    })

    .catch((error) => {

      console.warn(`Error on Loading Plugin ${plugin}: ` + error + error.stack);

    });

}

system.beforeEvents.watchdogTerminate.subscribe(data => {
    data.cancel = true
}) 