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

import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {TAPi18n} from 'meteor/tap:i18n';
import {QuestionGroupCollection} from '/lib/questions/collection.js';
import {AnswerOptionCollection} from '/lib/answeroptions/collection.js';
import {ErrorSplashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import * as localData from '/lib/local_storage.js';

export function checkForValidQuestions(index) {
	var questionDoc = QuestionGroupCollection.findOne();
	var answerDoc = AnswerOptionCollection.find({questionIndex: index});
	if (!questionDoc || !answerDoc) {
		return false;
	}

	var question = questionDoc.questionList[index];

	if (typeof question === "undefined") {
		return false;
	}

	if (!question.questionText || question.questionText.length < 5 || question.questionText.length > 10000) {
		return false;
	}
	if (!question.timer || isNaN(question.timer) || question.timer < 5000 || question.timer > 260000) {
		return false;
	}

	var hasValidAnswers = true;
	answerDoc.forEach(function (value) {
		if (typeof value.answerText === "undefined" || value.answerText.length > 500 || value.answerText.length === 0) {
			hasValidAnswers = false;
		}
	});
	return hasValidAnswers;
}

export function addNewQuestion(callback) {
	var index = QuestionGroupCollection.findOne().questionList.length;
	Meteor.call("QuestionGroupCollection.addQuestion", {
		hashtag: Router.current().params.quizName,
		questionIndex: index,
		questionText: ""
	}, (err) => {
		if (err) {
			new ErrorSplashscreen({
				autostart: true,
				errorMessage: TAPi18n.__("plugins.splashscreen.error.error_messages." + err.reason)
			});
		} else {
			for (var i = 0; i < 4; i++) {
				Meteor.call('AnswerOptionCollection.addOption', {
					hashtag: Router.current().params.quizName,
					questionIndex: index,
					answerOptionNumber: i,
					answerText: "",
					isCorrect: 0
				});
			}

			localData.addQuestion(Router.current().params.quizName, QuestionGroupCollection.findOne().questionList.length, "");

			var validQuestions = Session.get("validQuestions");
			validQuestions[index] = false;
			Session.set("validQuestions", validQuestions);

			Meteor.call("EventManagerCollection.setActiveQuestion", Router.current().params.quizName, index, function () {
				Router.go("/" + Router.current().params.quizName + "/question");
				if (callback) {
					callback();
				}
			});
		}
	});
}

export function calculateTitelHeight() {
	var fixedTop = $(".navbar-fixed-top");
	var container = $(".container");
	var footerHeight = $("#footerBar").hasClass("hide") ? $(".fixed-bottom").outerHeight() + $(".footer-info-bar").outerHeight() : $(".fixed-bottom").outerHeight();
	var finalHeight = $(window).height() - fixedTop.outerHeight() - $(".navbar-fixed-bottom").outerHeight() - footerHeight;

	container.css("height", finalHeight);
	container.css("margin-top", fixedTop.outerHeight());

	$(".kill-session-switch-wrapper").css("top", $(".arsnova-logo").height() * 0.4);
}
