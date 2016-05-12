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

import {Mongo} from 'meteor/mongo';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {hashtagSchema} from '../hashtags/collection.js';
import {questionIndexSchema} from '../eventmanager/collection.js';
import {userNickSchema} from '../member_list/collection.js';
import {answerOptionNumberSchema} from '../answeroptions/collection.js';
import * as localData from '/lib/local_storage.js';

export const ResponsesCollection = new Mongo.Collection("responses");
export const responseTimeSchema = new SimpleSchema({
	type: Number,
	min: 0
});
export const responsesCollectionSchema = new SimpleSchema({
	hashtag: hashtagSchema,
	questionIndex: questionIndexSchema,
	userNick: userNickSchema,
	answerOptionNumber: answerOptionNumberSchema,
	responseTime: responseTimeSchema
});

ResponsesCollection.attachSchema(responsesCollectionSchema);

ResponsesCollection.deny({
	insert: function () {
		return true;
	},
	update: function () {
		return true;
	},
	remove: function () {
		return true;
	}
});

ResponsesCollection.allow({
	insert: function (userId, doc) {
		const isOwner = localData.containsHashtag(doc.hashtag);
		const isOwnNick = doc.userNick === localStorage.getItem(doc.hashtag + "nick");
		return isOwner || isOwnNick;
	},
	update: function (userId, doc) {
		return localData.containsHashtag(doc.hashtag);
	},
	remove: function (userId, doc) {
		return localData.containsHashtag(doc.hashtag);
	}
});
