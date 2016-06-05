/*
 * This file is part of ARSnova Click.
 * Copyright (C) 2016 The ARSnova Team
 *
 * ARSnova Click is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ARSnova Click is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with ARSnova Click.  If not, see <http://www.gnu.org/licenses/>.*/

import {Session} from 'meteor/session';
import {TAPi18n} from 'meteor/tap:i18n';
import {EventManagerCollection} from '/lib/eventmanager/collection.js';
import {calculateHeaderSize, calculateTitelHeight} from '/client/layout/region_header/lib.js';
import * as footerElements from "/client/layout/region_footer/scripts/lib.js";
import * as localData from '/lib/local_storage.js';

export var subscriptionHandler = null;

export function parseAnswerOptionInput(index) {
	const questionItem = Session.get("questionGroup");
	const answerlist = questionItem.getQuestionList()[index].getAnswerOptionList();

	for (var i = 0; i < answerlist.length; i++) {
		answerlist[i].setAnswerText($("#answerOptionText_Number" + i).val());
		answerlist[i].setIsCorrect($('#answerOption-' + i).find(".check-mark-checked").length > 0);
	}
	Session.set("questionGroup", questionItem);
	localData.addHashtag(Session.get("questionGroup"));
}

export function parseSingleAnswerOptionInput(questionIndex, answerOptionIndex) {
	const questionItem = Session.get("questionGroup");
	questionItem.getQuestionList()[questionIndex].getAnswerOptionList()[answerOptionIndex].setAnswerText($("#answerOptionText_Number" + answerOptionIndex).val());
	Session.set("questionGroup", questionItem);
	localData.addHashtag(Session.get("questionGroup"));
}

export function calculateXsViewport() {
	if ($(window).height() < 400) {
		$('.navbar-footer').hide();
		$('#appTitle').hide();
		$('.fixed-bottom').css("bottom", 0);
		calculateHeaderSize();
		calculateTitelHeight();
	} else {
		$('.navbar-footer').show();
		$('#appTitle').show();
		calculateHeaderSize();
		calculateTitelHeight();
		footerElements.calculateFooter();
	}
}

export function formatIsCorrectButtons() {
	$("[name='switch']").bootstrapSwitch({
		size: "small",
		onText: TAPi18n.__("view.answeroptions.correct"),
		offText: TAPi18n.__("view.answeroptions.wrong"),
		wrapperClass: "input-field",
		animate: false,
		onSwitchChange: function (event, state) {
			const item = $('.bootstrap-switch-id-' + event.target.id);
			const questionItem = Session.get("questionGroup");
			const answerlist = questionItem.getQuestionList()[EventManagerCollection.findOne().questionIndex];
			if (state) {
				item.find('.bootstrap-switch-handle-off').addClass("hiddenImportant");
				item.find(".bootstrap-switch-container").css({width: "auto"});
				answerlist.getAnswerOptionList()[event.target.id.replace("answerOption-","")].setIsCorrect(true);
			} else {
				item.find('.bootstrap-switch-handle-off').removeClass("hiddenImportant");
				item.find(".bootstrap-switch-container").css({width: "auto"});
				answerlist.getAnswerOptionList()[event.target.id.replace("answerOption-","")].setIsCorrect(false);
			}
			Session.set("questionGroup", questionItem);
			localData.addHashtag(Session.get("questionGroup"));
		},
		onInit: function (event) {
			const item = $('.bootstrap-switch-id-' + event.target.id);
			item.find("span").css({fontSize: "14px", "padding": "5px"});
			item.find(".bootstrap-switch-container").css({"width": "auto"});
		}
	});

	Session.get("questionGroup").getQuestionList()[EventManagerCollection.findOne().questionIndex].getAnswerOptionList().forEach(function (answerOption) {
		if (answerOption.getIsCorrect()) {
			const item = $('#answerOption-' + answerOption.getAnswerOptionNumber());
			item.bootstrapSwitch('state', 'true');
		}
	});
}
