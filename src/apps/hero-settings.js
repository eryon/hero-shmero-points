import { MODULE_ID } from '../index';

export class HeroPointSettings extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      title: `${MODULE_ID}.Settings.Hero.MenuName`,
      id: 'hero-point-settings',
      template: 'modules/hero-shmero-points/static/templates/settings.hbs',
      height: 'auto',
      width: 600,
      closeOnSubmit: true
    });
  }

  getData(options = {}) {
    const settings = Object.entries(HeroPointSettings.heroPointSettings).map(([key, setting]) => {
      const value = game.settings.get(MODULE_ID, `HeroPoints.${key}`);

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
    const keys = Object.keys(HeroPointSettings.heroPointSettings);

    for(const key of keys) {
      if (data[key] === '') {
        await game.settings.set(MODULE_ID, `HeroPoints.${key}`, game.i18n.localize(HeroPointSettings.heroPointSettings[key].default));
      } else {
        await game.settings.set(MODULE_ID, `HeroPoints.${key}`, data[key]);
      }
    }

    return SettingsConfig.reloadConfirm({ world: true });
  }

  static registerSettings() {
    game.settings.register(MODULE_ID, 'HeroPoints.LabelSingular', this.heroPointSettings.LabelSingular);
    game.settings.register(MODULE_ID, 'HeroPoints.LabelPlural', this.heroPointSettings.LabelPlural);
    game.settings.register(MODULE_ID, 'HeroPoints.Icon', this.heroPointSettings.Icon);
    game.settings.register(MODULE_ID, 'HeroPoints.UseArticleAn', this.heroPointSettings.UseArticleAn);
  }

  static get heroPointSettings() {
    return {
      LabelSingular: {
        name: `${MODULE_ID}.Settings.Hero.SingularName`,
        hint: `${MODULE_ID}.Settings.Hero.SingularHint`,
        default: `${MODULE_ID}.Defaults.Hero.LabelSingular`,
        config: false,
        // requiresReload: true,
        scope: 'world',
        type: String
      },
      LabelPlural: {
        name: `${MODULE_ID}.Settings.Hero.PluralName`,
        hint: `${MODULE_ID}.Settings.Hero.PluralHint`,
        default: `${MODULE_ID}.Defaults.Hero.LabelPlural`,
        config: false,
        // requiresReload: true,
        scope: 'world',
        type: String
      },
      Icon: {
        name: `${MODULE_ID}.Settings.Hero.IconName`,
        hint: `${MODULE_ID}.Settings.Hero.IconHint`,
        default: 'fa-hospital-symbol',
        config: false,
        // requiresReload: true,
        scope: 'world',
        type: String
      },
      UseArticleAn: {
        name: `${MODULE_ID}.Settings.Hero.UseAnName`,
        hint: `${MODULE_ID}.Settings.Hero.UseAnHint`,
        default: false,
        config: false,
        // requiresReload: true,
        scope: 'world',
        type: Boolean
      }
    };
  }
}
