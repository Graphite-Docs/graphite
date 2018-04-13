function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

describe('ContextMenu', function () {
  var id = 'testContainer';

  beforeEach(function () {
    this.$container = $('<div id="' + id + '"></div>').appendTo('body');
  });

  afterEach(function () {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  describe('remove columns', function () {
    it('should execute action when single cell is selected', _asyncToGenerator(function* () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        contextMenu: true
      });

      selectCell(2, 2);
      contextMenu();

      // "Remove column" item
      $('.htContextMenu .ht_master .htCore').find('tbody td').not('.htSeparator').eq(5).simulate('mousedown');

      expect(getDataAtRow(0)).toEqual(['A1', 'B1', 'D1', 'E1']);
    }));

    it('should execute action when range of the cells are selected', _asyncToGenerator(function* () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5),
        contextMenu: true
      });

      selectCell(2, 2, 4, 4);
      contextMenu();

      // "Remove column" item
      $('.htContextMenu .ht_master .htCore').find('tbody td').not('.htSeparator').eq(5).simulate('mousedown');

      expect(getDataAtRow(0)).toEqual(['A1', 'B1']);
    }));

    it('should execute action when multiple cells are selected', _asyncToGenerator(function* () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(8, 5),
        contextMenu: true
      });

      $(getCell(0, 0)).simulate('mousedown');
      $(getCell(1, 0)).simulate('mouseover');
      $(getCell(1, 0)).simulate('mouseup');

      keyDown('ctrl');

      $(getCell(2, 1)).simulate('mousedown');
      $(getCell(2, 1)).simulate('mouseover');
      $(getCell(2, 1)).simulate('mouseup');

      $(getCell(0, 3)).simulate('mousedown');
      $(getCell(5, 3)).simulate('mouseover');
      $(getCell(5, 3)).simulate('mouseup');

      $(getCell(7, 4)).simulate('mousedown');
      $(getCell(7, 4)).simulate('mouseover');
      $(getCell(7, 4)).simulate('mouseup');

      contextMenu();

      // "Remove column" item
      $('.htContextMenu .ht_master .htCore').find('tbody td').not('.htSeparator').eq(5).simulate('mousedown');

      expect(getDataAtRow(0)).toEqual(['C1']);
    }));
  });
});