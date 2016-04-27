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
import {Template} from 'meteor/templating';
import {EventManager} from '/lib/eventmanager.js';
import {AnswerOptions} from '/lib/answeroptions.js';
import {QuestionGroup} from '/lib/questions.js';
import {mathjaxMarkdown} from '/client/lib/mathjax_markdown.js';
import {Splashscreen} from '/client/plugins/splashscreen/scripts/lib.js';
import {eventManagerObserver, deleteCountdown, setEventManagerObserver} from './lib.js';

Template.liveResults.onCreated(function () {
	var oldStartTimeValues = {};
	var initQuestionIndex = -1;
	deleteCountdown();

	this.subscribe('EventManager.join', Session.get("hashtag"), function () {
		initQuestionIndex = EventManager.findOne().questionIndex;
		setEventManagerObserver(EventManager.find().observeChanges({
			changed: function (id, changedFields) {
				if (!isNaN(changedFields.sessionStatus)) {
					if (changedFields.sessionStatus === 2) {
						$('.modal-backdrop').remove();
						eventManagerObserver.stop();
						Router.go("/memberlist");
					} else if (changedFields.sessionStatus < 2) {
						$('.modal-backdrop').remove();
						eventManagerObserver.stop();
						Router.go("/resetToHome");
					}
				} else if (!isNaN(changedFields.questionIndex) && changedFields.questionIndex !== initQuestionIndex) {
					if (Session.get("isOwner")) {
						new Splashscreen({
							autostart: true,
							instanceId: "answers_" + EventManager.findOne().questionIndex,
							templateName: 'questionAndAnswerSplashscreen',
							closeOnButton: '#js-btn-hideQuestionModal',
							onRendered: function (instance) {
								var content = "";
								mathjaxMarkdown.initializeMarkdownAndLatex();
								AnswerOptions.find({questionIndex: EventManager.findOne().questionIndex}, {sort: {answerOptionNumber: 1}}).forEach(function (answerOption) {
									if (!answerOption.answerText) {
										answerOption.answerText = "";
									}

									content += String.fromCharCode((answerOption.answerOptionNumber + 65)) + "<br/>";
									content += mathjaxMarkdown.getContent(answerOption.answerText) + "<br/>";
								});

								instance.templateSelector.find('#answerContent').html(content);
								setTimeout(function () {
									instance.close();
								}, 10000);
							}
						});
					} else {
						Router.go("/onpolling");
					}
				}
			}
		}));
	});
	this.subscribe('Responses.session', Session.get("hashtag"));
	this.subscribe('AnswerOptions.options', Session.get("hashtag"));
	this.subscribe('MemberList.members', Session.get("hashtag"));
	this.subscribe('QuestionGroup.questionList', Session.get("hashtag"), function () {
		var doc = QuestionGroup.findOne();
		var i = 0;
		for (i; i < doc.questionList.length; i++) {
			oldStartTimeValues[i] = doc.questionList[i].startTime;
		}
		Session.set("oldStartTimeValues", oldStartTimeValues);
	});
	this.subscribe('Hashtags.public');
});
