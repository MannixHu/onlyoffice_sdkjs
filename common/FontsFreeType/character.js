/*
 * (c) Copyright Ascensio System SIA 2010-2017
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
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia,
 * EU, LV-1021.
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

(function(window, undefined){

	var c_oUnicodeRangesLID = {
		Basic_Latin									: 0,
		Latin_1_Supplement							: 1,
		Latin_Extended_A							: 2,
		Latin_Extended_B							: 3,
		IPA_Extensions								: 4,
		Spacing_Modifier_Letters					: 5,
		Combining_Diacritical_Marks					: 6,
		Greek_and_Coptic							: 7,
		Cyrillic									: 8,
		Cyrillic_Supplementary						: 9,
		Armenian									: 10,
		Hebrew										: 11,
		Arabic										: 12,
		Syriac										: 13,
		Thaana										: 14,
		Devanagari									: 15,
		Bengali										: 16,
		Gurmukhi									: 17,
		Gujarati									: 18,
		Oriya										: 19,
		Tamil										: 20,
		Telugu										: 21,
		Kannada										: 22,
		Malayalam									: 23,
		Sinhala										: 24,
		Thai										: 25,
		Lao											: 26,
		Tibetan										: 27,
		Myanmar										: 28,
		Georgian									: 29,
		Hangul_Jamo									: 30,
		Ethiopic									: 31,
		Cherokee									: 32,
		Unified_Canadian_Aboriginal_Syllabics		: 33,
		Ogham										: 34,
		Runic										: 35,
		Tagalog										: 36,
		Hanunoo										: 37,
		Buhid										: 38,
		Tagbanwa									: 39,
		Khmer										: 40,
		Mongolian									: 41,
		Limbu										: 42,
		Tai_Le										: 43,
		Khmer_Symbols								: 44,
		Phonetic_Extensions							: 45,
		Latin_Extended_Additional					: 46,
		Greek_Extended								: 47,
		General_Punctuation							: 48,
		Superscripts_and_Subscripts					: 49,
		Currency_Symbols							: 50,
		Combining_Diacritical_Marks_for_Symbols		: 51,
		Letterlike_Symbols							: 52,
		Number_Forms								: 53,
		Arrows										: 54,
		Mathematical_Operators						: 55,
		Miscellaneous_Technical						: 56,
		Control_Pictures							: 57,
		Optical_Character_Recognition				: 58,
		Enclosed_Alphanumerics						: 59,
		Box_Drawing									: 60,
		Block_Elements								: 61,
		Geometric_Shapes							: 62,
		Miscellaneous_Symbols						: 63,
		Dingbats									: 64,
		Miscellaneous_Mathematical_Symbols_A		: 65,
		Supplemental_Arrows_A						: 66,
		Braille_Patterns							: 67,
		Supplemental_Arrows_B						: 68,
		Miscellaneous_Mathematical_Symbols_B		: 69,
		Supplemental_Mathematical_Operators			: 70,
		Miscellaneous_Symbols_and_Arrows			: 71,
		CJK_Radicals_Supplement						: 72,
		Kangxi_Radicals								: 73,
		Ideographic_Description_Characters			: 74,
		CJK_Symbols_and_Punctuation					: 75,
		Hiragana									: 76,
		Katakana									: 77,
		Bopomofo									: 78,
		Hangul_Compatibility_Jamo					: 79,
		Kanbun										: 80,
		Bopomofo_Extended							: 81,
		Katakana_Phonetic_Extensions				: 82,
		Enclosed_CJK_Letters_and_Months				: 83,
		CJK_Compatibility							: 84,
		CJK_Unified_Ideographs_Extension_A			: 85,
		Yijing_Hexagram_Symbols						: 86,
		CJK_Unified_Ideographs						: 87,
		Yi_Syllables								: 88,
		Yi_Radicals									: 89,
		Hangul_Syllables							: 90,
		High_Surrogates								: 91,
		High_Private_Use_Surrogates					: 92,
		Low_Surrogates								: 93,
		Private_Use_Area							: 94,
		CJK_Compatibility_Ideographs				: 95,
		Alphabetic_Presentation_Forms				: 96,
		Arabic_Presentation_Forms_A					: 97,
		Variation_Selectors							: 98,
		Combining_Half_Marks						: 99,
		CJK_Compatibility_Forms						: 100,
		Small_Form_Variants							: 101,
		Arabic_Presentation_Forms_B					: 102,
		Halfwidth_and_Fullwidth_Forms				: 103,
		Specials									: 104,
		Linear_B_Syllabary							: 105,
		Linear_B_Ideograms							: 106,
		Aegean_Numbers								: 107,
		Old_Italic									: 108,
		Gothic										: 109,
		Ugaritic									: 110,
		Deseret										: 111,
		Shavian										: 112,
		Osmanya										: 113,
		Cypriot_Syllabary							: 114,
		Byzantine_Musical_Symbols					: 115,
		Musical_Symbols								: 116,
		Tai_Xuan_Jing_Symbols						: 117,
		Mathematical_Alphanumeric_Symbols			: 118,
		CJK_Unified_Ideographs_Extension_B			: 119,
		CJK_Compatibility_Ideographs_Supplement		: 120,
		Tags										: 121
	};

	function CRange(_start, _end, _lid)
	{
		this.Start 		= _start;
		this.End		= _end;
		this.Rid		= _lid;
	};

	var c_oUnicodeRanges = [
		new CRange(0x0020, 0x007F, c_oUnicodeRangesLID.Basic_Latin),
		new CRange(0x00A0, 0x00FF, c_oUnicodeRangesLID.Latin_1_Supplement),
		new CRange(0x0100, 0x017F, c_oUnicodeRangesLID.Latin_Extended_A),
		new CRange(0x0180, 0x024F, c_oUnicodeRangesLID.Latin_Extended_B),
		new CRange(0x0250, 0x02AF, c_oUnicodeRangesLID.IPA_Extensions),
		new CRange(0x02B0, 0x02FF, c_oUnicodeRangesLID.Spacing_Modifier_Letters),
		new CRange(0x0300, 0x036F, c_oUnicodeRangesLID.Combining_Diacritical_Marks),
		new CRange(0x0370, 0x03FF, c_oUnicodeRangesLID.Greek_and_Coptic),
		new CRange(0x0400, 0x04FF, c_oUnicodeRangesLID.Cyrillic),
		new CRange(0x0500, 0x052F, c_oUnicodeRangesLID.Cyrillic_Supplementary),
		new CRange(0x0530, 0x058F, c_oUnicodeRangesLID.Armenian),
		new CRange(0x0590, 0x05FF, c_oUnicodeRangesLID.Hebrew),
		new CRange(0x0600, 0x06FF, c_oUnicodeRangesLID.Arabic),
		new CRange(0x0700, 0x074F, c_oUnicodeRangesLID.Syriac),
		new CRange(0x0780, 0x07BF, c_oUnicodeRangesLID.Thaana),
		new CRange(0x0900, 0x097F, c_oUnicodeRangesLID.Devanagari),
		new CRange(0x0980, 0x09FF, c_oUnicodeRangesLID.Bengali),
		new CRange(0x0A00, 0x0A7F, c_oUnicodeRangesLID.Gurmukhi),
		new CRange(0x0A80, 0x0AFF, c_oUnicodeRangesLID.Gujarati),
		new CRange(0x0B00, 0x0B7F, c_oUnicodeRangesLID.Oriya),
		new CRange(0x0B80, 0x0BFF, c_oUnicodeRangesLID.Tamil),
		new CRange(0x0C00, 0x0C7F, c_oUnicodeRangesLID.Telugu),
		new CRange(0x0C80, 0x0CFF, c_oUnicodeRangesLID.Kannada),
		new CRange(0x0D00, 0x0D7F, c_oUnicodeRangesLID.Malayalam),
		new CRange(0x0D80, 0x0DFF, c_oUnicodeRangesLID.Sinhala),
		new CRange(0x0E00, 0x0E7F, c_oUnicodeRangesLID.Thai),
		new CRange(0x0E80, 0x0EFF, c_oUnicodeRangesLID.Lao),
		new CRange(0x0F00, 0x0FFF, c_oUnicodeRangesLID.Tibetan),
		new CRange(0x1000, 0x109F, c_oUnicodeRangesLID.Myanmar),
		new CRange(0x10A0, 0x10FF, c_oUnicodeRangesLID.Georgian),
		new CRange(0x1100, 0x11FF, c_oUnicodeRangesLID.Hangul_Jamo),
		new CRange(0x1200, 0x137F, c_oUnicodeRangesLID.Ethiopic),
		new CRange(0x13A0, 0x13FF, c_oUnicodeRangesLID.Cherokee),
		new CRange(0x1400, 0x167F, c_oUnicodeRangesLID.Unified_Canadian_Aboriginal_Syllabics),
		new CRange(0x1680, 0x169F, c_oUnicodeRangesLID.Ogham),
		new CRange(0x16A0, 0x16FF, c_oUnicodeRangesLID.Runic),
		new CRange(0x1700, 0x171F, c_oUnicodeRangesLID.Tagalog),
		new CRange(0x1720, 0x173F, c_oUnicodeRangesLID.Hanunoo),
		new CRange(0x1740, 0x175F, c_oUnicodeRangesLID.Buhid),
		new CRange(0x1760, 0x177F, c_oUnicodeRangesLID.Tagbanwa),
		new CRange(0x1780, 0x17FF, c_oUnicodeRangesLID.Khmer),
		new CRange(0x1800, 0x18AF, c_oUnicodeRangesLID.Mongolian),
		new CRange(0x1900, 0x194F, c_oUnicodeRangesLID.Limbu),
		new CRange(0x1950, 0x197F, c_oUnicodeRangesLID.Tai_Le),
		new CRange(0x19E0, 0x19FF, c_oUnicodeRangesLID.Khmer_Symbols),
		new CRange(0x1D00, 0x1D7F, c_oUnicodeRangesLID.Phonetic_Extensions),
		new CRange(0x1E00, 0x1EFF, c_oUnicodeRangesLID.Latin_Extended_Additional),
		new CRange(0x1F00, 0x1FFF, c_oUnicodeRangesLID.Greek_Extended),
		new CRange(0x2000, 0x206F, c_oUnicodeRangesLID.General_Punctuation),
		new CRange(0x2070, 0x209F, c_oUnicodeRangesLID.Superscripts_and_Subscripts),
		new CRange(0x20A0, 0x20CF, c_oUnicodeRangesLID.Currency_Symbols),
		new CRange(0x20D0, 0x20FF, c_oUnicodeRangesLID.Combining_Diacritical_Marks_for_Symbols),
		new CRange(0x2100, 0x214F, c_oUnicodeRangesLID.Letterlike_Symbols),
		new CRange(0x2150, 0x218F, c_oUnicodeRangesLID.Number_Forms),
		new CRange(0x2190, 0x21FF, c_oUnicodeRangesLID.Arrows),
		new CRange(0x2200, 0x22FF, c_oUnicodeRangesLID.Mathematical_Operators),
		new CRange(0x2300, 0x23FF, c_oUnicodeRangesLID.Miscellaneous_Technical),
		new CRange(0x2400, 0x243F, c_oUnicodeRangesLID.Control_Pictures),
		new CRange(0x2440, 0x245F, c_oUnicodeRangesLID.Optical_Character_Recognition),
		new CRange(0x2460, 0x24FF, c_oUnicodeRangesLID.Enclosed_Alphanumerics),
		new CRange(0x2500, 0x257F, c_oUnicodeRangesLID.Box_Drawing),
		new CRange(0x2580, 0x259F, c_oUnicodeRangesLID.Block_Elements),
		new CRange(0x25A0, 0x25FF, c_oUnicodeRangesLID.Geometric_Shapes),
		new CRange(0x2600, 0x26FF, c_oUnicodeRangesLID.Miscellaneous_Symbols),
		new CRange(0x2700, 0x27BF, c_oUnicodeRangesLID.Dingbats),
		new CRange(0x27C0, 0x27EF, c_oUnicodeRangesLID.Miscellaneous_Mathematical_Symbols_A),
		new CRange(0x27F0, 0x27FF, c_oUnicodeRangesLID.Supplemental_Arrows_A),
		new CRange(0x2800, 0x28FF, c_oUnicodeRangesLID.Braille_Patterns),
		new CRange(0x2900, 0x297F, c_oUnicodeRangesLID.Supplemental_Arrows_B),
		new CRange(0x2980, 0x29FF, c_oUnicodeRangesLID.Miscellaneous_Mathematical_Symbols_B),
		new CRange(0x2A00, 0x2AFF, c_oUnicodeRangesLID.Supplemental_Mathematical_Operators),
		new CRange(0x2B00, 0x2BFF, c_oUnicodeRangesLID.Miscellaneous_Symbols_and_Arrows),
		new CRange(0x2E80, 0x2EFF, c_oUnicodeRangesLID.CJK_Radicals_Supplement),
		new CRange(0x2F00, 0x2FDF, c_oUnicodeRangesLID.Kangxi_Radicals),
		new CRange(0x2FF0, 0x2FFF, c_oUnicodeRangesLID.Ideographic_Description_Characters),
		new CRange(0x3000, 0x303F, c_oUnicodeRangesLID.CJK_Symbols_and_Punctuation),
		new CRange(0x3040, 0x309F, c_oUnicodeRangesLID.Hiragana),
		new CRange(0x30A0, 0x30FF, c_oUnicodeRangesLID.Katakana),
		new CRange(0x3100, 0x312F, c_oUnicodeRangesLID.Bopomofo),
		new CRange(0x3130, 0x318F, c_oUnicodeRangesLID.Hangul_Compatibility_Jamo),
		new CRange(0x3190, 0x319F, c_oUnicodeRangesLID.Kanbun),
		new CRange(0x31A0, 0x31BF, c_oUnicodeRangesLID.Bopomofo_Extended),
		new CRange(0x31F0, 0x31FF, c_oUnicodeRangesLID.Katakana_Phonetic_Extensions),
		new CRange(0x3200, 0x32FF, c_oUnicodeRangesLID.Enclosed_CJK_Letters_and_Months),
		new CRange(0x3300, 0x33FF, c_oUnicodeRangesLID.CJK_Compatibility),
		new CRange(0x3400, 0x4DBF, c_oUnicodeRangesLID.CJK_Unified_Ideographs_Extension_A),
		new CRange(0x4DC0, 0x4DFF, c_oUnicodeRangesLID.Yijing_Hexagram_Symbols),
		new CRange(0x4E00, 0x9FFF, c_oUnicodeRangesLID.CJK_Unified_Ideographs),
		new CRange(0xA000, 0xA48F, c_oUnicodeRangesLID.Yi_Syllables),
		new CRange(0xA490, 0xA4CF, c_oUnicodeRangesLID.Yi_Radicals),
		new CRange(0xAC00, 0xD7AF, c_oUnicodeRangesLID.Hangul_Syllables),
		new CRange(0xD800, 0xDB7F, c_oUnicodeRangesLID.High_Surrogates),
		new CRange(0xDB80, 0xDBFF, c_oUnicodeRangesLID.High_Private_Use_Surrogates),
		new CRange(0xDC00, 0xDFFF, c_oUnicodeRangesLID.Low_Surrogates),
		new CRange(0xE000, 0xF8FF, c_oUnicodeRangesLID.Private_Use_Area),
		new CRange(0xF900, 0xFAFF, c_oUnicodeRangesLID.CJK_Compatibility_Ideographs),
		new CRange(0xFB00, 0xFB4F, c_oUnicodeRangesLID.Alphabetic_Presentation_Forms),
		new CRange(0xFB50, 0xFDFF, c_oUnicodeRangesLID.Arabic_Presentation_Forms_A),
		new CRange(0xFE00, 0xFE0F, c_oUnicodeRangesLID.Variation_Selectors),
		new CRange(0xFE20, 0xFE2F, c_oUnicodeRangesLID.Combining_Half_Marks),
		new CRange(0xFE30, 0xFE4F, c_oUnicodeRangesLID.CJK_Compatibility_Forms),
		new CRange(0xFE50, 0xFE6F, c_oUnicodeRangesLID.Small_Form_Variants),
		new CRange(0xFE70, 0xFEFF, c_oUnicodeRangesLID.Arabic_Presentation_Forms_B),
		new CRange(0xFF00, 0xFFEF, c_oUnicodeRangesLID.Halfwidth_and_Fullwidth_Forms),
		new CRange(0xFFF0, 0xFFFF, c_oUnicodeRangesLID.Specials),
		new CRange(0x10000, 0x1007F, c_oUnicodeRangesLID.Linear_B_Syllabary),
		new CRange(0x10080, 0x100FF, c_oUnicodeRangesLID.Linear_B_Ideograms),
		new CRange(0x10100, 0x1013F, c_oUnicodeRangesLID.Aegean_Numbers),
		new CRange(0x10300, 0x1032F, c_oUnicodeRangesLID.Old_Italic),
		new CRange(0x10330, 0x1034F, c_oUnicodeRangesLID.Gothic),
		new CRange(0x10380, 0x1039F, c_oUnicodeRangesLID.Ugaritic),
		new CRange(0x10400, 0x1044F, c_oUnicodeRangesLID.Deseret),
		new CRange(0x10450, 0x1047F, c_oUnicodeRangesLID.Shavian),
		new CRange(0x10480, 0x104AF, c_oUnicodeRangesLID.Osmanya),
		new CRange(0x10800, 0x1083F, c_oUnicodeRangesLID.Cypriot_Syllabary),
		new CRange(0x1D000, 0x1D0FF, c_oUnicodeRangesLID.Byzantine_Musical_Symbols),
		new CRange(0x1D100, 0x1D1FF, c_oUnicodeRangesLID.Musical_Symbols),
		new CRange(0x1D300, 0x1D35F, c_oUnicodeRangesLID.Tai_Xuan_Jing_Symbols),
		new CRange(0x1D400, 0x1D7FF, c_oUnicodeRangesLID.Mathematical_Alphanumeric_Symbols),
		new CRange(0x20000, 0x2A6DF, c_oUnicodeRangesLID.CJK_Unified_Ideographs_Extension_B),
		new CRange(0x2F800, 0x2FA1F, c_oUnicodeRangesLID.CJK_Compatibility_Ideographs_Supplement),
		new CRange(0xE0000, 0xE007F, c_oUnicodeRangesLID.Tags)
	];

})(window);
