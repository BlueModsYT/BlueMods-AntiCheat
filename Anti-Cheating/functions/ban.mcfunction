# alrights reserve @bluemods.lol - discord account. || please report any bugs or glitches in our discord server https://dsc.gg/bluemods || do not change everything here!

# bluemods:ban ====================
execute as @s[tag=ban] run tp @a[tag=ban] 0 999 0 ~7~
execute as @s[tag=ban] run effect @a[tag=ban] poison 999 255 true
execute as @s[tag=ban] run effect @a[tag=ban] nausea 999 255 true
execute as @s[tag=ban] run effect @a[tag=ban] blindness 999 255 true
execute as @s[tag=ban] run effect @a[tag=ban] darkness 999 255 true
execute as @s[tag=ban] run effect @a[tag=ban] slowness 999 255 true
execute as @s[tag=ban] run effect @a[tag=ban] weakness 999 255 true
execute as @s[tag=ban] run effect @a[tag=ban] mining_fatigue 999 10 true
execute as @s[tag=ban] run effect @a[tag=ban] wither 999 30 true
execute as @s[tag=ban] run replaceitem entity @a[tag=ban] slot.weapon.offhand 0 totem_of_undying
execute as @s[tag=ban] run replaceitem entity @a[tag=ban] slot.weapon.mainhand 0 air
execute as @s[tag=ban] run playsound mob.wither.death @a[tag=ban]
execute as @s[tag=ban] run playsound mob.ghast.scream @a[tag=ban]
execute as @s[tag=ban] run replaceitem entity @a[tag=ban] slot.armor.head 0 pumpkin
execute as @s[tag=ban] run gamemode a @a[tag=ban]
titleraw @a[tag=ban] actionbar {"rawtext":[{"text":"           §bBlueMods §fAnti§cCheat\n§eBanned§7 : §a"},{"selector":"@s"},{"text":"\n§eReason §7: §4Exploiting / Using Illegal Blocks"}]}
execute as @s[tag=ban] run kill @e[type=item, r=20, y=997]