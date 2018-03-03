import * as C from './../../../i18n/constants';

export default function cutItem(copyPastePlugin) {
  return {
    key: 'cut',
    name: function name() {
      return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_CUT);
    },
    callback: function callback() {
      copyPastePlugin.cut();
    },
    disabled: function disabled() {
      return !copyPastePlugin.hot.getSelected();
    },

    hidden: false
  };
}