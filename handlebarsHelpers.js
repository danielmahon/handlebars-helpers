var _ = require('underscore');
_.str = require('underscore.string');

module.exports = function(app, hbs) {

  var Handlebars = hbs.handlebars;

	Handlebars.registerHelper('urlEncode', function(context) {
		return encodeURIComponent(context);
	});
	Handlebars.registerHelper('humanize', function(context) {
		return _.str.humanize(context);
	});
	Handlebars.registerHelper('prettify', function(context) {
		return JSON.stringify(context, null, 4);
	});
	Handlebars.registerHelper('stringify', function(context) {
		return JSON.stringify(context);
	});
	Handlebars.registerHelper('getAtIndex', function(context, options) {
		return context[options.hash.i];
	});
	Handlebars.registerHelper('bindData', function(context, options) {
		if (context) {
			return 'data-' + options.hash.data + '=' + escape(JSON.stringify(context));
		} else {
			return;
		}
	});
	Handlebars.registerHelper('options_selected', function(context, options) {
		var ret = '';
		context.forEach(function(item) {
			var option = '<option value="' + (options.hash.val ? item[options.hash.val] : item) + '"';
			if (options.hash.selected && (String(options.hash.selected) === String(options.hash.val ? item[options.hash.val] : item))) {
				option += ' selected="selected"';
			}
			option += '>' + (options.hash.text ? item[options.hash.text] : item) + '</option>';
			ret += option;
		});
		return new Handlebars.SafeString(ret);
	});
	// {{include "template-partial" parentcontext=.. town=../town}}
	Handlebars.registerHelper('include', function(templatename, options) {
		var partial = Handlebars.partials[String(templatename)];
		if ( typeof partial === "string") {
			partial = Handlebars.compile(partial);
		}
		var context = _.extend({}, this, options.hash);
		return new Handlebars.SafeString(partial(context));
	});
	Handlebars.registerHelper('each', function(context, options) {
		var fn = options.fn, inverse = options.inverse;
		var ret = "";

		if (context && context.length > 0) {
			for (var i = 0, j = options.hash.limit || context.length; i < j; i++) {
				ret = ret + fn(context[i]);
			}
		} else {
			ret = inverse(this);
		}
		return ret;
	});

	Handlebars.registerHelper('flash', function(messages, options) {
		var ret = '';
		function makeAlert(type, msg) {
			var html = '<div class="fade in alert' + (_.contains(['success', 'info', 'error', 'danger'], type) ? ' alert-' + type : '') + '">';
			html += '<button type="button" class="close" data-dismiss="alert">×</button>';
			html += '<strong>' + type.charAt(0).toUpperCase() + type.slice(1) + '!</strong> ' + msg;
			html += '</div>';
			return html;
		}

		for (var prop in messages) {
			if (_.isArray(messages[prop])) {
				messages[prop].forEach(function(msg) {
					ret += makeAlert(prop, msg);
				});
			} else {
				ret += makeAlert(prop, messages[prop]);
			}
		}
		return new Handlebars.SafeString('<div class="alerts">' + ret + '</div>');
	});

	// HELPER: #key_value
	//
	// Usage: {{#key_value obj}} Key: {{key}} // Value: {{value}} {{/key_value}}
	//
	// Iterate over an object, setting 'key' and 'value' for each property in
	// the object.
	Handlebars.registerHelper("key_value", function(obj, options) {
		var buffer = "", key;
		var exclusions = options.hash.exclude.split(',') || [];
		if ( typeof obj.toObject === 'function') {
			obj = obj.toObject();
		}

		for (key in obj) {
			if (obj.hasOwnProperty(key) && exclusions.indexOf(key) === -1) {
				buffer += options.fn({
					key: key,
					value: obj[key]
				});
			}
		}

		return buffer;
	});

	// HELPER: #each_with_key
	//
	// Usage: {{#each_with_key container key="myKey"}}...{{/each_with_key}}
	//
	// Iterate over an object containing other objects. Each
	// inner object will be used in turn, with an added key ("myKey")
	// set to the value of the inner object's key in the container.
	Handlebars.registerHelper("each_with_key", function(obj, fn) {
		var context, buffer = "", key, keyName = fn.hash.key;
		if ( typeof obj.toObject === 'function') {
			obj = obj.toObject();
		}

		for (key in obj) {
			if (obj.hasOwnProperty(key)) {
				context = obj[key];

				if (keyName) {
					context[keyName] = key;
				}

				buffer += fn(context);
			}
		}

		return buffer;
	});

	Handlebars.registerHelper('subcontext', function(parent, options) {

		if (arguments.length != 2)
			throw new Error("Handlerbars Helper 'subcontext' needs .. as a parameter");

		var subcontext = {
			obj: this,
			parent: parent
		};

		return options.fn(subcontext);
	});

	/* Handlebars Helpers - Dan Harper (http://github.com/danharper) */

	/* This program is free software. It comes without any warranty, to
	* the extent permitted by applicable law. You can redistribute it
	* and/or modify it under the terms of the Do What The Fuck You Want
	* To Public License, Version 2, as published by Sam Hocevar. See
	* http://sam.zoy.org/wtfpl/COPYING for more details. */

	/**
	 * If Equals
	 * if_eq this compare=that
	 */
	Handlebars.registerHelper('if_eq', function(context, options) {
		if (context === options.hash.compare) {
			return options.fn(this);
		}
		return options.inverse(this);
	});

	/**
	 * Unless Equals
	 * unless_eq this compare=that
	 */
	Handlebars.registerHelper('unless_eq', function(context, options) {
		if (context === options.hash.compare) {
			return options.inverse(this);
		}
		return options.fn(this);
	});

	/**
	 * If Greater Than
	 * if_gt this compare=that
	 */
	Handlebars.registerHelper('if_gt', function(context, options) {
		if (context > options.hash.compare) {
			return options.fn(this);
		}
		return options.inverse(this);
	});

	/**
	 * Unless Greater Than
	 * unless_gt this compare=that
	 */
	Handlebars.registerHelper('unless_gt', function(context, options) {
		if (context > options.hash.compare) {
			return options.inverse(this);
		}
		return options.fn(this);
	});

	/**
	 * If Less Than
	 * if_lt this compare=that
	 */
	Handlebars.registerHelper('if_lt', function(context, options) {
		if (context < options.hash.compare) {
			return options.fn(this);
		}
		return options.inverse(this);
	});

	/**
	 * Unless Less Than
	 * unless_lt this compare=that
	 */
	Handlebars.registerHelper('unless_lt', function(context, options) {
		if (context < options.hash.compare) {
			return options.inverse(this);
		}
		return options.fn(this);
	});

	/**
	 * If Greater Than or Equal To
	 * if_gteq this compare=that
	 */
	Handlebars.registerHelper('if_gteq', function(context, options) {
		if (context >= options.hash.compare) {
			return options.fn(this);
		}
		return options.inverse(this);
	});

	/**
	 * Unless Greater Than or Equal To
	 * unless_gteq this compare=that
	 */
	Handlebars.registerHelper('unless_gteq', function(context, options) {
		if (context >= options.hash.compare) {
			return options.inverse(this);
		}
		return options.fn(this);
	});

	/**
	 * If Less Than or Equal To
	 * if_lteq this compare=that
	 */
	Handlebars.registerHelper('if_lteq', function(context, options) {
		if (context <= options.hash.compare) {
			return options.fn(this);
		}
		return options.inverse(this);
	});

	/**
	 * Unless Less Than or Equal To
	 * unless_lteq this compare=that
	 */
	Handlebars.registerHelper('unless_lteq', function(context, options) {
		if (context <= options.hash.compare) {
			return options.inverse(this);
		}
		return options.fn(this);
	});

	/**
	 * Convert new line (\n\r) to <br>
	 * from http://phpjs.org/functions/nl2br:480
	 */
	Handlebars.registerHelper('nl2br', function(text) {
		var nl2br = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
		return new Handlebars.SafeString(nl2br);
	});
};

