function decodeMessage(eventHandler) {
    return function (e) {
        const decoded = JSON.parse(e.data);
        eventHandler(decoded);
    };
}

function bindEvent(element, eventName, eventHandler) {
    if (element.addEventListener) {
        element.addEventListener(eventName, decodeMessage(eventHandler), false);
    } else if (element.attachEvent) {
        element.attachEvent(`on${eventName}`, decodeMessage(eventHandler));
    }
}

function initMessagesIframe() {

    // Send a message to the parent
    const sendToParent = function (action, data) {
    const encoded = JSON.stringify({
        action,
        agrs: data,
    });
    // Make sure you are sending a string, and to stringify JSON
    window.parent.postMessage(encoded, '*');
    };

    // Listen to messages from parent window
    bindEvent(this.contentWindow, 'message', function (data) {
    // tslint:disable-next-line:no-console
    console.log('message in iframe', data);
    // if (e.data ===)
    if (data.action === 'login') {
        const email = document.getElementById('at-field-username_and_email');
        const pwd = document.getElementById('at-field-password');
        const form = document.getElementById('at-pwd-form');
        if (form && email && pwd) {
        // tslint:disable-next-line:no-console
        console.log('login detected');
        email.value = data.email;
        pwd.value = data.pwd;
        try {
            form.submit();
        } catch (err) {
            sendToParent('error', { message: 'fail submit' });
        }
        } else {
        console.error('fail to get form, pwd or email', form, email, pwd);
        sendToParent('error', { message: 'fail to get form, pwd or email' });
        }
    }
    });
    sendToParent('inited', {});
}

initMessagesIframe();