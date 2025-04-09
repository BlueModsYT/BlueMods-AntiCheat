export const customFormUICodes = {
    /**
     * Styles for {@link modules.mcServerUi.ActionFormData ActionFormData} UIs.
     */
    action: {
        titles: {
            formStyles: {
                /**
                 * General custom form style.
                 *
                 * -   Allows for buttons in the title bar.
                 */
                general: "§a§n§d§e§x§d§b§_§g§e§n§e§r§a§l§-§r",
                /**
                 * General custom form style, with a status bar.
                 *
                 * -   Allows for buttons in the title bar.
                 * -   Has a status bar.
                 *
                 * @deprecated This form style is currently disabled for performance reasons.
                 */
                general_status_bar: "§a§n§d§e§x§d§b§_§g§e§n§e§r§a§l§_§s§t§a§t§u§s§_§b§a§r§r",
                /**
                 * Grid menu custom form style.
                 *
                 * -   Allows for buttons in the title bar.
                 * -   Buttons are displayed in a grid with 3 columns.
                 * -   Allows for buttons to the left and right of the form.
                 * -   The form is 345px\*230px instead of 220px\*200px.
                 */
                gridMenu: "§a§n§d§e§x§d§b§_§g§r§i§d§_§m§e§n§u§r",
                /**
                 * Grid menu custom form style, with a status bar.
                 *
                 * -   Allows for buttons in the title bar.
                 * -   Buttons are displayed in a grid with 3 columns.
                 * -   Allows for buttons to the left and right of the form.
                 * -   The form is 345px\*230px instead of 220px\*200px.
                 * -   Has a status bar.
                 *
                 * @deprecated This form style is currently disabled for performance reasons.
                 */
                gridMenu_status_bar: "§a§n§d§e§x§d§b§_§g§r§i§d§_§m§e§n§u§_§s§t§a§t§u§s§_§b§a§r§r",
                /**
                 * Wide custom form style.
                 *
                 * This is the same as the general form style, but is double the width.
                 *
                 * -   Allows for buttons in the title bar.
                 * -   Is 440px wide instead of 220px.
                 */
                wide: "§a§n§d§e§x§d§b§_§w§i§d§e§_§l§o§n§g§_§f§o§r§m§r",
                /**
                 * Wide custom form style, with a status bar.
                 *
                 * This is the same as the general (Status Bar) form style, but is double the width.
                 *
                 * -   Allows for buttons in the title bar.
                 * -   Is 440px wide instead of 220px.
                 * -   Has a status bar.
                 *
                 * @deprecated This form style is currently disabled for performance reasons.
                 */
                wide_status_bar: "§a§n§d§e§x§d§b§_§w§i§d§e§_§l§o§n§g§_§f§o§r§m§_§s§t§a§t§u§s§_§b§a§r§r",
                /**
                 * Medium custom form style.
                 *
                 * This is the same as the general form style, but it is the same size as the grid menu form style.
                 *
                 * -   Allows for buttons in the title bar.
                 * -   The form is 345px\*230px instead of 220px\*200px.
                 */
                medium: "§a§n§d§e§x§d§b§_§m§e§d§i§u§m§_§l§o§n§g§_§f§o§r§m§r",
                /**
                 * Medium custom form style, with a status bar.
                 *
                 * This is the same as the general (Status Bar) form style, but it is the same size as the grid menu form style.
                 *
                 * -   Allows for buttons in the title bar.
                 * -   The form is 345px\*230px instead of 220px\*200px.
                 * -   Has a status bar.
                 *
                 * @deprecated This form style is currently disabled for performance reasons.
                 */
                medium_status_bar: "§a§n§d§e§x§d§b§_§m§e§d§i§u§m§_§l§o§n§g§_§f§o§r§m§_§s§t§a§t§u§s§_§b§a§r§r",
                /**
                 * Fullscreen custom form style.
                 *
                 * -   Allows for buttons in the title bar.
                 * -   Is fullscreen.
                 */
                fullscreen: "§a§n§d§e§x§d§b§_§f§u§l§l§s§c§r§e§e§n§_§l§o§n§g§_§f§o§r§m§r",
                /**
                 * Fullscreen custom form style, with a status bar.
                 *
                 * -   Allows for buttons in the title bar.
                 * -   Is fullscreen.
                 * -   Has a status bar.
                 *
                 * @deprecated This form style is currently disabled for performance reasons.
                 */
                fullscreen_status_bar: "§a§n§d§e§x§d§b§_§f§u§l§l§s§c§r§e§e§n§_§l§o§n§g§_§f§o§r§m§_§s§t§a§t§u§s§_§b§a§r§r",
            },
            options: {
                /**
                 * Removes the X button from the top right corner.
                 */
                removeXButton: "§a§n§d§e§x§d§b§_§n§o§_§x§r",
            },
        },
        buttons: {
            /**
             * The position of the button.
             *
             * @default main_only
             */
            positions: {
                /**
                 * Makes the button only appear on the title bar.
                 */
                title_bar_only: "§a§n§d§e§x§d§b§_§t§i§t§l§e§_§b§a§r§r",
                /**
                 * Makes the button only appear on the left side.
                 *
                 * ### Effects on different form styles:
                 *
                 * #### Grid Menu, Grid Menu (Status Bar):
                 * Only appears on the left side of the dialog box.
                 *
                 * #### Wide, Wide (Status Bar), Fullscreen, Fullscreen (Status Bar), Vanilla:
                 * No Effect.
                 */
                left_side_only: "§a§n§d§e§x§d§b§_§l§s§o§r",
                /**
                 * Makes the button only appear on the main area.
                 *
                 * ### Effects on different form styles:
                 *
                 * #### Grid Menu, Grid Menu (Status Bar):
                 * Only appears in the button grid.
                 *
                 * #### Wide, Wide (Status Bar), Fullscreen, Fullscreen (Status Bar), Vanilla:
                 * No Effect.
                 */
                main_only: "§a§n§d§e§x§d§b§_§m§o§r",
                /**
                 * Makes the button only appear on the right side.
                 *
                 * ### Effects on different form styles:
                 *
                 * #### Grid Menu, Grid Menu (Status Bar):
                 * Only appears on the right side of the dialog box.
                 *
                 * #### Wide, Wide (Status Bar), Fullscreen, Fullscreen (Status Bar), Vanilla:
                 * No Effect.
                 */
                right_side_only: "§a§n§d§e§x§d§b§_§r§s§o§r",
                /**
                 * Makes the button only appear on the left side of the status bar.
                 *
                 * ### Effects on different form styles:
                 *
                 * #### Grid Menu (Status Bar), Wide (Status Bar), Fullscreen (Status Bar):
                 * Only appears on the left side of the status bar.
                 *
                 * #### Grid Menu, Wide, Fullscreen, Vanilla:
                 * No Effect.
                 *
                 * @deprecated This button position is useless because all of the form styles that have a status bar are disabled for performance reasons.
                 */
                status_bar_left_only: "§a§n§d§e§x§d§b§_§s§t§a§t§u§s§_§b§a§r§_§l§e§f§t§r",
                /**
                 * Makes the button only appear on the side of the status bar.
                 *
                 * ### Effects on different form styles:
                 *
                 * #### Grid Menu (Status Bar), Wide (Status Bar), Fullscreen (Status Bar):
                 * Only appears on the side of the status bar.
                 *
                 * #### Grid Menu, Wide, Fullscreen, Vanilla:
                 * No Effect.
                 *
                 * @deprecated This button position is useless because all of the form styles that have a status bar are disabled for performance reasons.
                 */
                status_bar_only: "§a§n§d§e§x§d§b§_§s§t§a§t§u§s§_§b§a§r§r",
                /**
                 * Makes the button only appear on the right side of the status bar.
                 *
                 * ### Effects on different form styles:
                 *
                 * #### Grid Menu (Status Bar), Wide (Status Bar), Fullscreen (Status Bar):
                 * Only appears on the right side of the status bar.
                 *
                 * #### Grid Menu, Wide, Fullscreen, Vanilla:
                 * No Effect.
                 *
                 * @deprecated This button position is useless because all of the form styles that have a status bar are disabled for performance reasons.
                 */
                status_bar_right_only: "§a§n§d§e§x§d§b§_§s§t§a§t§u§s§_§b§a§r§_§r§i§g§h§t§r",
            },
            options: {
                /**
                 * Makes the button unable to be clicked. Also makes the button display grayed out.
                 */
                disabled: "§a§n§d§e§x§d§b§_§d§i§s§a§b§l§e§d§r",
                /**
                 * Makes the button hidden.
                 */
                hidden: "§a§n§d§e§x§d§b§_§h§i§d§d§e§n§_§b§u§t§t§o§n§r",
                /**
                 * Makes the button selected by default.
                 */
                startSelected: "§a§n§d§e§x§d§b§_§s§t§a§r§t§_§s§e§l§e§c§t§e§d§r",
            },
            styles: {
                /**
                 * Makes the button display as plain text, will also make the button unable to be clicked.
                 * @todo Currently only works on the status bar of the grid menu form.
                 */
                plain_text: "§a§n§d§e§x§d§b§_§p§l§a§i§n§_§t§e§x§t§r",
                /**
                 * Makes the button's icon display as plain text.
                 * @todo Currently only works on the grid menu form.
                 */
                display_icon_as_text: "§a§n§d§e§x§d§b§_§i§c§o§n§_§t§e§x§t§r",
            },
        },
    },
    /**
     * Styles for {@link modules.mcServerUi.ModalFormData ModalFormData} UIs.
     */
    modal: {
        titles: {
            formStyles: {
                /**
                 * General custom modal form style.
                 */
                general: "§a§n§d§e§x§d§b§_§g§e§n§e§r§a§l§_§c§u§s§t§o§m§r",
                /**
                 * Wide custom modal form style.
                 *
                 * This is the same as the general modal form style, but is double the width.
                 *
                 * -   Is 450px wide instead of 225px.
                 */
                wide: "§a§n§d§e§x§d§b§_§w§i§d§e§_§l§o§n§g§_§f§o§r§m§r",
                /**
                 * Medium custom modal form style.
                 *
                 * This is the same as the general modal form style, but it is the same size as the grid menu long form style.
                 *
                 * -   The form is 345px\*230px instead of 225px\*200px.
                 */
                medium: "§a§n§d§e§x§d§b§_§m§e§d§i§u§m§_§l§o§n§g§_§f§o§r§m§r",
                /**
                 * Fullscreen custom modal form style.
                 *
                 * -   Is fullscreen.
                 */
                fullscreen: "§a§n§d§e§x§d§b§_§f§u§l§l§s§c§r§e§e§n§_§l§o§n§g§_§f§o§r§m§r",
            },
            options: {
                /**
                 * Removes the X button from the top right corner.
                 * @todo This is currently not functional.
                 */
                removeXButton: "§a§n§d§e§x§d§b§_§n§o§_§x§r",
            },
        },
    },
};
//# sourceMappingURL=customFormUICodes.js.map