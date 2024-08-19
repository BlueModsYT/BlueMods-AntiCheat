import { system } from "@minecraft/server";
const Plugins = ["anticheat", "commands", "chat"]



for (const plugin of Plugins) {

  const start = Date.now();

  import(`./${plugin}/main.js`)

    .then(() => {

      console.warn(

        `Loaded Plugin: ${plugin} Successfully, in ${Date.now() - start} ms`

      );

    })

    .catch((error) => {

      console.warn(`Error on Loading Plugin ${plugin}: ` + error + error.stack);

    });

}

system.beforeEvents.watchdogTerminate.subscribe(data => {
    data.cancel = true
}) 
