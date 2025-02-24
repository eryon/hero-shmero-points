import { MODULE_ID } from '../index';

export class MythicPointSettings extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: `${MODULE_ID}.Settings.Mythic.MenuName`,
      id: 'mythic-point-settings',
      template: 'modules/hero-shmero-points/static/templates/settings.hbs',
      height: 'auto',
      width: 600,
      closeOnSubmit: true
    });
  }

  getData(options = {}) {
    const settings = Object.entries(MythicPointSettings.settings).map(([key, setting]) => {
      const value = game.settings.get(MODULE_ID, `MythicPoints.${key}`);

      return {
        ...setting,
        key,
        value,
        isCheckbox: setting.type === Boolean
      };
    });

    return foundry.utils.mergeObject(super.getData(options), { settings });
  }

  async _updateObject(event, data) {
    const keys = Object.keys(MythicPointSettings.settings);

    for(const key of keys) {
      if (data[key] === '') {
        await game.settings.set(MODULE_ID, `MythicPoints.${key}`, game.i18n.localize(MythicPointSettings.settings[key].default));
      } else {
        await game.settings.set(MODULE_ID, `MythicPoints.${key}`, data[key]);
      }
    }

    return SettingsConfig.reloadConfirm({ world: true });
  }

  static registerSettings() {
    game.settings.register(MODULE_ID, 'MythicPoints.LabelSingular', this.settings.LabelSingular);
    game.settings.register(MODULE_ID, 'MythicPoints.LabelPlural', this.settings.LabelPlural);
    game.settings.register(MODULE_ID, 'MythicPoints.Icon', this.settings.Icon);
    game.settings.register(MODULE_ID, 'MythicPoints.UseArticleAn', this.settings.UseArticleAn);
  }

  static get settings() {
    return {
      LabelSingular: {
        name: `${MODULE_ID}.Settings.Mythic.SingularName`,
        hint: `${MODULE_ID}.Settings.Mythic.SingularHint`,
        default: `${MODULE_ID}.Defaults.Mythic.LabelSingular`,
        config: false,
        scope: 'world',
        type: String
      },
      LabelPlural: {
        name: `${MODULE_ID}.Settings.Mythic.PluralName`,
        hint: `${MODULE_ID}.Settings.Mythic.PluralHint`,
        default: `${MODULE_ID}.Defaults.Mythic.LabelPlural`,
        config: false,
        scope: 'world',
        type: String
      },
      Icon: {
        name: `${MODULE_ID}.Settings.Mythic.IconName`,
        hint: `${MODULE_ID}.Settings.Mythic.IconHint`,
        default: 'fa-circle-m',
        config: false,
        scope: 'world',
        type: String
      },
      UseArticleAn: {
        name: `${MODULE_ID}.Settings.Mythic.UseAnName`,
        hint: `${MODULE_ID}.Settings.Mythic.UseAnHint`,
        default: false,
        config: false,
        scope: 'world',
        type: Boolean
      }
    };
  }
}
