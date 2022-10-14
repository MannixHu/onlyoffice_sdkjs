/*
 * (c) Copyright Ascensio System SIA 2010-2022
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
 * You can contact Ascensio System SIA at 20A-12 Ernesta Birznieka-Upisha
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

(function(window)
{
	// TODO: Сейчас массив Forms содержит все формы, те что используются и те, что нет, из-за того что
	//       нет нормальной событийной системы, о том, что содержимое документа изменилось. Как только добавим такую
	//       систему, то данный класс на неё подпишется и будет обновлять массив Forms с проверкой IsUseInDocument, и
	//       на функции GetForms мы будем отдавать его сразу, а не формировать каждый раз новый массив с проверками
	//       IsUseInDocument. Это ускорит ситуации, где многократно вызываеется GetForms без изменения струкутуры
	//       документа.



	/**
	 * Класс для работы со всеми специальными формами внунтри документа
	 * @param {AscWord.CDocument} oLogicDocument
	 * @constructor
	 */
	function CFormsManager(oLogicDocument)
	{
		this.LogicDocument = oLogicDocument;

		// В мапе форм находятся вообще все формы. В списке находятся только самостоятельные формы, которые
		// не являются частью другой формы
		this.FormsMap     = {};
		this.Forms        = [];
		this.UpdateList   = false;
		this.KeyGenerator = new AscWord.CFormKeyGenerator(this);
	}
	CFormsManager.prototype.Register = function(oForm)
	{
		if (!oForm)
			return;

		let sId = oForm.GetId();

		if (oForm.IsForm())
			this.FormsMap[sId] = oForm;
		else
			delete this.FormsMap[sId];

		this.UpdateList = true;
	};
	CFormsManager.prototype.Unregister = function(oForm)
	{
		if (!oForm)
			return;

		delete this.FormsMap[oForm.GetId()];

		this.UpdateList = true;
	};
	/**
	 * @returns {[]}
	 */
	CFormsManager.prototype.GetAllForms = function()
	{
		this.CheckFormsList();

		let arrResult = [];
		for (let nIndex = 0, nCount = this.Forms.length; nIndex < nCount; ++nIndex)
		{
			let oForm = this.Forms[nIndex];
			if (oForm.IsUseInDocument())
				arrResult.push(oForm);
		}

		return arrResult;
	};
	/**
	 * Получаем ключи форм по заданным параметрам
	 * @param oPr
	 * @returns {Array.string}
	 */
	CFormsManager.prototype.GetAllKeys = function(oPr)
	{
		let isText       = oPr && oPr.Text;
		let isComboBox   = oPr && oPr.ComboBox;
		let isDropDown   = oPr && oPr.DropDownList;
		let isCheckBox   = oPr && oPr.CheckBox;
		let isPicture    = oPr && oPr.Picture;
		let isRadioGroup = oPr && oPr.RadioGroup;
		let isComplex    = oPr && oPr.Complex;

		let arrKeys  = [];
		let arrForms = this.GetAllForms();
		for (let nIndex = 0, nCount = arrForms.length; nIndex < nCount; ++nIndex)
		{
			let oForm = arrForms[nIndex];

			let sKey = null;

			let isComplexForm = oForm.IsComplexForm();
			if (isComplexForm && !isComplex)
				continue;

			if ((isComplex && isComplexForm)
				|| (isText && oForm.IsTextForm())
				|| (isComboBox && oForm.IsComboBox())
				|| (isDropDown && oForm.IsDropDownList())
				|| (isCheckBox && oForm.IsCheckBox() && !oForm.IsRadioButton())
				|| (isPicture && oForm.IsPicture()))
			{
				sKey = oForm.GetFormKey();
			}
			else if (isRadioGroup && oForm.IsRadioButton())
			{
				sKey = oForm.GetRadioButtonGroupKey();
			}

			if (sKey && -1 === arrKeys.indexOf(sKey))
				arrKeys.push(sKey);
		}

		return arrKeys;
	};
	/**
	 * Получаем массив всех специальных форм с заданным ключом
	 * @param sKey
	 * @returns {[]}
	 */
	CFormsManager.prototype.GetAllFormsByKey = function(sKey)
	{
		let arrForms  = this.GetAllForms();
		let arrResult = [];
		for (let nIndex = 0, nCount = arrForms.length; nIndex < nCount; ++nIndex)
		{
			let oForm = arrForms[nIndex];
			if (sKey === oForm.GetFormKey())
				arrResult.push(oForm);
		}

		return arrResult;
	};
	/**
	 * Получаем массив всех специальных радио кнопок
	 * @param sGroupKey
	 * @returns {[]}
	 */
	CFormsManager.prototype.GetRadioButtons = function(sGroupKey)
	{
		let arrForms  = this.GetAllForms();
		let arrResult = [];
		for (let nIndex = 0, nCount = arrForms.length; nIndex < nCount; ++nIndex)
		{
			let oForm = arrForms[nIndex];
			if (oForm.IsRadioButton() && sGroupKey === oForm.GetCheckBoxPr().GetGroupKey())
				arrResult.push(oForm);
		}

		return arrResult;
	};
	/**
	 * Все ли обязательные поля заполнены
	 * @returns {boolean}
	 */
	CFormsManager.prototype.IsAllRequiredFormsFilled = function()
	{
		// TODO: Сейчас у нас здесь идет проверка и на правильность заполнения форм с форматом
		// Возможно стоит разделить на 2 разные проверки и добавить одну общую проверку на правильность
		// заполненности формы, куда будут входить обе предыдущие проверки

		let arrForms = this.GetAllForms();
		for (let nIndex = 0, nCount = arrForms.length; nIndex < nCount; ++nIndex)
		{
			let oForm = arrForms[nIndex];
			if (oForm.IsFormRequired() && !oForm.IsFormFilled())
				return false;

			if (oForm.IsTextForm()
				&& !oForm.IsPlaceHolder()
				&& !oForm.GetTextFormPr().CheckFormat(oForm.GetInnerText(), true))
				return false;
		}
		return true;
	};
	/**
	 * Проверяем залоченность форм по заданному ключу
	 * @param nCheckType
	 * @param sKey
	 * @param oSkipParagraph
	 */
	CFormsManager.prototype.CheckLockByKey = function(nCheckType, sKey, oSkipParagraph)
	{
		let arrForms = this.GetAllForms();
		for (let nIndex = 0, nCount = arrForms.length; nIndex < nCount; ++nIndex)
		{
			let oForm      = arrForms[nIndex];
			let oParagraph = oForm.GetParagraph ? oForm.GetParagraph() : null;
			if (oParagraph
				&& oParagraph !== oSkipParagraph
				&& oForm.GetFormKey() === sKey)
			{
				if (oForm.IsPicture())
				{
					let arrDrawings = oForm.GetAllDrawingObjects();
					for (var nDrawingIndex = 0, nDrawingsCount = arrDrawings.length; nDrawingIndex < nDrawingsCount; ++nDrawingIndex)
					{
						let oDrawing = arrDrawings[nDrawingIndex];
						oDrawing.Lock.Check(oDrawing.GetId());
					}
				}
				else
				{
					oParagraph.Lock.Check(oParagraph.GetId());
				}
			}
		}
	};
	/**
	 * Изменяем другие формы, из-за изменения заданной формы
	 * @param oForm
	 */
	CFormsManager.prototype.OnChange = function(oForm)
	{
		if (!oForm || !oForm.IsUseInDocument())
			return;

		if (oForm.IsComplexForm())
			this.OnChangeComplexForm(oForm);
		else if (oForm.IsCheckBox())
			this.OnChangeCheckBox(oForm);
		else if (oForm.IsPicture())
			this.OnChangePictureForm(oForm);
		else
			this.OnChangeTextForm(oForm);
	};
	/**
	 * Проверяем корректность изменения формы
	 * @param oForm
	 */
	CFormsManager.prototype.ValidateChangeOnFly = function(oForm)
	{
		if (!oForm.IsPlaceHolder() && !oForm.IsComplexForm() && oForm.IsTextForm())
		{
			let oTextFormPr = oForm.GetTextFormPr();
			if (!oTextFormPr.CheckFormatOnFly(oForm.GetInnerText()))
				return false;
		}

		return true;
	};
	/**
	 * @returns {AscWord.CFormKeyGenerator}
	 */
	CFormsManager.prototype.GetKeyGenerator = function()
	{
		return this.KeyGenerator;
	};
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Private area
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	CFormsManager.prototype.CheckFormsList = function()
	{
		if (!this.UpdateList)
			return;

		this.Forms.length = 0;
		for (let sId in this.FormsMap)
		{
			let oForm = this.FormsMap[sId];
			if (oForm.IsForm() && oForm === oForm.GetMainForm())
				this.Forms.push(oForm);
		}

		this.UpdateList = false;
	};
	CFormsManager.prototype.OnChangeCheckBox = function(oForm)
	{
		let isChecked = oForm.GetCheckBoxPr().Checked;
		let arrForms  = this.GetAllForms();

		if (oForm.IsRadioButton())
		{
			let sKey = oForm.GetCheckBoxPr().GetGroupKey();
			for (let nIndex = 0, nCount = arrForms.length; nIndex < nCount; ++nIndex)
			{
				let oTempForm = arrForms[nIndex];
				if (oTempForm.IsComplexForm()
					|| oTempForm === oForm
					|| !oTempForm.IsRadioButton()
					|| sKey !== oTempForm.GetCheckBoxPr().GetGroupKey())
					continue;

				if (oTempForm.GetCheckBoxPr().GetChecked())
					oTempForm.SetCheckBoxChecked(false);
			}
		}
		else
		{
			let sKey = oForm.GetFormKey();
			for (let nIndex = 0, nCount = arrForms.length; nIndex < nCount; ++nIndex)
			{
				let oTempForm = arrForms[nIndex];
				if (oTempForm.IsComplexForm()
					|| oTempForm === oForm
					|| !oTempForm.IsCheckBox()
					|| oTempForm.IsRadioButton()
					|| sKey !== oTempForm.GetFormKey()
					|| isChecked === oTempForm.GetCheckBoxPr().GetChecked())
					continue;

				oTempForm.ToggleCheckBox();
			}
		}
	};
	CFormsManager.prototype.OnChangePictureForm = function(oForm)
	{
		let sImageUrl;
		let arrDrawings = oForm.GetAllDrawingObjects();
		if (arrDrawings.length)
			sImageUrl = arrDrawings[0].GetPictureUrl();

		if (!sImageUrl)
			return;

		let sKey          = oForm.GetFormKey();
		let isPlaceHolder = oForm.IsPlaceHolder();
		let arrForms      = this.GetAllForms();
		for (let nIndex = 0, nCount = arrForms.length; nIndex < nCount; ++nIndex)
		{
			let oTempForm = arrForms[nIndex];
			if (oTempForm.IsComplexForm()
				|| oTempForm === oForm
				|| sKey !== oTempForm.GetFormKey()
				|| !oTempForm.IsPicture())
				continue;

			let arrDrawings = oTempForm.GetAllDrawingObjects();
			if (arrDrawings.length > 0)
			{
				let oPicture = arrDrawings[0].GetPicture();
				if (oPicture)
					oPicture.setBlipFill(AscFormat.CreateBlipFillRasterImageId(sImageUrl));
			}
			oTempForm.SetShowingPlcHdr(isPlaceHolder);
			oTempForm.UpdatePictureFormLayout();
		}
	};
	CFormsManager.prototype.OnChangeTextForm = function(oForm)
	{
		let sKey          = oForm.GetFormKey();
		let isPlaceHolder = oForm.IsPlaceHolder();
		let oSrcRun       = !isPlaceHolder ? oForm.MakeSingleRunElement(false) : null;
		let arrForms      = this.GetAllForms();
		for (let nIndex = 0, nCount = arrForms.length; nIndex < nCount; ++nIndex)
		{
			let oTempForm = arrForms[nIndex];

			if (oTempForm.IsComplexForm()
				|| oTempForm.IsPicture()
				|| oTempForm.IsCheckBox()
				|| oTempForm === oForm
				|| sKey !== oTempForm.GetFormKey())
				continue;

			if (isPlaceHolder)
			{
				if (!oTempForm.IsPlaceHolder())
					oTempForm.ReplaceContentWithPlaceHolder(false);
			}
			else
			{
				if (oTempForm.IsPlaceHolder())
					oTempForm.ReplacePlaceHolderWithContent();

				let oDstRun = oTempForm.MakeSingleRunElement(false);
				oDstRun.CopyTextFormContent(oSrcRun);
			}
		}
	};
	CFormsManager.prototype.OnChangeComplexForm = function(oForm)
	{
		let sKey     = oForm.GetFormKey();
		let arrForms = this.GetAllForms();
		for (let nIndex = 0, nCount = arrForms.length; nIndex < nCount; ++nIndex)
		{
			let oTempForm = arrForms[nIndex];
			if (!oTempForm.IsComplexForm()
				|| oTempForm === oForm
				|| sKey !== oTempForm.GetFormKey())
				continue;

			// TODO: Сейчас мы полностью перезаписываем содержимое поля. Можно проверить, что поле состоит из таких
			//       же базовых подклассов и попробовать обновить их каждый по отдельности, что бы было меньше изменений

			oTempForm.RemoveAll();
			for (let nPos = 0, nItemsCount = oForm.GetElementsCount(); nPos < nItemsCount; ++nPos)
			{
				oTempForm.AddToContent(nPos, oForm.GetElement(nPos).Copy());
			}
		}
	};
	//--------------------------------------------------------export----------------------------------------------------
	window['AscWord'] = window['AscWord'] || {};
	window['AscWord'].CFormsManager = CFormsManager;

})(window);
