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

"use strict";
(/**
 * @param {Window} window
 * @param {undefined} undefined
 */
function (window, undefined) {

	/*
	 * Import
	 * -----------------------------------------------------------------------------
	 */
	let asc = window["Asc"];

	let asc_Range = asc.Range;
	let cElementType = AscCommonExcel.cElementType;

	function TraceDependentsManager(ws) {
		this.ws = ws;
		this.precedents = null;
		this.precedentsExternal = null;
		this.currentPrecedents = null;
		this.dependents = null;
		this.isDependetsCall = null;
		this.inLoop = null;
		this.isPrecedentsCall = null;
		this.precedentsAreas = null;
		this.precedentsAreasHeaders = null,
		this.data = {
			lastHeaderIndex: -1,
			prevIndex: -1,
			recLevel: 0,
			maxRecLevel: 0,
			indices: {
				// cellIndex[From]: cellIndex[To]: recLevel
			}
		};
		this.currentPrecedentsAreas = null;
		this.currentCalculatedPrecedentAreas = {
			// rangeName: {
			// inProgress: null,
			// isCalculated: null
			// }

		};
	}

	TraceDependentsManager.prototype.setPrecedentsCall = function () {
		this.isPrecedentsCall = true;
		this.isDependetsCall = false;
	};
	TraceDependentsManager.prototype.setDependentsCall = function () {
		this.isDependetsCall = true;
		this.isPrecedentsCall = false;
	};
	TraceDependentsManager.prototype.setPrecedentExternal = function (cellIndex) {
		if (!this.precedentsExternal) {
			this.precedentsExternal = new Set();
		}
		this.precedentsExternal.add(cellIndex);
	};
	TraceDependentsManager.prototype.checkPrecedentExternal = function (cellIndex) {
		if (!this.precedentsExternal) {
			return false;
		}
		return this.precedentsExternal.has(cellIndex);
	};
	TraceDependentsManager.prototype.checkCircularReference = function (cellIndex, isDependentCall) {
		if (this.dependents && this.dependents[cellIndex] && this.precedents && this.precedents[cellIndex]) {
			if (isDependentCall) {
				for (let i in this.dependents[cellIndex]) {
					if (this._getDependents(i, cellIndex) && this._getDependents(cellIndex, i)) {
						return true;
					}
				}
			} else {
				for (let i in this.precedents) {
					if (this._getPrecedents(i, cellIndex) && this._getPrecedents(cellIndex, i)) {
						return true;
					}
				}
			}
		}
	};
	TraceDependentsManager.prototype.clearLastDependent = function (row, col) {
		let ws = this.ws && this.ws.model;
		if (!ws || !this.dependents) {
			return;
		}
		if (Object.keys(this.dependents).length === 0) {
			return;
		}

		const t = this;
		if (row == null || col == null) {
			let selection = ws.getSelection();
			let activeCell = selection.activeCell;
			row = activeCell.row;
			col = activeCell.col;
		}

		const findMaxNesting = function (row, col) {
			let currentCellIndex = AscCommonExcel.getCellIndex(row, col);

			if (t.data.prevIndex !== -1 && t.data.indices[t.data.prevIndex] && t.data.indices[t.data.prevIndex][currentCellIndex]) {
				return;
			}
			if (t.dependents[currentCellIndex]) {
				if (checkCircularReference(currentCellIndex)) {
					return;
				}

				let interLevel, fork;
				if (Object.keys(t.dependents[currentCellIndex]).length > 1) {
					fork = true;
				}

				t.data.recLevel++;
				t.data.maxRecLevel = t.data.recLevel > t.data.maxRecLevel ? t.data.recLevel : t.data.maxRecLevel;
				interLevel = t.data.recLevel;
				for (let j in t.dependents[currentCellIndex]) {
					t.data.prevIndex = currentCellIndex;
					if (j.includes(";")) {
						// [fromCurrent][toExternal]
						if (!t.data.indices[currentCellIndex]) {
							t.data.indices[currentCellIndex] = {};
						}
						t.data.indices[currentCellIndex][j] = t.data.recLevel;
						continue;
					}
					let coords = AscCommonExcel.getFromCellIndex(j, true);
					findMaxNesting(coords.row, coords.col);
					t.data.recLevel = fork ? interLevel : t.data.recLevel;
				}
			} else {
				if (!t.data.indices[t.data.prevIndex]) {
					t.data.indices[t.data.prevIndex] = {};
				}
				t.data.indices[t.data.prevIndex][currentCellIndex] = t.data.recLevel;	// [from][to]
			}
		};
		const checkCircularReference = function (index) {
			for (let i in t.dependents[index]) {
				if (t._getDependents(index, i) && t._getDependents(i, index)) {
					let related = index + "|" + i;
					t.data.recLevel = Math.pow(10, 10);
					t.data.maxRecLevel = t.data.recLevel;
					t.data.indices[related] = t.data.recLevel;
					return true;
				}
			}
		};

		findMaxNesting(row, col);
		const maxLevel = this.data.maxRecLevel;
		if (maxLevel === 0) {
			this._setDefaultData();
			return;
		} else if (maxLevel === Math.pow(10, 10)) {
			// TODO improve check of cyclic references
			// temporary solution
			for (let i in this.data.indices) {
				if (this.data.indices[i] === maxLevel) {
					let val = i.split("|");
					this._deleteDependent(val[0], val[1]);
					this._deletePrecedent(val[0], val[1]);
					this._deleteDependent(val[1], val[0]);
					this._deletePrecedent(val[1], val[0]);
				}
			}
		}

		for (let index in this.data.indices) {
			for (let i in this.data.indices[index]) {
				if (this.data.indices[index][i] === maxLevel) {
					this._deletePrecedent(i, index);
					this._deleteDependent(index, i);
				}
			}
		}

		this._setDefaultData();
	};
	TraceDependentsManager.prototype.calculateDependents = function (row, col) {
		let ws = this.ws && this.ws.model;
		if (!ws) {
			return;
		}
		if (row == null || col == null) {
			let selection = ws.getSelection();
			let activeCell = selection.activeCell;
			row = activeCell.row;
			col = activeCell.col;
		}

		let depFormulas = ws.workbook.dependencyFormulas;
		if (depFormulas && depFormulas.sheetListeners) {
			if (!this.dependents) {
				this.dependents = {};
			}

			let sheetListeners = depFormulas.sheetListeners;
			let curListener = sheetListeners[ws.Id];
			let cellIndex = AscCommonExcel.getCellIndex(row, col);
			this._calculateDependents(cellIndex, curListener);
			this.setDependentsCall();
		}
	};
	TraceDependentsManager.prototype._calculateDependents = function (cellIndex, curListener) {
		let t = this;
		let ws = this.ws.model;
		let wb = this.ws.model.workbook;
		let dependencyFormulas = wb.dependencyFormulas;
		let allDefNamesListeners = dependencyFormulas.defNameListeners;
		let cellAddress = AscCommonExcel.getFromCellIndex(cellIndex, true);
		const currentCellInfo = {};

		const findCellListeners = function () {
			const listeners = {};
			if (curListener && curListener.areaMap) {
				for (let j in curListener.areaMap) {
					if (curListener.areaMap.hasOwnProperty(j)) {
						if (curListener.areaMap[j] && curListener.areaMap[j].bbox.contains(cellAddress.col, cellAddress.row)) {
							Object.assign(listeners, curListener.areaMap[j].listeners);
						}
					}
				}
			}
			if (curListener && curListener.cellMap && curListener.cellMap[cellIndex]) {
				if (Object.keys(curListener.cellMap[cellIndex]).length > 0) {
					Object.assign(listeners, curListener.cellMap[cellIndex].listeners);
				}
			}
			if (curListener && curListener.defName3d) {
				Object.assign(listeners, curListener.defName3d);
			}
			return listeners;
		};
		const checkIfHeader = function (tableHeader) {
			if (!tableHeader) {
				return false;
			}

			return tableHeader.col === cellAddress.col && tableHeader.row === cellAddress.row;
		};
		const getTableHeader = function (table) {
			if (!table.Ref) {
				return false;
			}

			return {col: table.Ref.c1, row: table.Ref.r1};
		};
		const setDefNameIndexes = function (defName, isTable) {
			let tableHeader = isTable ? getTableHeader(ws.getTableByName(defName)) : false;
			let isCurrentCellHeader = isTable ? checkIfHeader(tableHeader) : false;
			for (const i in allDefNamesListeners) {
				if (allDefNamesListeners.hasOwnProperty(i) && i.toLowerCase() === defName.toLowerCase()) {
					for (const listener in allDefNamesListeners[i].listeners) {
						// TODO возможно стоить добавить все слушатели сразу в curListener
						let elem = allDefNamesListeners[i].listeners[listener];
						let isArea = elem.ref ? !elem.ref.isOneCell() : false;
						let is3D = elem.ws.Id ? elem.ws.Id !== ws.Id : false;
						if (isArea && !is3D && !isCurrentCellHeader) {
							// decompose all elements into dependencies
							let areaIndexes = getAllAreaIndexes(elem);
							if (areaIndexes) {
								for (let index of areaIndexes) {
									t._setDependents(cellIndex, index);
									t._setPrecedents(index, cellIndex);
								}
								continue;
							}
						}
						let parentCellIndex = getParentIndex(elem.parent);
						if (!parentCellIndex) {
							continue;
						}

						if (isTable) {
							// check Headers
							// if current header and listener is header, make trace only with header
							// check if current cell header or not
							if (elem.Formula.includes("Headers")) {
								if (isCurrentCellHeader) {
									t._setDependents(cellIndex, parentCellIndex);
									t._setPrecedents(parentCellIndex, cellIndex);
								} else {
									continue;
								}
								// continue;
							} else if (!elem.Formula.includes("Headers") && isCurrentCellHeader) {
								continue;
							}
							// ?additional check if the listener is in the same table, need to check if it is a listener of the main cell
							if (elem.outStack) {
								let arr = [];
								// check each element of the stack for an occurrence in the original cell
								for (let table in elem.outStack) {
									if (elem.outStack[table].type !== cElementType.table) {
										continue;
									}

									let bbox = elem.outStack[table].area.bbox ? elem.outStack[table].area.bbox : (elem.outStack[table].area.range.bbox ? elem.outStack[table].area.range.bbox : null);

									if (bbox) {
										arr.push(bbox.contains2(cellAddress));
									}
								}
								if (!arr.includes(true)) {
									continue;
								}
							}

							// shared checks
							if (elem.shared !== null && !is3D) {
								let currentCellRange = ws.getCell3(cellAddress.row, cellAddress.col);
								setSharedTableIntersection(ws.getTableByName(defName).getRangeWithoutHeaderFooter(), currentCellRange, elem.shared);
								continue;
							}
							t._setDependents(cellIndex, parentCellIndex);
							t._setPrecedents(parentCellIndex, cellIndex);
							continue;
						} else {
							t._setDependents(cellIndex, parentCellIndex);
							t._setPrecedents(parentCellIndex, cellIndex);
						}
					}
				}
			}
		};
		const getAllAreaIndexes = function (parserFormula) {
			const indexes = [], range = parserFormula.ref;
			if (!range) {
				return;
			}
			for (let i = range.c1; i <= range.c2; i++) {
				for (let j = range.r1; j <= range.r2; j++) {
					let index = AscCommonExcel.getCellIndex(j, i);
					indexes.push(index);
				}
			}

			return indexes;
		};
		const getParentIndex = function (_parent) {
			let _parentCellIndex = AscCommonExcel.getCellIndex(_parent.nRow, _parent.nCol);
			//parent -> cell/defname
			if (_parent.parsedRef/*parent instanceof AscCommonExcel.DefName*/) {
				_parentCellIndex = null;
			} else if (_parent.ws !== t.ws.model) {
				_parentCellIndex += ";" + _parent.ws.index;
			}
			return _parentCellIndex;
		};
		const setSharedIntersection = function (currentRange, shared) {
			// get the cell is contained in one of the areaMap
			// if contain, call getSharedIntersect with currentRange whom contain cell and sharedRange
			if (curListener && curListener.areaMap) {
				for (let j in curListener.areaMap) {
					if (curListener.areaMap.hasOwnProperty(j)) {
						if (curListener.areaMap[j] && curListener.areaMap[j].bbox.contains(cellAddress.col, cellAddress.row)) {
							let res = curListener.areaMap[j].bbox.getSharedIntersect(shared.ref, currentRange.bbox);
							// draw dependents to coords from res
							if (res && (res.r1 === res.r2 && res.c1 === res.c2)) {
								let index = AscCommonExcel.getCellIndex(res.r1, res.c1);
								t._setDependents(cellIndex, index);
								t._setPrecedents(index, cellIndex);
							}
						}
					}
				}
			}
		};
		const setSharedTableIntersection = function (currentRange, currentCellRange, shared) {
			// row mode || col mode
			let isRowMode = currentRange.r1 === currentRange.r2,
				isColumnMode = currentRange.c1 === currentRange.c2, res, tempRange;

			if (isColumnMode && currentRange.r2 > shared.ref.r2) {
				if (!shared.ref.containsRow(currentCellRange.bbox.r2)) {
					return
				}
				if (currentCellRange.r2 > shared.ref.r2) {
					return;
				}
				// do check with rest of the currentRange
				tempRange = new asc_Range(currentRange.c1, currentRange.r1, currentRange.c2, shared.ref.r2);
			} else if (isRowMode && currentRange.c2 > shared.ref.c2) {
				// contains
				if (!shared.ref.containsCol(currentCellRange.bbox.c2)) {
					return
				}
				if (currentCellRange.c2 > shared.ref.c2) {
					return;
				}
				tempRange = new asc_Range(currentRange.c1, currentRange.r1, shared.ref.c2, currentRange.r2);
			}

			if (tempRange) {
				res = tempRange.getSharedIntersect(shared.ref, currentCellRange.bbox);
			}

			res = !res ? currentRange.getSharedIntersect(shared.ref, currentCellRange.bbox) : res;

			if (res && (res.r1 === res.r2 && res.c1 === res.c2)) {
				let index = AscCommonExcel.getCellIndex(res.r1, res.c1);
				t._setDependents(cellIndex, index);
				t._setPrecedents(index, cellIndex);
			} else {
				// split shared range on two parts
				let split = currentRange.difference(shared.ref);

				if (split.length > 1) {
					// first part
					res = currentRange.getSharedIntersect(split[0], currentCellRange.bbox);
					if (res && (res.r1 === res.r2 && res.c1 === res.c2)) {
						let index = AscCommonExcel.getCellIndex(res.r1, res.c1);
						t._setDependents(cellIndex, index);
						t._setPrecedents(index, cellIndex);
					}

					// second part
					if (split[1]) {
						let range = split[1], indexes = [];
						for (let col = range.c1; col <= range.c2; col++) {
							for (let row = range.r1; row <= range.r2; row++) {
								let index = AscCommonExcel.getCellIndex(row, col);
								indexes.push(index);
							}
						}
						if (indexes.length > 0) {
							for (let index of indexes) {
								t._setDependents(cellIndex, index);
								t._setPrecedents(index, cellIndex);
							}
						}
					}
				}
			}
		};

		const cellListeners = findCellListeners();
		if (cellListeners && Object.keys(cellListeners).length > 0) {
			if (!this.dependents) {
				this.dependents = {};
			}
			if (!this.dependents[cellIndex]) {
				// if dependents by cellIndex didn't exist, create it
				this.dependents[cellIndex] = {};
				for (let i in cellListeners) {
					if (cellListeners.hasOwnProperty(i)) {
						let parent = cellListeners[i].parent;
						let parentWsId = parent.ws ? parent.ws.Id : null;
						let isTable = parent.parsedRef ? parent.parsedRef.isTable : false;
						let isDefName = parent.name ? true : false;
						let formula = cellListeners[i].Formula;
						let is3D = false;
						const parentInfo = {
							parent,
							parentWsId,
							isTable,
							isDefName
						};

						if (isDefName) {
							// TODO check external table ref
							setDefNameIndexes(parent.name, isTable);
							continue;
						} else if (cellListeners[i].is3D) {
							is3D = true;
						}

						if (cellListeners[i].shared !== null && !is3D) {
							// can be shared ref in otheer sheet
							let shared = cellListeners[i].getShared();
							let currentCellRange = ws.getCell3(cellAddress.row, cellAddress.col);
							setSharedIntersection(currentCellRange, shared);
							continue;
						}

						if (formula.includes(":") && !is3D) {
							// call splitAreaListeners which return cellIndexes of each element(this will be parentCellIndex)
							// go through the values and set dependents for each
							let areaIndexes = getAllAreaIndexes(cellListeners[i]);
							if (areaIndexes) {
								for (let index of areaIndexes) {
									this._setDependents(cellIndex, index);
									this._setPrecedents(index, cellIndex);
								}
								continue;
							}
						}
						let parentCellIndex = getParentIndex(parent);

						if (parentCellIndex === null) {
							continue;
						}
						this._setDependents(cellIndex, parentCellIndex);
						this._setPrecedents(parentCellIndex, cellIndex, true);
					}
				}
				if (Object.keys(this.dependents[cellIndex]).length === 0) {
					delete this.dependents[cellIndex];
				}
			} else {
				if (this.checkCircularReference(cellIndex, true)) {
					return;
				}
				// if dependents by cellIndex aldready exist, check current tree
				let currentIndex = Object.keys(this.dependents[cellIndex])[0];
				let isUpdated = false;
				for (let i in cellListeners) {
					if (cellListeners.hasOwnProperty(i)) {
						let parent = cellListeners[i].parent,
							elemCellIndex = cellListeners[i].shared !== null ? currentIndex : getParentIndex(parent),
							formula = cellListeners[i].Formula;

						if (parent.name) {
							continue;
						}

						if (formula.includes(":") && !cellListeners[i].is3D) {
							// call getAllAreaIndexes which return cellIndexes of each element(this will be parentCellIndex)
							let areaIndexes = getAllAreaIndexes(cellListeners[i]);
							if (areaIndexes) {
								// go through the values and set dependents for each
								for (let index of areaIndexes) {
									this._setDependents(cellIndex, index);
								}
								continue;
							}
						}

						// if the child cell does not yet have a dependency with listeners, create it
						if (!this._getDependents(cellIndex, elemCellIndex)) {
							this._setDependents(cellIndex, elemCellIndex);
							isUpdated = true;
						}
					}
				}

				if (!isUpdated) {
					for (let i in this.dependents[cellIndex]) {
						if (this.dependents[cellIndex].hasOwnProperty(i)) {
							this._calculateDependents(i, curListener);
						}
					}
				}
			}
		}
	};
	TraceDependentsManager.prototype._getDependents = function (from, to) {
		return this.dependents[from] && this.dependents[from][to];
	};
	TraceDependentsManager.prototype._setDependents = function (from, to) {
		if (!this.dependents) {
			this.dependents = {};
		}
		if (!this.dependents[from]) {
			this.dependents[from] = {};
		}
		this.dependents[from][to] = 1;
	};
	TraceDependentsManager.prototype._setDefaultData = function () {
		this.data = {
			recLevel: 0,
			maxRecLevel: 0,
			lastHeaderIndex: -1,
			prevIndex: -1,
			indices: {}
		};
	};
	TraceDependentsManager.prototype.clearLastPrecedent = function (row, col) {
		let ws = this.ws && this.ws.model;
		if (!ws || !this.precedents) {
			return;
		}
		if (Object.keys(this.precedents).length === 0) {
			return;
		}

		const t = this;

		if (row == null || col == null) {
			let selection = ws.getSelection();
			let activeCell = selection.activeCell;
			row = activeCell.row;
			col = activeCell.col;
		}

		const checkCircularReference = function (index) {
			for (let i in t.precedents[index]) {
				if (t._getPrecedents(index, i) && t._getPrecedents(i, index)) {
					let related = index + "|" + i;
					t.data.recLevel = Math.pow(10, 10);
					t.data.maxRecLevel = t.data.recLevel;
					t.data.indices[related] = t.data.recLevel;
					return true;
				}
			}
		};
		const checkIfHeader = function (cellIndex) {
			// TODO можно ускорить алгоритм поиска если при расчете precedents записывать в качестве значения ячейки массив с именами таблиц, заголовками которого является данная ячейка
			if (!t.precedentsAreas) {
				return;
			}
			for (let area in t.precedentsAreas) {
				if (t.precedentsAreas[area].areaHeader === cellIndex) {
					return true;
				}
			}
		};
		const getAllAreaIndexes = function (areas, currentCellIndex) {
			const indexes = [];
			if (!areas) {
				return;
			}
			for (const area in areas) {
				if (areas[area].areaHeader != currentCellIndex) {
					continue;
				}
				for (let i = areas[area].range.r1; i <= areas[area].range.r2; i++) {
					for (let j = areas[area].range.c1; j <= areas[area].range.c2; j++) {
						let index = AscCommonExcel.getCellIndex(i, j);
						indexes.push(index);
					}
				}
			}
			return indexes;
		};
		const findMaxNesting = function (row, col) {
			let currentCellIndex = AscCommonExcel.getCellIndex(row, col);
			if (t.data.indices[currentCellIndex] && t.data.indices[currentCellIndex][t.data.prevIndex]) {
				t.data.indices[currentCellIndex][t.data.prevIndex] = t.data.recLevel;
				return;
			}

			let ifHeader, interLevel, fork;
			if (t.data.recLevel > 0 && t.data.lastHeaderIndex !== currentCellIndex) {
				// check area header
				ifHeader = checkIfHeader(currentCellIndex);

				if (!t.precedents[currentCellIndex] && !ifHeader) {
					if (!t.data.indices[t.data.prevIndex]) {
						t.data.indices[t.data.prevIndex] = {};
					}
					t.data.indices[t.data.prevIndex][currentCellIndex] = t.data.recLevel;	// [from][to] format 
					return;
				}
			}

			if (ifHeader) {
				// go through area
				let areaIndexes = getAllAreaIndexes(t.precedentsAreas, currentCellIndex);

				if (areaIndexes.length > 0) {
					fork = true;
					interLevel = t.data.recLevel;
					for (let index of areaIndexes) {
						let cellAddress = AscCommonExcel.getFromCellIndex(index, true);
						if (index === currentCellIndex) {
							t.data.lastHeaderIndex = index;
						}
						if (!t.precedents[index] && index !== currentCellIndex) {
							continue;
						}
						findMaxNesting(cellAddress.row, cellAddress.col);
						t.data.recLevel = fork ? interLevel : t.data.recLevel;
					}
				}
			} else if (t.precedents[currentCellIndex]) {
				if (checkCircularReference(currentCellIndex)) {
					return;
				}
				if (Object.keys(t.precedents[currentCellIndex]).length > 1) {
					fork = true;
				}

				t.data.recLevel++;
				t.data.maxRecLevel = t.data.recLevel > t.data.maxRecLevel ? t.data.recLevel : t.data.maxRecLevel;
				interLevel = t.data.recLevel;
				for (let j in t.precedents[currentCellIndex]) {
					t.data.prevIndex = currentCellIndex;
					if (j.includes(";")) {
						// [fromCurrent][toExternal]
						if (!t.data.indices[currentCellIndex]) {
							t.data.indices[currentCellIndex] = {};
						}
						t.data.indices[currentCellIndex][j] = t.data.recLevel;
						continue;
					}
					let coords = AscCommonExcel.getFromCellIndex(j, true);
					findMaxNesting(coords.row, coords.col);
					t.data.recLevel = fork ? interLevel : t.data.recLevel;
				}
			} else {
				if (!t.data.indices[t.data.prevIndex]) {
					t.data.indices[t.data.prevIndex] = {};
				}
				// [from][to]
				t.data.indices[t.data.prevIndex][currentCellIndex] = t.data.recLevel;
			}
		};

		findMaxNesting(row, col);
		const maxLevel = this.data.maxRecLevel;
		if (maxLevel === 0) {
			this._setDefaultData();
			return;
		}
		// TODO improve check of cyclic references
		// temporary solution
		else if (maxLevel === Math.pow(10, 10)) {
			for (let i in this.data.indices) {
				if (this.data.indices[i] === maxLevel) {
					let val = i.split("|");
					this._deleteDependent(val[0], val[1]);
					this._deletePrecedent(val[0], val[1]);
					this._deleteDependent(val[1], val[0]);
					this._deletePrecedent(val[1], val[0]);
				}
			}
		}

		for (let index in this.data.indices) {
			for (let i in this.data.indices[index]) {
				if (this.data.indices[index][i] === maxLevel) {
					this._deletePrecedent(index, i);
					this._deleteDependent(i, index);
				}
			}
		}
		this.checkAreas();
		this._setDefaultData();
	};
	TraceDependentsManager.prototype.calculatePrecedents = function (row, col, isSecondCall, callFromArea) {
		if (arguments.length === 0) {
			this.currentCalculatedPrecedentAreas = {};
		}

		//depend from row/col cell
		let ws = this.ws && this.ws.model;
		if (!ws) {
			return;
		}
		const t = this;
		if (row == null || col == null) {
			let selection = ws.getSelection();
			let activeCell = selection.activeCell;
			row = activeCell.row;
			col = activeCell.col;
		}

		const cellIndex = AscCommonExcel.getCellIndex(row, col);
		const getAllAreaIndexesWithFormula = function (areas, areaName) {
			const indexes = [];
			if (!areas) {
				return;
			}

			let area = areas[areaName];
			// if (area.isCalculated) {
			// 	return indexes;
			// }

			for (let i = area.range.r1; i <= area.range.r2; i++) {
				for (let j = area.range.c1; j <= area.range.c2; j++) {
					// ??? check parserFormula and return indexes only with it
					if (!ws.getCell3(i, j).isFormula()) {
						continue;
					}
					let index = AscCommonExcel.getCellIndex(i, j);
					indexes.push(index);
				}
			}

			area.isCalculated = true;
			return indexes;
		};
		const isCellAreaHeader = function (cellIndex) {
			if (!t.currentPrecedentsAreas || !t.precedentsAreasHeaders) {
				return;
			}
			if (t.precedentsAreasHeaders[cellIndex]) {
				return true;
			}
		};

		let formulaParsed;
		ws.getCell3(row, col)._foreachNoEmpty(function (cell) {
			formulaParsed = cell.formulaParsed;
		});

		// TODO another way to check table
		let isAreaHeader = callFromArea ? false : isCellAreaHeader(cellIndex);
		if (this.currentPrecedentsAreas && isSecondCall && isAreaHeader) {
			// calculate all precedents in areas
			let areaName = this.precedentsAreasHeaders[cellIndex];
			let areaIndexes = getAllAreaIndexesWithFormula(this.currentPrecedentsAreas, areaName);

			if (!this.currentCalculatedPrecedentAreas[areaName]) {
				this.currentCalculatedPrecedentAreas[areaName] = {};
				// go through the values and check precedents for each
				for (let index of areaIndexes) {
					let cellAddress = AscCommonExcel.getFromCellIndex(index, true);
					// if (!ws.getCell3(cellAddress.row, cellAddress.col).isFormula()) {
					// 	continue;
					// }
					this.calculatePrecedents(cellAddress.row, cellAddress.col, null, true);
				}
			}
		} else if (formulaParsed) {
			this._calculatePrecedents(formulaParsed, row, col, isSecondCall);
			this.setPrecedentsCall();
		}
	};
	TraceDependentsManager.prototype._calculatePrecedents = function (formulaParsed, row, col, isSecondCall) {
		if (!this.precedents) {
			this.precedents = {};
		}
		let t = this;
		let currentCellIndex = AscCommonExcel.getCellIndex(row, col);
		let isHaveUnrecorded = this.isCellHaveUnrecordedTraces(currentCellIndex, formulaParsed);

		if (isHaveUnrecorded) {
			// if (!this.precedents[currentCellIndex]) {
			let shared, base;
			if (formulaParsed.shared !== null) {
				shared = formulaParsed.getShared();
				base = shared.base;		// base index - where shared formula start
			}

			if (formulaParsed.outStack) {
				let currentWsIndex = formulaParsed.ws.index;
				let ref = formulaParsed.ref;
				// iterate and find all reference
				for (const elem of formulaParsed.outStack) {
					let elemType = elem.type ? elem.type : null;

					let is3D = elemType === cElementType.cell3D || elemType === cElementType.cellsRange3D || elemType === cElementType.name3D,
						isArea = elemType === cElementType.cellsRange || elemType === cElementType.name,
						isDefName = elemType === cElementType.name || elemType === cElementType.name3D,
						isTable = elemType === cElementType.table, areaName;

					if (elemType === cElementType.cell || isArea || is3D || isTable) {

						let cellRange = new asc_Range(col, row, col, row), elemRange, elemCellIndex;

						if (isDefName) {
							let elemDefName = elem.getDefName();
							let elemValue = elem.getValue();
							let defNameParentWsIndex = elemDefName.parsedRef.outStack[0].wsFrom ? elemDefName.parsedRef.outStack[0].wsFrom.index : (elemDefName.parsedRef.outStack[0].ws ? elemDefName.parsedRef.outStack[0].ws.index : null);
							elemRange = elemValue.range.bbox ? elemValue.range.bbox : elemValue.bbox;

							if (defNameParentWsIndex && defNameParentWsIndex !== currentWsIndex) {
								// 3D
								is3D = true;
								isArea = false;
							} else if (elemRange.isOneCell()) {
								isArea = false;
							}
						} else if (isTable) {
							let currentWsId = elem.ws.Id,
								elemWsId = elem.area.ws ? elem.area.ws.Id : elem.area.wsFrom.Id;
							// elem.area can be cRef and cArea
							is3D = currentWsId !== elemWsId;
							elemRange = elem.area.bbox ? elem.area.bbox : (elem.area.range ? elem.area.range.bbox : null);
							isArea = ref ? true : !elemRange.isOneCell();

						} else {
							elemRange = elem.range.bbox ? elem.range.bbox : elem.bbox;
						}

						if (!elemRange) {
							return;
						}

						if (shared) {
							if (isTable) {
								let isRowMode = shared.ref.r1 === shared.ref.r2,
									isColumnMode = shared.ref.c1 === shared.ref.c2,
									diff = [];

								if ((isRowMode && (cellRange.c2 > elemRange.c2)) || (isColumnMode && (cellRange.r2 > elemRange.r2))) {
									// regular link to main table
									elemCellIndex = AscCommonExcel.getCellIndex(elemRange.r1, elemRange.c1);
								} else {
									diff = elemRange.difference(shared.ref);
									if (diff.length > 0) {
										let res = diff[0].getSharedIntersect(elemRange, cellRange);
										if (res && (res.r1 === res.r2 && res.c1 === res.c2)) {
											elemCellIndex = AscCommonExcel.getCellIndex(res.r1, res.c1);
										} else {
											elemCellIndex = AscCommonExcel.getCellIndex(elemRange.r1 + (row - base.nRow), elemRange.c1 + (col - base.nCol));
										}
									}
								}
							} else {
								elemCellIndex = AscCommonExcel.getCellIndex(elemRange.r1 + (row - base.nRow), elemRange.c1 + (col - base.nCol));
							}
						} else {
							elemCellIndex = AscCommonExcel.getCellIndex(elemRange.r1, elemRange.c1);
						}

						// cross check for cell
						if (isArea && !ref && !is3D) {
							if (elemRange.getWidth() > 1 && elemRange.getHeight() <= 1) {
								// check cols
								if (elemRange.containsCol(col)) {
									elemCellIndex = AscCommonExcel.getCellIndex(elemRange.r1, col);
									isArea = false;
								}
							} else if (elemRange.getWidth() <= 1 && elemRange.getHeight() > 1) {
								// check rows
								if (elemRange.containsRow(row)) {
									elemCellIndex = AscCommonExcel.getCellIndex(row, elemRange.c1);
									isArea = false;
								}
							} else {
								isArea = true;
							}
						}

						// if the area is on the same sheet - write to the array of areas for drawing
						if (isArea && !is3D) {
							let copyRange = elemRange.clone();
							if (shared && !isTable) {
								const offset = {
									row: row - base.nRow,
									col: col - base.nCol
								};
								// set offset according to base shift
								copyRange.setOffset(offset);
							}
							const areaRange = {};
							areaName = copyRange.getName();			// areaName - unique key for areaRange
							areaRange[areaName] = {};
							areaRange[areaName].range = copyRange;
							areaRange[areaName].isCalculated = null;
							areaRange[areaName].areaHeader = elemCellIndex;

							this._setPrecedentsAreas(areaRange);
						}

						if (is3D) {
							// TODO другой механизм отрисовки для внешних precedents
							elemCellIndex += ";" + (elem.wsTo ? elem.wsTo.index : elem.ws.index);
							this._setDependents(elemCellIndex, currentCellIndex);
							this._setPrecedents(currentCellIndex, elemCellIndex);
							this.setPrecedentExternal(currentCellIndex);
						} else {
							this._setPrecedents(currentCellIndex, elemCellIndex, false, false);
							this._setDependents(elemCellIndex, currentCellIndex);
							if (areaName) {
								this._setPrecedentsAreaHeader(elemCellIndex, areaName);
							}
						}
					}
				}
			}
		} else {
			if (this.checkCircularReference(currentCellIndex, false)) {
				return;
			}
			this.currentPrecedents = Object.assign({}, this.precedents);
			this.currentPrecedentsAreas = Object.assign({}, this._getPrecedentsAreas());
			this.setPrecedentsLoop(true);
			// check first level, then if function return false, check second, third and so on
			for (let i in this.currentPrecedents[currentCellIndex]) {
				let coords = AscCommonExcel.getFromCellIndex(i, true);
				this.calculatePrecedents(coords.row, coords.col, true);
			}

			this.setPrecedentsLoop(false);
		}
	};
	TraceDependentsManager.prototype.isCellHaveUnrecordedTraces = function (cellIndex, formulaParsed) {
		if (formulaParsed && formulaParsed.outStack) {
			let currentWsIndex = formulaParsed.ws.index,
				ref = formulaParsed.ref,
				coords = AscCommonExcel.getFromCellIndex(cellIndex, true),
				row = coords.row, col = coords.col, shared, base;

			if (formulaParsed.shared !== null) {
				shared = formulaParsed.getShared();
				base = shared.base;
			}

			for (const elem of formulaParsed.outStack) {
				let elemType = elem.type ? elem.type : null;

				let is3D = elemType === cElementType.cell3D || elemType === cElementType.cellsRange3D || elemType === cElementType.name3D,
					isArea = elemType === cElementType.cellsRange || elemType === cElementType.name,
					isDefName = elemType === cElementType.name || elemType === cElementType.name3D,
					isTable = elemType === cElementType.table;

				if (elemType === cElementType.cell || isArea || is3D || isTable) {
					let elemRange, elemCellIndex;

					if (isDefName) {
						let elemDefName = elem.getDefName(),
							elemValue = elem.getValue(),
							defNameParentWsIndex = elemDefName.parsedRef.outStack[0].wsFrom ? elemDefName.parsedRef.outStack[0].wsFrom.index : (elemDefName.parsedRef.outStack[0].ws ? elemDefName.parsedRef.outStack[0].ws.index : null);

						elemRange = elemValue.range.bbox ? elemValue.range.bbox : elemValue.bbox;

						if (defNameParentWsIndex && defNameParentWsIndex !== currentWsIndex) {
							is3D = true;
							isArea = false;
						} else if (elemRange.isOneCell()) {
							isArea = false;
						}
					} else if (isTable) {
						let currentWsId = elem.ws.Id,
							elemWsId = elem.area.ws ? elem.area.ws.Id : elem.area.wsFrom.Id;
						is3D = currentWsId !== elemWsId;
						elemRange = elem.area.bbox ? elem.area.bbox : (elem.area.range ? elem.area.range.bbox : null);
					} else {
						elemRange = elem.range.bbox ? elem.range.bbox : elem.bbox;
					}

					if (!elemRange) {
						return;
					}

					if (shared) {
						elemCellIndex = AscCommonExcel.getCellIndex(elemRange.r1 + (row - base.nRow), elemRange.c1 + (col - base.nCol));
					} else {
						elemCellIndex = AscCommonExcel.getCellIndex(elemRange.r1, elemRange.c1);
					}

					// cross check for cell
					if (isArea && !ref && !is3D) {
						if (elemRange.getWidth() > 1 && elemRange.getHeight() <= 1) {
							// check cols
							if (elemRange.containsCol(col)) {
								elemCellIndex = AscCommonExcel.getCellIndex(elemRange.r1, col);
								isArea = false;
							}
						} else if (elemRange.getWidth() <= 1 && elemRange.getHeight() > 1) {
							// check rows
							if (elemRange.containsRow(row)) {
								elemCellIndex = AscCommonExcel.getCellIndex(row, elemRange.c1);
								isArea = false;
							}
						} else {
							isArea = true;
						}
					}

					if (is3D) {
						elemCellIndex += ";" + (elem.wsTo ? elem.wsTo.index : elem.ws.index);

					}
					if (!this._getPrecedents(cellIndex, elemCellIndex)) {
						return true;
					}
				}
			}
		}
	};
	TraceDependentsManager.prototype.setPrecedentsLoop = function (inLoop) {
		this.inLoop = inLoop;
	};
	TraceDependentsManager.prototype.getPrecedentsLoop = function () {
		return this.inLoop;
	};
	TraceDependentsManager.prototype._getPrecedents = function (from, to) {
		return this.precedents[from] && this.precedents[from][to];
	};
	TraceDependentsManager.prototype._deleteDependent = function (from, to) {
		if (this.dependents[from] && this.dependents[from][to]) {
			delete this.dependents[from][to];
			if (Object.keys(this.dependents[from]).length === 0) {
				delete this.dependents[from];
			}
		}
	};
	TraceDependentsManager.prototype._deletePrecedentFromArea = function (index) {
		if (this.dependents[index] && this.precedents) {
			for (let precedentIndex in this.precedents) {
				for (let i in this.precedents[precedentIndex]) {
					if (i == index) {
						this._deleteDependent(index, precedentIndex);
						this._deletePrecedent(precedentIndex, index);
					}
				}
			}
		}
	};
	TraceDependentsManager.prototype._deletePrecedent = function (from, to) {
		if (this.precedents[from] && this.precedents[from][to]) {
			delete this.precedents[from][to];
			if (Object.keys(this.precedents[from]).length === 0) {
				delete this.precedents[from];
			}
		}
	};
	TraceDependentsManager.prototype._setPrecedents = function (from, to, isDependent, areaName) {
		if (!this.precedents) {
			this.precedents = {};
		}
		if (!this.precedents[from]) {
			this.precedents[from] = {};
		}
		// TODO calculated: 1, not_calculated: 2
		// TODO isAreaHeader: "A3:B4"
		// this.precedents[from][to] = isDependent ? 2 : 1;
		this.precedents[from][to] = areaName ? areaName : 1;
	};
	TraceDependentsManager.prototype._setPrecedentsAreaHeader = function (headerCellIndex, areaName) {
		if (!this.precedentsAreasHeaders) {
			this.precedentsAreasHeaders = {};
		}
		this.precedentsAreasHeaders[headerCellIndex] = areaName;
	};
	TraceDependentsManager.prototype._setPrecedentsAreas = function (area) {
		if (!this.precedentsAreas) {
			this.precedentsAreas = {};
		}
		Object.assign(this.precedentsAreas, area);
	};
	TraceDependentsManager.prototype._getPrecedentsAreas = function () {
		return this.precedentsAreas;
	};
	TraceDependentsManager.prototype.isHaveData = function () {
		return this.isHaveDependents() || this.isHavePrecedents();
	};
	TraceDependentsManager.prototype.isHaveDependents = function () {
		return !!this.dependents;
	};
	TraceDependentsManager.prototype.isHavePrecedents = function () {
		return !!this.precedents;
	};
	TraceDependentsManager.prototype.forEachDependents = function (callback) {
		for (let i in this.dependents) {
			callback(i, this.dependents[i], this.isPrecedentsCall);
		}
	};
	TraceDependentsManager.prototype.forEachExternalPrecedent = function (callback) {
		for (let i in this.precedents) {
			callback(i);
		}
	};
	TraceDependentsManager.prototype.clear = function (type) {
		if (Asc.c_oAscRemoveArrowsType.all === type) {
			this.clearAll();
		}
		if (Asc.c_oAscRemoveArrowsType.dependent === type) {
			this.clearLastDependent();
		}
		if (Asc.c_oAscRemoveArrowsType.precedent === type) {
			this.clearLastPrecedent();
		}
	};
	TraceDependentsManager.prototype.clearAll = function () {
		this.precedents = null;
		this.precedentsExternal = null;
		this.currentPrecedents = null;
		this.dependents = null;
		this.isDependetsCall = null;
		this.inLoop = null;
		this.isPrecedentsCall = null;
		this.precedentsAreas = null;
		this.currentPrecedentsAreas = null;
		this.currentCalculatedPrecedentAreas = null;
		this.precedentsAreasHeaders = null,
		this._setDefaultData();
	};
	TraceDependentsManager.prototype.clearCellTraces = function (row, col) {
		let ws = this.ws && this.ws.model;
		if (!ws || row == null || col == null || !this.precedents || !this.dependents) {
			return;
		}

		let cellIndex = AscCommonExcel.getCellIndex(row, col);
		if (this.precedents[cellIndex]) {
			for (let i in this.precedents[cellIndex]) {
				this._deleteDependent(i, cellIndex);
			}
			delete this.precedents[cellIndex];
		}

		// check the ranges for existence of dependencies on it
		this.checkAreas();
	};
	TraceDependentsManager.prototype.checkAreas = function () {
		if (!this.precedentsAreas) {
			return
		}
		for (let i in this.precedentsAreas) {
			let areaHeader = this.precedentsAreas[i].areaHeader;
			if (!this.dependents[areaHeader]) {
				delete this.precedentsAreas[i];
			}
		}
	};


	//------------------------------------------------------------export---------------------------------------------------
	window['AscCommonExcel'] = window['AscCommonExcel'] || {};

	window["AscCommonExcel"].TraceDependentsManager = TraceDependentsManager;


})(window);
