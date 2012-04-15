function jappixmini_addon_xor(str1, str2) {
    if (str1.length != str2.length) throw "not same length";

    encoded = "";

    for (i=0; i<str1.length;i++) {
        var a = str1.charCodeAt(i);
        var b = str2.charCodeAt(i);
        var c = a ^ b;

        encoded += String.fromCharCode(c);
    }

    return encoded;
}

function jappixmini_addon_set_client_secret(password) {
	if (!password) return;

	salt1 = "h8doCRekWto0njyQohKpdx6BN0UTyC6N";
	salt2 = "jdX8OwFC1kWAq3s9uOyAcE8g3UNNO5t3";

	client_secret1 = str_sha1(salt1+password);
	client_secret2 = str_sha1(salt2+password);
	client_secret = client_secret1 + client_secret2;

	setDB('jappix-mini', 'client-secret', client_secret);
	console.log("client secret set");
}

function jappixmini_addon_get_client_secret(callback) {
	client_secret = getDB('jappix-mini', 'client-secret');
	if (client_secret===null) {
		div = document.getElementById("#jappixmini-password-query-div");

		if (!div) {
			div = $('<div id="jappixmini-password-query-div" style="position:fixed;padding:1em;background-color:#F00;color:#fff;top:50px;left:50px;">Retype your Friendica password for chatting:<br></div>');

			input = $('<input type="password" id="jappixmini-password-query-input">')
			div.append(input);

			button = $('<input type="button" value="OK" id="jappixmini-password-query-button">');
			div.append(button);

			$("body").append(div);
		}

		button.click(function(){
			password = $("#jappixmini-password-query-input").val();
			jappixmini_addon_set_client_secret(password);
			div.remove();

			client_secret = getDB('jappix-mini', 'client-secret');
			callback(client_secret);
		});
	}
	else {
		callback(client_secret);
	}
}

function jappixmini_addon_encrypt_password(password, callback) {
	jappixmini_addon_get_client_secret(function(client_secret){
		// add \0 to password until it has the same length as secret
		if (password.length>client_secret.length-1) throw "password too long";
		while (password.length<client_secret.length) {
			password += "\0";
		}

		// xor password with secret
		encrypted_password = jappixmini_addon_xor(client_secret, password);

		encrypted_password = encodeURI(encrypted_password)
		callback(encrypted_password);
	});
}

function jappixmini_addon_decrypt_password(encrypted_password, callback) {
	encrypted_password = decodeURI(encrypted_password);

	jappixmini_addon_get_client_secret(function(client_secret){
		// xor password with secret
		password = jappixmini_addon_xor(client_secret, encrypted_password);

		// remove \0
		first_null = password.indexOf("\0")
		// TODO: check first_null==null
		password = password.substr(0, first_null);

		callback(password);
	});
}

function jappixmini_manage_roster(contacts, autoapprove, autosubscribe) {
	// listen for subscriptions
	con.registerHandler('presence',function(presence){
		var type = presence.getType();
		if (type != "subscribe") return;

		var from = fullXID(getStanzaFrom(presence));
		var xid = bareXID(from);

		approve = true;
		if ((!autoapprove) || contacts[xid]===undefined)
			approve = confirm("Accept "+xid+" for chat?");

		if (approve) {
			acceptSubscribe(xid, contacts[xid]);
			console.log("Accepted "+xid+" for chat.");
		}
	});

	// autosubscribe
	if (autosubscribe) {
		for (i=0; i<contacts.length; i++) {
			xid = contacts[i];
			sendSubscribe(xid, "subscribe");
			console.log("Subscribed to "+xid);
		}
	}
}

function jappixmini_addon_subscribe() {
        if (!window.con) {
		alert("Not connected.");
		return;
        }

	xid = prompt("Jabber address");
	sendSubscribe(xid, "subscribe");
}

function jappixmini_addon_start(server, username, bosh, encrypted, password, nickname, contacts, autoapprove, autosubscribe) {
    handler = function(password){
        // check if settings have changed, reinitialize jappix mini if this is the case
        settings_identifier = str_sha1(server);
        settings_identifier += str_sha1(username);
        settings_identifier += str_sha1(bosh);
        settings_identifier += str_sha1(password);
        settings_identifier += str_sha1(nickname);

        saved_identifier = getDB("jappix-mini", "settings_identifier");
        if (saved_identifier != settings_identifier) removeDB('jappix-mini', 'dom');
        setDB("jappix-mini", "settings_identifier", settings_identifier);

        // set bosh host
        if (bosh)
            HOST_BOSH = HOST_BOSH+"?host_bosh="+encodeURI(bosh);

        // start jappix mini
        MINI_NICKNAME = nickname;
        console.log("launchMini");
        launchMini(true, false, server, username, password);
	jappixmini_manage_roster(contacts, autoapprove, autosubscribe)
    }

    // decrypt password if necessary
    if (encrypted)
        jappixmini_addon_decrypt_password(password, handler);
    else
        handler(password);
}
