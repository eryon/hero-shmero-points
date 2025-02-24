import { MODULE_ID } from '../index';

export async function run() {
  await Promise.all([
    remap('HeroPointLabelSingular', 'HeroPoints.LabelSingular'),
    remap('HeroPointLabelPlural', 'HeroPoints.LabelPlural'),
    remap('HeroPointIcon', 'HeroPoints.Icon'),
    remap('UseArticleAn', 'HeroPoints.UseArticleAn'),
    remove('hpLabel'),
    remove('HeroPointsLabel')
  ]);
}

async function remap(oldKey, newKey, scope = 'world') {
  const oldSetting = game.settings.storage.get(scope).find((x) => x.key === `${MODULE_ID}.${oldKey}`);

  if (oldSetting) {
    await game.settings.set(MODULE_ID, newKey, oldSetting.value);
    await oldSetting.delete();
  }
}

async function remove(key, scope = 'world') {
  const oldSetting = game.settings.storage.get(scope).find((x) => x.key === `${MODULE_ID}.${key}`);

  if (oldSetting) {
    await oldSetting.delete();
  }
}
