# alrights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods

# bluemods:unknown ====================
execute as @s[tag=unknown] run replaceitem entity @a[tag=unknown] slot.weapon.mainhand 0 air
execute as @s[tag=unknown] run tellraw @s[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@a[tag=unknown]"},{"text":" §cis using unknown blocks/items!, type !ban to ban a user."}]}
execute as @s[tag=unknown] run tellraw @s[tag=unknown] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@a[tag=unknown]"},{"text":" §cyou cant use unknown blocks/items!"}]}
tag @s[tag=unknown] remove unknown

# bluemods:eggdisable ====================
execute as @s[tag=eggdisable] run tellraw @a[tag=notify] {"rawtext":[{"text":"§bBlueMods §7>> §e"},{"selector":"@a[tag=eggdisable]"},{"text":" §clooks like this user is trying to get the spawneggs."}]}
execute as @s[tag=eggdisable] run tellraw @a[tag=eggdisable] {"rawtext":[{"text":"§bBlueMods §7>> §cyou must be admin or trusted user to able to access spawn eggs."}]}
replaceitem entity @s[tag=eggdisable] slot.weapon.mainhand 0 air
tag @s[tag=eggdisable] remove eggdisable

# bluemods:database ====================
execute as @s[tag=ban_database] run playsound mob.ghast.scream @a
tag @s[tag=ban_database] add ban
tag @s[tag=ban_database] remove ban_database
