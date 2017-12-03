/*
This programm is free software under CC creative common licence!
Author: Christian Pauly
*/

/**
* Pubsub Plugin for strophe.js
*
*/

function hashCode(s){
	return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
}


function HandleError(iq){
	if(iq == null) return {
		"type" : "error",
		"reason" : "timeout"
	};
	var text = "";
	if(iq.querySelector("text") != null)
	text = iq.querySelector("text").innerHTML;
	return {
		"type" : "error",
		"from" : iq.getAttribute("from"),
		"context" : iq.firstChild.tagName,
		"reason" : iq.querySelector("error").firstChild.tagName,
		"text" : text
	};
}


function xmlToObject(xml){
	if(xml.children.length == 0 && xml.attributes.length == 0)
	var xmlObject = xml.innerHTML;
	else{
		var xmlObject = {attributes: {}, val: xml.innerHTML};
		for(i=0;i<xml.attributes.length;i++)
		xmlObject.attributes[xml.attributes[i].name] = xml.attributes[i].value;
		for(var i=0;i<xml.children.length;i++){
			if(xml.children[i].nodeName in xmlObject){
				if(typeof(xmlObject[xml.children[i].nodeName]) != "object" || "val" in xmlObject[xml.children[i].nodeName]){
					var tempObj = xmlObject[xml.children[i].nodeName];
					xmlObject[xml.children[i].nodeName] = [];
					xmlObject[xml.children[i].nodeName].push(tempObj);
				}
				xmlObject[xml.children[i].nodeName].push(xmlToObject(xml.children[i]));
			}
			else
			xmlObject[xml.children[i].nodeName] = xmlToObject(xml.children[i]);
		}
	}
	return xmlObject;
}

(function () {

	Strophe.addConnectionPlugin('pubsub', {
		OnMetadataEvent: null,
		_connection: null,
				OnPubsubEvent: null,
				OnPubsubPublishEvent: null,
				OnSubscriptionMessage: null,
				OnMucInvitation: null,


		init: function (conn) {
			this._connection = conn;
			Strophe.addNamespace('PUBSUB', 'http://jabber.org/protocol/pubsub');
		},

		statusChanged: function (status, condition) {
            if (status === Strophe.Status.CONNECTED || status === Strophe.Status.ATTACHED) {
                this._connection.addHandler(this.HandlePubsubEvent.bind(this), "http://jabber.org/protocol/pubsub#event", "message");
            }
        },

		//==================================================
		//  			PUBSUBS
		//==================================================


		HandleError: function(iq){
			if(iq == null) return {
				"type" : "error",
				"reason" : "timeout"
			};
			var text = "";
			if(iq.querySelector("text") != null)
			text = iq.querySelector("text").innerHTML;
			return {
				"type" : "error",
				"from" : iq.getAttribute("from"),
				"context" : iq.firstChild.tagName,
				"reason" : iq.querySelector("error").firstChild.tagName,
				"text" : text
			};
		},



		GetFieldValue: function(field){
			var value = "";
			switch(field.getAttribute("type")){
				case "list-single":
				var options = [];
				var optionElems = field.querySelectorAll("option");
				for(var i=0; i<optionElems.length; i++)
				options.push(optionElems[i].querySelector("value").innerHTML);
				return {
					current: field.lastChild.innerHTML,
					options: options
				}
				case "list-multi":
				var options = [];
				var optionElems = field.querySelectorAll("option");
				if(optionElems.length == 0) return "";
				for(var i=0; i<optionElems.length; i++)
				options.push(optionElems[i].querySelector("value").innerHTML);
				return {
					current: field.lastChild.innerHTML,
					options: options
				}
				default:
				if(field.querySelector("value"))
				return field.querySelector("value").innerHTML;
				else
				return "";
			}
		},


		HandlePubsubEvent: function(iq){
			if(this.OnPubsubEvent == null)
				return true;
			if(iq.querySelector("items") != null){
				var ansList = [];
				var ansNodes = iq.querySelectorAll("item");
				for(i=0; i<ansNodes.length;i++)
					ansList.push(xmlToObject(ansNodes[i].querySelector("entry")));
				var ansObj = {
					"server":iq.getAttribute("from"),
					"node": iq.querySelector("items").getAttribute("node"),
					"itemList": ansList
				};
				this.OnPubsubEvent(ansObj);
			}
			else if(this.OnPubsubSubcriptionApprovedEvent != null && iq.getAttribute("id") == "approvalnotify1"){
				var ansObj = {
					"node":iq.querySelector("subscription").getAttribute("node"),
					"jid":iq.querySelector("subscription").getAttribute("jid"),
					"subscription":iq.querySelector("subscription").getAttribute("subscription")
				};
				this.OnPubsubSubcriptionApprovedEvent(ansObj);
			}
			else if(this.OnPubsubSubcriptionDeniedEvent != null && iq.getAttribute("id") == "unsubnotify1"){
				var ansObj = {
					"node":iq.querySelector("subscription").getAttribute("node"),
					"jid":iq.querySelector("subscription").getAttribute("jid"),
					"subscription":iq.querySelector("subscription").getAttribute("subscription")
				};
				this.OnPubsubSubcriptionDeniedEvent(ansObj);
			}
			else if(this.OnPubsubRetractEvent != null && iq.querySelector("delete") != null){
				var ansObj = {
					"node":iq.querySelector("delete").getAttribute("node"),
					"jid":iq.getAttribute("from"),
					"id":iq.querySelector("redirect").getAttribute("uri")
				};
				this.OnPubsubRetractEvent(ansObj);
			}
			else if(this.OnPubsubConfigEvent != null && iq.querySelector("configuration") != null){
				var ansObj = {
					"node":iq.querySelector("configuration").getAttribute("node"),
					"jid":iq.getAttribute("from"),
					"config":iq.querySelector("configuration")
				};
				this.OnPubsubConfigEvent(ansObj);
			}
			return true;
		},


		GetFieldValue: function(field){
			var value = "";
			switch(field.getAttribute("type")){
				case "list-single":
				var options = [];
				var optionElems = field.querySelectorAll("option");
				for(var i=0; i<optionElems.length; i++)
				options.push(optionElems[i].querySelector("value").innerHTML);
				return {
					current: field.lastChild.innerHTML,
					options: options
				}
				case "list-multi":
				var options = [];
				var optionElems = field.querySelectorAll("option");
				if(optionElems.length == 0) return "";
				for(var i=0; i<optionElems.length; i++)
				options.push(optionElems[i].querySelector("value").innerHTML);
				return {
					current: field.lastChild.innerHTML,
					options: options
				}
				default:
				if(field.querySelector("value"))
				return field.querySelector("value").innerHTML;
				else
				return "";
			}
		},

		//  			ENTITY USE CASES
		//==================================================

		DiscoverFeatures: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"feature1"})
			.c("query", {"xmlns":"http://jabber.org/protocol/disco#info"});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				var ansList = [];
				var ansNodes = iq.querySelectorAll("feature");
				for(i=0; i<ansNodes.length;i++)
				ansList.push(ansNodes[i].getAttribute("var"));
				callback({"type":"success","ansList":ansList});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		DiscoverNodes: function(arg = { "level":1 },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"nodes"+arg.level})
			.c("query", {"xmlns":"http://jabber.org/protocol/disco#items"});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				var ansList = [];
				var ansNodes = iq.querySelectorAll("item");
				for(i=0; i<ansNodes.length;i++)
				ansList.push({
					"jid" : ansNodes[i].getAttribute("jid"),
					"node" : ansNodes[i].getAttribute("node"),
					"name" : ansNodes[i].getAttribute("name")
				});
				callback({"type":"success","ansList":ansList});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		DiscoverNodeInformation: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"info2"})
			.c("query", {"xmlns":"http://jabber.org/protocol/disco#info", "node":arg.node});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback({
					"type":"success",
					"category":iq.querySelector("identity").getAttribute("category"),
					"type" : iq.querySelector("identity").getAttribute("type")
				});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		DiscoverNodeMetadata: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"meta1"})
			.c("query", {"xmlns":"http://jabber.org/protocol/disco#info", "node":arg.node});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){	console.log(iq);
				var ans = {
					"type":"success",
					"category":iq.querySelector("identity").getAttribute("category"),
					"type" : iq.querySelector("identity").getAttribute("type")
				}
				var ansNodes = iq.querySelectorAll("field");
				for(i=0; i<ansNodes.length;i++)
				ans[ansNodes[i].getAttribute("var")] = ansNodes[i].querySelector("value").innerHTML;
				callback(ans);
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		SearchUser: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"search1"})
			.c("query", {"xmlns":"jabber:iq:search"});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback({"type":"success","iq":iq});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		DiscoverNodeItems: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"items1"})
			.c("query", {"xmlns":"http://jabber.org/protocol/disco#items", "node":arg.node});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){	console.info(iq);
				var ansList = [];
				var ansNodes = iq.querySelectorAll("item");
				for(i=0; i<ansNodes.length;i++)
				ansList.push({
					"jid" : ansNodes[i].getAttribute("jid"),
					"name" : ansNodes[i].getAttribute("name")
				});
				callback({"type":"success","ansList":ansList});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},


		RetrieveSubscriptions: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"subscriptions1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub"});
			if("node" in arg)
			req = req.c("subscriptions", {"node" : arg.node});
			else
			req = req.c("subscriptions");

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				var ansList = [];
				var ansNodes = iq.querySelectorAll("subscription");
				for(i=0; i<ansNodes.length;i++)
				ansList.push({
					"node" : ansNodes[i].getAttribute("node"),
					"jid" : ansNodes[i].getAttribute("jid"),
					"subscription" : ansNodes[i].getAttribute("subscription"),
					"subid" : ansNodes[i].getAttribute("subid")
				});
				callback({"type":"success","ansList":ansList});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		RetrieveAffiliations: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"affil1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub"})
			if("node" in arg)
			req = req.c("affiliations", {"node" : arg.node});
			else
			req = req.c("affiliations");

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				var ansList = [];
				var ansNodes = iq.querySelectorAll("affiliation");
				for(i=0; i<ansNodes.length;i++)
				ansList.push({
					"node" : ansNodes[i].getAttribute("node"),
					"affiliation" : ansNodes[i].getAttribute("affiliation"),
				});
				callback({"type":"success","ansList":ansList});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		//  			SUBSCRIBER USE CASES
		//==================================================

		SubscribeNode: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"sub1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub", "node":arg.node})
			.c("subscribe", {"node":arg.node, "jid":Strophe.getBareJidFromJid(this._connection.jid)});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				var ansNode = iq.querySelector("subscription");
				var ansObj = {
					"type" : "success",
					"jid" : ansNode.getAttribute("jid"),
					"subid" : ansNode.getAttribute("subid"),
					"subscription" : ansNode.getAttribute("subscription"),
				};
				callback(ansObj);
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		UnsubscribeNode: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"unsub1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub", "node":arg.node})
			.c("unsubscribe", {"node":arg.node, "jid":Strophe.getBareJidFromJid(this._connection.jid)});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){	console.log(iq);
				var ansNode = iq.querySelector("subscription");
				var ansObj =
				{
					"type" : "success"
				};
				callback(ansObj);
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		RequestSubscriberOptionsForm: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"options1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub", "node":arg.node})
			.c("options", {"node":arg.node, "jid":Strophe.getBareJidFromJid(this._connection.jid)});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback(iq.querySelector("options"));
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		SubmitSubscriberOptionsForm: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"options1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub", "node":arg.node});
			req = req.tree();
			req.firstChild.append(arg.options);

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback({"type": "success"});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},


		RequestDefaultSubConfiguration: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"def1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub", "node":arg.node})
			.c("default", {"node":arg.node, "jid":Strophe.getBareJidFromJid(this._connection.jid)});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback(iq.querySelector("default"));
			},
			function(iq){
				callback(HandleError(iq));
			});
		},


		getInnerHtml: function(obj,target){
			if(obj.querySelector(target))
			return obj.querySelector(target).innerHTML;
			else
			return undefined;
		},

		RetrieveItemsFromNode: function(arg = { },callback){
			// BUILD QUERY
			var id = "items1"
			if(arg.reqid)
			id = arg.reqid;
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":id})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub", "node":arg.node});
			if("max" in arg)
			req = req.c("items", {"node":arg.node, "max_items":arg.max, "jid":Strophe.getBareJidFromJid(this._connection.jid)});
			else
			req = req.c("items", {"node":arg.node, "jid":Strophe.getBareJidFromJid(this._connection.jid)});
			if("id" in arg)
			req = req.c("item", {"id":arg.id});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				var ansList = [];
				var ansNodes = iq.querySelectorAll("item");
				for(i=0; i<ansNodes.length;i++)
					ansList.push(xmlToObject(ansNodes[i].querySelector("entry")));
				callback({
					"type":"success",
					"server":iq.getAttribute("from"),
					"node":iq.querySelector("items").getAttribute("node"),
					"ansList":ansList
				});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},


		RequestPrivateData: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "id":"retrieve1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub"})
			.c("items", {"node": "storage:bookmarks"});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				var conferencesList = [];
				var conferencesNodes = iq.querySelectorAll("conference");
				for(i=0; i<conferencesNodes.length;i++)
				conferencesList.push({
					"name" : conferencesNodes[i].getAttribute("name"),
					"autojoin" : conferencesNodes[i].getAttribute("autojoin"),
					"jid" : conferencesNodes[i].getAttribute("jid"),
					"nick" : conferencesNodes[i].querySelector("nick"),
					"password" : conferencesNodes[i].querySelector("password"),
				});
				var urlsList = [];
				var urlsNodes = iq.querySelectorAll("url");
				for(i=0; i<urlsNodes.length;i++)
				urlsList.push({
					"name" : urlsNodes[i].getAttribute("name"),
					"url" : urlsNodes[i].getAttribute("url")
				});

				callback({"type": "success", "conferences": conferencesList, "urls": urlsList});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		SetPrivateData: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "id":"pdp1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub"})
			.c("publish", {"node":"storage:bookmarks"})
			.c("item", {"id":"current"})
			.c("storage", {"xmlns":"storage:bookmarks"});
			if("conferences" in arg)
			for(var i in arg.conferences){
				req = req.c("conference", {"name":arg.conferences[i].name, "jid":arg.conferences[i].jid, "autojoin":arg.conferences[i].autojoin});
				if("nick" in arg.conferences[i])
				req = req.c("nick").t(arg.conferences[i].nick).up().up();
				if("password" in arg.conferences[i])
				req = req.c("password").t(arg.conferences[i].password).up().up();
			}
			if("urls" in arg)
			for(var i in arg.urls)
			req = req.c("url", {"name":arg.urls[i].name, "url":arg.urls[i].url}).up();

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback({"type": "success"});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		GetSubscriptions: function(arg = { },callback){
			// BUILD QUERY
			var id = "subscriptions1"
			if(arg.reqid)
			id = arg.reqid;
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":id})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub"})
			.c("subscriptions");

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				var ansList = [];
				var ansNodes = iq.querySelectorAll("subscription");
				for(i=0; i<ansNodes.length;i++)
				ansList.push({
					"node" : ansNodes[i].getAttribute("node"),
					"jid" : ansNodes[i].getAttribute("jid"),
					"subscription" : ansNodes[i].getAttribute("subscription"),
					"subid" : ansNodes[i].getAttribute("subid"),
				});
				callback({"type": "success", "from": iq.getAttribute("from"), "ansList": ansList});
			},
			function(iq){
				callback(HandleError(iq));
			});
			return true;
		},

		//  			PUBLISHER USE CASES
		//==================================================
		PublishItem: function(arg = { },callback){
			// BUILD QUERY
			var date = new Date();
			if(!arg.id)
			arg.id = hashCode(Strophe.getBareJidFromJid(this._connection.jid) + arg.text + (new Date()));
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"publish1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub"})
			.c("publish", {"node":arg.node})
			.c("item", {"id":arg.id})
			.c("entry", {"xmlns":"http://www.w3.org/2005/Atom"})
			.c("id").t(arg.id).up();
			if("title" in arg)
			req = req.c("title").t(arg.title).up();
			else
			req = req.c("title").t(arg.text.substring(0,30)).up();
			if("reply" in arg){
				var ref = "tag:" + arg.reply.server + "," + new Date().getFullYear() + "-" + date.getMonth() + "-" + date.getDay() + ":posts-" + arg.reply.id;
				var href = "xmpp:" + arg.reply.server + "?;node=" + arg.reply.node + ";item=" + arg.reply.item;
				req = req.c("link", {"rel": "via", "ref":ref, "href": href}).up();
			}
			req = req.c("author").c("uri").t("xmpp:"+Strophe.getBareJidFromJid(this._connection.jid)).up().up();
			if("enableComments" in arg)
			req = req.c("link", {"rel":"replies","title":"comments","href":"xmpp:" + Strophe.getBareJidFromJid( Strophe.getBareJidFromJid(this._connection.jid) ) + "?;node=urn:xmpp:microblog:0:comments/" + arg.id}).up();
			if("summary" in arg)
			req = req.c("summary", {"type":"text"}).t(arg.text.substring(0,140)).up();
			req = req.c("content", {"type":"text"}).t(arg.text).up()
			.c("content", {"type":"xhtml"}).c("div", {"xmlns":"http://www.w3c.org/1999/xhtml"}).c("p").t(arg.text).up().up().up()
			.c("published").t(date).up()
			.c("updated").t(date).up();

			console.log(req);
			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback({
					"type": "success",
					"id": iq.querySelector("item").getAttribute("id")
				});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		DeleteItem: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"retract1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub"})
			.c("retract", {"node":arg.node})
			.c("item", {"id":arg.id});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback({"type": "success"});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		//  			OWNER USE CASES
		//==================================================

		CreateNode: function(arg = { },callback){
			// BUILD QUERY
			var createId = "create2";
			if("node" in arg)
			createId = "create1";
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":createId})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub"});
			if("node" in arg)
			req = req.c("create", {"node":arg.node}).up();
			else
			req = req.c("create").up();
			if("configure" in arg){
				req = req.tree();
				req.firstChild.append(arg.configure);
			}

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback({"type": "success"});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		RequestPubsubConfigForm: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"config1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub#owner"})
			.c("configure", {"node":arg.node});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				var ansNodes = iq.querySelectorAll("field");
				var ansList = [];
				for(i=0; i<ansNodes.length;i++)
				ansList.push({
					"name": ansNodes[i].getAttribute("var"),
					"type": ansNodes[i].getAttribute("type"),
					"label": ansNodes[i].getAttribute("label"),
					"value": this.GetFieldValue(ansNodes[i])
				});
				callback({
					"type":"success",
					"fields": ansList
				});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		SubmitPubsubConfigForm: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"config2"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub#owner"})
			.c("configure", {"node": arg.node})
			.c("x", {"xmlns": "jabber:x:data", "type": "submit"});
			for(var i=0; i<arg.configure.length; i++)
			req.c("field",{"var":arg.configure[i].name}).c("value").t(arg.configure[i].value).up().up();
			console.info(req.tree());
			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback({"type": "success"});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		RequestDefaultPubsubConfig: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"def1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub#owner"})
			.c("default");


			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback(iq.querySelector("default"));
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		DeleteNode: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"delete1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub#owner"})
			.c("delete", {"node":arg.node});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback({
					"type": "success",
					"redirect": iq.querySelector("redirect").getAttribute("uri")
				});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		PurgeNodes: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"purge1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub"})
			.c("purge", {"node":arg.node});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback({"type": "success"});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		GetPubsubSubcriptionRequests: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"pending1"})
			.c("command", {"xmlns":"http://jabber.org/protocol/commands", "node":"http://jabber.org/protocol/pubsub#get-pending", "action":"execute"});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback(iq.querySelector("command"));
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		RetrieveSubscriptionList: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"subman1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub#owner"})
			.c("subscriptions", {"node":arg.node});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				var ansList = [];
				var ansNodes = iq.querySelectorAll("subscription");
				for(i=0; i<ansNodes.length;i++)
				ansList.push({
					"jid" : ansNodes[i].getAttribute("jid"),
					"subscription" : ansNodes[i].getAttribute("subscription"),
					"subid" : ansNodes[i].getAttribute("subid")
				});
				callback({"type":"success","ansList":ansList});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		ModifySubscriptions: function(arg = { },callback){
			// BUILD QUERY
			var submanId = "subman2";
			if(arg.subscriptions.length > 1)
			submanId = "subman3";
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":submanId})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub#owner"})
			.c("subscriptions", {"node":arg.node});
			for(i=0; i<arg.subscriptions.length; i++)
			req = req.c("subscription", {"jid":arg.subscriptions[i].jid,"subscription":arg.subscriptions[i].subscription})

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback({"type": "success"});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},


		ApproveSubscriptionRequest: function(arg = { },callback){
			// BUILD QUERY
			var req=$msg({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"approve1"})
			req = req.tree();
			req.firstChild.append(arg.form);

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback({"type": "success"});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		RetrieveAffiliationsList: function(arg = { },callback){
			// BUILD QUERY
			var req=$iq({"type":"get", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":"ent1"})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub#owner"})
			.c("affiliations", {"node":arg.node});

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				var ansList = [];
				var ansNodes = iq.querySelectorAll("affiliation");
				for(i=0; i<ansNodes.length;i++)
				ansList.push({
					"jid" : ansNodes[i].getAttribute("jid"),
					"affiliation" : ansNodes[i].getAttribute("affiliation")
				});
				callback({"type":"success","ansList":ansList});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},

		ModifyAffiliation: function(arg = { },callback){
			// BUILD QUERY
			var submanId = "ent2";
			if(arg.affiliations.length > 1)
			submanId = "ent3";
			var req=$iq({"type":"set", "from": Strophe.getBareJidFromJid(this._connection.jid), "to":arg.server, "id":submanId})
			.c("pubsub", {"xmlns":"http://jabber.org/protocol/pubsub#owner"})
			.c("affiliations", {"node":arg.node});
			for(i=0; i<arg.affiliations.length; i++)
			req = req.c("affiliation", {"jid":arg.affiliations[i].jid,"affiliation":arg.affiliations[i].affiliation})

			// SEND AND RECEIVE THE ANSWER
			this._connection.sendIQ(req,function(iq){
				callback({"type": "success"});
			},
			function(iq){
				callback(HandleError(iq));
			});
		},





	});

})();
