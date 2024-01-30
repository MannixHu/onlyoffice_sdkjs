/*
 * (c) Copyright Ascensio System SIA 2010-2023
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */
QUnit.config.autostart = false;
$(function() {
	let documents = {
		"test_formats": Asc.test_formats,
		"test_formats_redo": Asc.test_formats_redo,
		"test_formats2": Asc.test_formats,
		"test_formats2_redo": Asc.test_formats_redo,
	}
	let files = {};
	let api = new Asc.spreadsheet_api({
		'id-view': 'editor_sdk'
	});
	api.FontLoader = {
		LoadDocumentFonts: function() {
		}
	};
	api.collaborativeEditing = new AscCommonExcel.CCollaborativeEditing({});
	window["Asc"]["editor"] = api;

	waitLoadModules(function(){
		AscCommon.g_oTableId.init();
		api._onEndLoadSdk();
		startTests();
	});
	function waitLoadModules(waitCallback) {
		Asc.spreadsheet_api.prototype._init = function() {
			this._loadModules();
		};
		Asc.spreadsheet_api.prototype._loadFonts = function(fonts, callback) {
			callback();
		};
		Asc.spreadsheet_api.prototype.onEndLoadFile = function(fonts, callback) {
			waitCallback();
		};
		AscCommonExcel.WorkbookView.prototype._calcMaxDigitWidth = function() {
		};
		AscCommonExcel.WorkbookView.prototype._init = function() {
		};
		AscCommonExcel.WorkbookView.prototype._onWSSelectionChanged = function() {
		};
		AscCommonExcel.WorkbookView.prototype.showWorksheet = function() {
		};
		AscCommonExcel.WorksheetView.prototype._init = function() {
		};
		AscCommonExcel.WorksheetView.prototype.updateRanges = function() {
		};
		AscCommonExcel.WorksheetView.prototype._autoFitColumnsWidth = function() {
		};
		AscCommonExcel.WorksheetView.prototype.setSelection = function() {
		};
		AscCommonExcel.WorksheetView.prototype.draw = function() {
		};
		AscCommonExcel.WorksheetView.prototype._prepareDrawingObjects = function() {
		};
		AscCommon.baseEditorsApi.prototype._onEndLoadSdk = function() {
		};
	}
	function openDocument(file){
		if (api.wbModel) {
			api.asc_CloseFile();
		}

		api.isOpenOOXInBrowser = false;
		api.openingEnd.xlsx = true;
		api.openingEnd.data = AscCommon.Base64.decode(file["Editor.xlsx"]);
		api._openDocument(AscCommon.Base64.decode(file["Editor.bin"]));
		api.wb = new AscCommonExcel.WorkbookView(api.wbModel, api.controller, api.handlers, api.HtmlElement,
			api.topLineEditorElement, api, api.collaborativeEditing, api.fontRenderingMode);
		return api.wbModel;
	}
	function prepareTest(assert, wb){
		api.wb.model = wb;
		api.wbModel = wb;
		api.initGlobalObjects(wb);
		api.handlers.remove("getSelectionState");
		api.handlers.add("getSelectionState", function () {
			return null;
		});
		api.handlers.remove("asc_onError");
		api.handlers.add("asc_onError", function (code, level) {
			assert.equal(code, 0, "asc_onError");
		});
		AscCommon.History.Clear();
	}
	let memory = new AscCommon.CMemory();
	function Utf8ArrayToStr(array) {
		let out, i, len, c;
		let char2, char3;

		out = "";
		len = array.length;
		i = 0;
		while(i < len) {
			c = array[i++];
			switch(c >> 4)
			{
				case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
				// 0xxxxxxx
				out += String.fromCharCode(c);
				break;
				case 12: case 13:
				// 110x xxxx   10xx xxxx
				char2 = array[i++];
				out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
				break;
				case 14:
					// 1110 xxxx  10xx xxxx  10xx xxxx
					char2 = array[i++];
					char3 = array[i++];
					out += String.fromCharCode(((c & 0x0F) << 12) |
						((char2 & 0x3F) << 6) |
						((char3 & 0x3F) << 0));
					break;
			}
		}

		return out;
	}
	function getXml(pivot, addCacheDefinition){
		memory.Seek(0);
		pivot.toXml(memory);
		if(addCacheDefinition) {
			memory.WriteXmlString('\n\n');
			pivot.cacheDefinition.toXml(memory);
		}
		let buffer = new Uint8Array(memory.GetCurPosition());
		for (let i = 0; i < memory.GetCurPosition(); i++)
		{
			buffer[i] = memory.data[i];
		}
		if(typeof TextDecoder !== "undefined") {
			return new TextDecoder("utf-8").decode(buffer);
		} else {
			return Utf8ArrayToStr(buffer);
		}

	}
	function checkHistoryOperation(assert, pivot, valuesUndo, valuesRedo, message, action, check) {
		let ws = pivot.GetWS();
		let wb = ws.workbook;
		let xmlUndo = getXml(pivot, false);
		let pivotStart = pivot.clone();
		pivotStart.Id = pivot.Get_Id();

		AscCommon.History.Create_NewPoint();
		AscCommon.History.StartTransaction();
		action();
		AscCommon.History.EndTransaction();
		pivot = wb.getPivotTableById(pivot.Get_Id());
		check(assert, pivot, valuesRedo, message);
		let xmlDo = getXml(pivot, true);
		let changes = wb.SerializeHistory();

		AscCommon.History.Undo();
		pivot = wb.getPivotTableById(pivot.Get_Id());
		check(assert, pivot, valuesUndo, message + "_undo");
		assert.strictEqual(getXml(pivot, false), xmlUndo, message + "_undo_xml");

		AscCommon.History.Redo();
		pivot = wb.getPivotTableById(pivot.Get_Id());
		check(assert, pivot, valuesRedo, message + "_redo");
		assert.strictEqual(getXml(pivot, true), xmlDo, message + "_redo_xml");

		AscCommon.History.Undo();
		ws.deletePivotTable(pivot.Get_Id());
		pivot = pivotStart;
		ws.insertPivotTable(pivot, false, false);
		wb.DeserializeHistory(changes);
		pivot = wb.getPivotTableById(pivot.Get_Id());
		check(assert, pivot, valuesRedo, message + "_changes");
		assert.strictEqual(getXml(pivot, true), xmlDo, message + "_changes_xml");
		return pivot;
	}
	function getReportValues(pivot) {
		let res = [];
		let range = new AscCommonExcel.MultiplyRange(pivot.getReportRanges()).getUnionRange();
		pivot.GetWS().getRange3(range.r1, range.c1, range.r2, range.c2)._foreach(function(cell, r, c, r1, c1) {
			if (!res[r - r1]) {
				res[r - r1] = [];
			}
			res[r - r1][c - c1] = cell.getName() + ":" + cell.getValue();
		});
		return res;
	}
	function getReportValuesWithBoolFill(pivot) {
		let res = [];
		let range = new AscCommonExcel.MultiplyRange(pivot.getReportRanges()).getUnionRange();
		pivot.GetWS().getRange3(range.r1, range.c1, range.r2, range.c2)._foreach(function(cell, r, c, r1, c1) {
			if (!res[r - r1]) {
				res[r - r1] = [];
			}
			res[r - r1][c - c1] = cell.getName() + ":" + cell.getValue()+ ":" + !!(cell.getStyle() && !cell.getStyle().isNormalFill());
		});
		return res;
	}
	function getReportValuesWithBoolFillAndNum(pivot) {
		let res = [];
		let range = new AscCommonExcel.MultiplyRange(pivot.getReportRanges()).getUnionRange();
		pivot.GetWS().getRange3(range.r1, range.c1, range.r2, range.c2)._foreach(function(cell, r, c, r1, c1) {
			if (!res[r - r1]) {
				res[r - r1] = [];
			}
			let xf = cell.getStyle();
			res[r - r1][c - c1] = cell.getName() + ":" + cell.getValue()+ ":" + !!(xf && (!xf.isNormalFill() || !xf.num || !xf.num.getNumFormat().isGeneralFormat()));
		});
		return res;
	}

	QUnit.module("Pivot");

	function startTests() {
		QUnit.start();
		QUnit.test('Test: refresh test_formats check values and format', function (assert) {
			let file = Asc.test_formats;
			let fileRedo = Asc.test_formats_redo;
			let wsNames = [
				"Default data",
				"Default Label",
				"MultidataField default data",
				"MultidataField default label",
				"Multidatafield label offset",
				"TopRight&Origin",
				"Buttons compact test",
				"Buttons tabular test",
				"Buttons outline test",
				"Filter test",
				"TypeAll test",
				"NoDataFieldAllTest",
				"All test"
			];
			let row = 4;
			let col = 0;
			let getValues = getReportValuesWithBoolFill;

			function prepareValues(wb, name, row, col){
				let pivot = wb.getWorksheetByName(name).getPivotTable(col, row);
				return getValues(pivot);
			}
			function preparePivots(wb, name, row, col){
				return wb.getWorksheetByName(name).getPivotTable(col, row);
			}

			let wbRedo = openDocument(fileRedo);
			let valuesRedo = wsNames.map(function(name){
				return prepareValues(wbRedo, name, row, col);
			});

			let wb = openDocument(file);
			let valuesUndo = wsNames.map(function(name){
				return prepareValues(wb, name, row, col);
			});
			let pivots = wsNames.map(function(name){
				return preparePivots(wb, name, row, col);
			});

			prepareTest(assert, wb);
			wsNames.forEach(function(name, index){
				let pivot = pivots[index];
				pivot = checkHistoryOperation(assert, pivot, valuesUndo[index], valuesRedo[index], "refresh[" + name + "]", function(){
					pivot.asc_refresh(api);
				}, function(assert, pivot, values, message) {
					assert.deepEqual(getValues(pivot), values, message);
				});
			});
		});
		QUnit.test('Test: refresh pivot-styles-numformat check values and format', function (assert) {
			let file = Asc.pivot_styles_numformat;
			let fileRedo = Asc.pivot_styles_numformat_redo;
			let wsNames = [
				"pivot"
			];
			let row = 4;
			let col = 0;
			let getValues = getReportValuesWithBoolFillAndNum;

			function prepareValues(wb, name, row, col){
				let pivot = wb.getWorksheetByName(name).getPivotTable(col, row);
				return getValues(pivot);
			}
			function preparePivots(wb, name, row, col){
				return wb.getWorksheetByName(name).getPivotTable(col, row);
			}

			let wbRedo = openDocument(fileRedo);
			let valuesRedo = wsNames.map(function(name){
				return prepareValues(wbRedo, name, row, col);
			});

			let wb = openDocument(file);
			let valuesUndo = wsNames.map(function(name){
				return prepareValues(wb, name, row, col);
			});
			let pivots = wsNames.map(function(name){
				return preparePivots(wb, name, row, col);
			});

			prepareTest(assert, wb);
			wsNames.forEach(function(name, index){
				let pivot = pivots[index];
				pivot = checkHistoryOperation(assert, pivot, valuesUndo[index], valuesRedo[index], "refresh[" + name + "]", function(){
					pivot.asc_refresh(api);
				}, function(assert, pivot, values, message) {
					assert.deepEqual(getValues(pivot), values, message);
				});
			});
		});
		QUnit.test('Test: refresh pivot check formats after dataField reindex', function (assert) {
			const file = Asc.pivot_datafield_reindex;
			const row = 4;
			const col = 0;
			const wb = openDocument(file);
			const getValues = getReportValuesWithBoolFillAndNum;

			const dataFieldStartPivot = wb.getWorksheetByName('DataFieldStart').getPivotTable(col, row);
			const moveDataFieldResultPivot = wb.getWorksheetByName('moveDataFieldResult').getPivotTable(col, row);
			const removeDataFieldResultPivot = wb.getWorksheetByName('RemoveDataFieldResult').getPivotTable(col, row);

			const dataFieldStartValues = getValues(dataFieldStartPivot);
			const moveDataFieldResultValues = getValues(moveDataFieldResultPivot);
			const removeDataFieldResultValues = getValues(removeDataFieldResultPivot);

			prepareTest(assert, wb);
			let pivot = wb.getWorksheetByName('DataFieldStart').getPivotTable(col, row);
			pivot = checkHistoryOperation(assert, dataFieldStartPivot, dataFieldStartValues, moveDataFieldResultValues, "move dataField", function(){
				pivot.asc_moveDataField(api, 0, 1);
				pivot.asc_refresh(api);
			}, function(assert, pivot, values, message) {
				assert.deepEqual(getValues(pivot), values, message);
			});
			pivot = checkHistoryOperation(assert, dataFieldStartPivot, moveDataFieldResultValues, removeDataFieldResultValues, "remove dataField", function(){
				pivot.asc_removeDataField(api, 5, 1);
				pivot.asc_refresh(api);
			}, function(assert, pivot, values, message) {
				assert.deepEqual(getValues(pivot), values, message);
			});
		});
		QUnit.test('Test: refresh pivot check formats after change source data 1', function (assert) {
			const getValues = getReportValuesWithBoolFillAndNum;
			const file = Asc.pivot_data_reindex1;
			const row = 4;
			const col = 0;
			const wb = openDocument(file);
			const dataRefFieldSettings = 'Sheet1' + "!" + 'I2:O13';
			let pivot = wb.getWorksheetByName('pivot').getPivotTable(col, row);
			const values = getValues(pivot);
			prepareTest(assert, wb);

			pivot = checkHistoryOperation(assert, pivot, values, values, "change source data 1", function(){
				const props = new Asc.CT_pivotTableDefinition();
				props.asc_setDataRef(dataRefFieldSettings);
				pivot.asc_set(api, props);
				pivot.asc_refresh(api);
			}, function(assert, pivot, values, message) {
				assert.deepEqual(getValues(pivot), values, message);
			});
		});
		QUnit.test('Test: refresh pivot check formats after change source data 2', function (assert) {
			const file = Asc.pivot_data_reindex2;
			const row = 4;
			const col = 0;
			const wb = openDocument(file);
			const dataRefFieldSettings1 = 'Sheet1' + "!" + 'I2:O8';
			const dataRefFieldSettings2 = 'Sheet1' + "!" + 'A2:G13';
			const getValues = getReportValuesWithBoolFillAndNum;
			function prepareValues(wb, name, row, col){
				let pivot = wb.getWorksheetByName(name).getPivotTable(col, row);
				return getValues(pivot);
			}
			const valuesStart = prepareValues(wb, 'start', row, col);
			const valuesReindex = prepareValues(wb, 'reindex', row, col);
			const valuesResult = prepareValues(wb, 'result', row, col);
			let pivot = wb.getWorksheetByName('start').getPivotTable(col, row);
			prepareTest(assert, wb);

			pivot = checkHistoryOperation(assert, pivot, valuesStart, valuesReindex, "change source data 2 reindex", function(){
				const props = new Asc.CT_pivotTableDefinition();
				props.asc_setDataRef(dataRefFieldSettings1);
				pivot.asc_set(api, props);
				pivot.asc_refresh(api);
			}, function(assert, pivot, values, message) {
				assert.deepEqual(getValues(pivot), values, message);
			});
			pivot = checkHistoryOperation(assert, pivot, valuesReindex, valuesResult, "change source data 2 result", function(){
				const props = new Asc.CT_pivotTableDefinition();
				props.asc_setDataRef(dataRefFieldSettings2);
				pivot.asc_set(api, props);
				pivot.asc_refresh(api);
			}, function(assert, pivot, values, message) {
				assert.deepEqual(getValues(pivot), values, message);
			});
		});
		QUnit.test('Test: refresh pivot check formats after remove field', function (assert) {
			const file = Asc.remove_field;
			const row = 4;
			const col = 0;
			const wb = openDocument(file);
			const getValues = getReportValuesWithBoolFillAndNum;
			function prepareValues(wb, name, row, col){
				let pivot = wb.getWorksheetByName(name).getPivotTable(col, row);
				return getValues(pivot);
			}
			const valuesStart = prepareValues(wb, 'start', row, col);
			const valuesResult = prepareValues(wb, 'result', row, col);
			let pivot = wb.getWorksheetByName('start').getPivotTable(col, row);
			prepareTest(assert, wb);

			pivot = checkHistoryOperation(assert, pivot, valuesStart, valuesResult, "remove field", function(){
				pivot.asc_removeField(api, 0);
				pivot.asc_addRowField(api, 0);
				pivot.asc_moveRowField(api, 1, 0);
				pivot.asc_refresh(api);
			}, function(assert, pivot, values, message) {
				assert.deepEqual(getValues(pivot), values, message);
			});
		});
		QUnit.test('Test: GETPIVOTDATA', function (assert) {
			const file = Asc.GetPivotData;
			const wb = openDocument(file);
			let data = {
				"general": [
					['G4', 'E11'],
					['G5', 'E8'],
					['G6', 'E9'],
					['G7', 'D9'],
					['G8', 'D11'],
					['G9', 'B10'],
					['G10', 'E11', true],
					['H4', 'E11', true],
					['H5', 'D9', true],
					['H6', 'E11', true],
					['H7', 'D9', true],
					['I4', 'E11', true],
					['I5', 'E8', true],
					['I6', 'E8', true],
					['I7', 'E11', true],
					['G15', 'C17'],
					['G16', 'B17'],
					['G17', 'C17', true],
					['G21', 'A20', true],
					['H21', 'A20', true],
					['I21', 'A20', true],
					['I22', 'A20', true],
					['I23', 'B24'],
					['J21', 'A20', true],
					['G28', 'B34'],
					['G29', 'B41'],
					['G30', 'B41', true],
					['G46', 'A45', true],
					['H46', 'A45', true],
				],
				"total": [
					['H3', 'D7'],
					['H10', 'B13'],
					['H17', 'D19'],
					['H24', 'A24', true],
					['H31', 'A31', true],
					['H37', 'A37', true],
					['H43', 'A44'],
				],
				"subtotal": [
					['D3', 'B3'],
					['D10', 'B10'],
					['D18', 'B18', true],
					['D21', 'B21'],
					['D25', 'B25', true],
					['D26', 'B26'],
					['D34', 'B34'],
					['K3', 'H3'],
					['K10', 'H10'],
					['K18', 'H18', true],
					['K21', 'H21'],
					['K25', 'H25', true],
					['K26', 'I26'],
					['K34', 'I34'],
					['R5', 'O5'],
					['R12', 'O12'],
					['R18', 'O18', true],
					['R25', 'O25', true],
					['R28', 'P28'],
					['R33', 'P33'],
					['AB5', 'Y5'],
					['AB11', 'V9', true],
					['AB12', 'Y12'],
					['AH17', 'V16', true],
					['AH18', 'Z20'],
					['AH20', 'AE20'],
				],
				"values-col": [
					['AG7', 'Y7'],
					['AH7', 'AC7'],
					['AI7', 'AE7'],
					['AG13', 'Y13'],
					['AH13', 'AC13'],
					['AI13', 'AE13'],
					['AG20', 'X20'],
					['AH20', 'AC20'],
					['AI20', 'AE20'],
					['AG26', 'X26'],
					['AH26', 'AC26'],
					['AI26', 'AE26'],
					['AG33', 'Y33'],
					['AH33', 'AC33'],
					['AI33', 'AE33'],
					['AG39', 'Y39'],
					['AH39', 'AC39'],
					['AI39', 'AE39'],
				],
				"values-row": [
					['R7', 'K7'],
					['S7', 'O7'],
					['T7', 'P7'],
					['R20', 'K20'],
					['S20', 'O20'],
					['T20', 'P20'],
					['R30', 'K30'],
					['S30', 'O30'],
					['T30', 'P30'],
					['R45', 'K45'],
					['S45', 'O45'],
					['T45', 'P45'],
					['R57', 'K57'],
					['S57', 'O57'],
					['T57', 'P57'],
					['R70', 'K70'],
					['S70', 'O70'],
					['T70', 'P70'],
				],
			};
			for(let sheetName in data) {
				let elems = data[sheetName];
				let ws = wb.getWorksheetByName(sheetName);
				elems.forEach(function (elem) {
					let errorText = sheetName + ':' + JSON.stringify(elem);
					let formulaRef = elem[0];
					let rangeFormula = ws.getRange2(formulaRef);
					let valueExpected = rangeFormula.getValue();
					let formulaExpected = rangeFormula.getValueForEdit().substring(1);

					if (!elem[2]) {
						let pivotRef = elem[1];
						let rangePivot = ws.getRange2(pivotRef);
						let bboxPivot = rangePivot.bbox;
						let pivot = ws.getPivotTable(bboxPivot.c1, bboxPivot.r1);
						let formula = pivot.getGetPivotDataFormulaByActiveCell(bboxPivot.r1, bboxPivot.c1);
						assert.strictEqual(formula, formulaExpected, errorText);
					}

					let oParser = new AscCommonExcel.parserFormula(formulaExpected, "A1", ws);
					assert.ok(oParser.parse(), errorText);
					assert.strictEqual(oParser.calculate().getValue() + "", valueExpected, errorText);
				});
			}

		});
	}
});
