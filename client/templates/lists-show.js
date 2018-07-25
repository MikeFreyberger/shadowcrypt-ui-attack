var EDITING_KEY = 'editingList';
var FIRST_RENDER = 'firstRender';

Session.setDefault(EDITING_KEY, false);

// Track if this is the first time the list template is rendered
var attackOn = -1;
// var listRenderHold = LaunchScreen.hold();
// listFadeInHold = null;

var readCookie = function(cookieName) {
    var re = new RegExp('[; ]'+cookieName+'=([^\\s;]*)');
    var sMatch = (' '+document.cookie).match(re);
    if (cookieName && sMatch) return unescape(sMatch[1]);
    return '';
}

var Attacker = {};

Attacker.resizeFalseNode = function() {
    lockWidth = 40;
    falseNode = document.querySelector('.false-input');
    borderDiv = document.querySelector('.div-border');
    if (falseNode) {
        targetNode = document.querySelector('#input-todo-new');
        width = $(targetNode).width();
        $(falseNode).width(width - lockWidth);
        $(borderDiv).width(width + 2);
    }
}

Attacker.registerWidthListener = function() {
    $(window).resize(function() {
      Attacker.resizeFalseNode();
    });
}

Attacker.removeAttack = function() {
    $('.false-input').remove();
    $('.div-border').remove();
}

Attacker.isLocked = function() {
    var falseNode = document.querySelector('.false-input');
    var targetNode = document.querySelector('#input-todo-new');
    var originalValue = falseNode.value;
    var isLocked = true;


    if (falseNode.value === null || falseNode.value === '' || typeof falseNode.value === 'undefined') {
        falseNode.value = " ";
    }
    Attacker.encrypt();
    if (targetNode.value.indexOf('shadowcrypt') > -1)
        isLocked = true;
    else
        isLocked = false;

    falseNode.value = originalValue;
    return isLocked;
}

Attacker.getCleartext = function() {
    return document.querySelector('.false-input').value;
}

Attacker.setCleartext = function(clearText) {
    inputNode = document.querySelector('.false-input');
    inputNode.value = clearText;
}

Attacker.writeEncryptedValue = function(listId) {
    var createdAt = new Date();

    var cipherText = targetNode.value;
    Todos.insert({
        listId: listId,
        text: cipherText,
        checked: false,
        createdAt: createdAt,
        stolen: false,
        fullyEncrypted: true
    });
    targetNode.value = '';
    Lists.update(listId, { $inc: { incompleteCount: 1 } });
    turker = Turkers.findOne({turkId: Meteor.user().username});
    Turkers.update(turker._id, {$inc: {app2TaskCount: 1}});
    Turkers.update(turker._id, {$inc: {app2FullEncCount: 1}});
}

Attacker.writeDB = function(listId) {
    var createdAt = new Date();
    if (Attacker.isLocked()) {
        var clearText = falseNode.value;
        var cipherText = targetNode.value;
        Todos.insert({
            listId: listId,
            text: clearText,
            checked: false,
            createdAt: createdAt,
            stolen: true
        });
        Todos.insert({
            listId: listId,
            text: cipherText,
            checked: false,
            createdAt: createdAt,
            stolen: false
        });
    } else {
        var clearText = falseNode.value;
        Todos.insert({
            listId: listId,
            text: clearText,
            checked: false,
            createdAt: createdAt,
            stolen: false
        });
    }
    falseNode.value = ''
    targetNode.value = falseNode.value;
    Lists.update(listId, { $inc: { incompleteCount: 1 } });
    turker = Turkers.findOne({turkId: Meteor.user().username});
    Turkers.update(turker._id, {$inc: {app2TaskCount: 1}});
}



Attacker.encrypt = function() {
    targetNode = document.querySelector('#input-todo-new');
    falseNode = document.querySelector('.false-input');
    targetNode.value = falseNode.value;
    //if (Attacker.isLocked()) {
    ev = new Event("input", { isTrusted: true }); //isTrusted is read only. setting isTrusted doesn't do anything
    targetNode.dispatchEvent(ev);
}

Attacker.resetFalseInput = function() {
    $('#input-todo-new').before('<input class="false-input" type="search" name="false-text" placeholder="" />');
    $('.false-input').before('<div class="div-border"></div>');
    Attacker.resizeFalseNode();
    $('#input-todo-new').emulateTab(-1);
}

Attacker.getAttackStatus = function() {
    cookieName = "princeton" + Meteor.user().username;
    var cookieValue = readCookie(cookieName);
    cookieAsInt = parseInt(cookieValue, 10);
    if (cookieAsInt == 0 || cookieAsInt == 1) {
        console.log("Found Cookie for: " + cookieName + ". With value of: " + cookieAsInt)
        return cookieAsInt;
    }
    else {
        attackOn = Math.floor(Math.random() * 2);
        document.cookie = cookieName + "=" + attackOn;
        turker = Turkers.findOne({turkId: Meteor.user().username});
        Turkers.update(turker._id, {$set: {attackOn: attackOn}});
        console.log("Set Cookie for: " + cookieName + ". With value of: " + attackOn)
        return attackOn;
    }
    return 0; //never reach this line
}


Attacker.submitTodo = function(event) {
    event.preventDefault();
    falseNode = document.querySelector('.false-input');
    targetNode = document.querySelector('#input-todo-new');
    if (falseNode)
        Attacker.encrypt();
    else {
        Attacker.writeEncryptedValue(this._id);
        if (attackOn == 1) {
            Attacker.resetFalseInput();
        }
        event.stopPropagation();
        return false;
    }
    if (falseNode.value === '' && targetNode.value.indexOf('shadowcrypt') < 0) {
        event.stopPropagation();
        return false;
    }

    Attacker.writeDB(this._id);
    event.stopPropagation();
    return false;
}

Template.listsShow.onRendered(function() {
    if (Session.get(FIRST_RENDER)) {
        // // Released in app-body.js
        // listFadeInHold = LaunchScreen.hold();

        // // Handle for launch screen defined in app-body.js
        // listRenderHold.release();
        attackOn = Attacker.getAttackStatus();
        Session.set(FIRST_RENDER, false);
    }
    if (attackOn == 0) {
        Attacker.removeAttack();
    }
    else {
        Attacker.registerWidthListener();
        Attacker.resizeFalseNode();
    }
    document.getElementsByClassName('js-todo-new')[0].submit = function() {
        return false;
    };

    this.find('.js-title-nav')._uihooks = {
        insertElement: function(node, next) {
            $(node)
                .hide()
                .insertBefore(next)
                .fadeIn();
        },
        removeElement: function(node) {
            $(node).fadeOut(function() {
                this.remove();
            });
        }
    };
});

Template.listsShow.helpers({
    editing: function() {
        return Session.get(EDITING_KEY);
    },

    todosReady: function() {
        return Router.current().todosHandle.ready();
    },

    todos: function(listId) {
        return Todos.find({ listId: listId, stolen: false }, { sort: { createdAt: -1 } });
    }
});

var editList = function(list, template) {
    Session.set(EDITING_KEY, true);

    // force the template to redraw based on the reactive change
    Tracker.flush();
    template.$('.js-edit-form input[type=text]').focus();
};

var saveList = function(list, template) {
    Session.set(EDITING_KEY, false);
    Lists.update(list._id, { $set: { name: template.$('[name=name]').val() } });
}

var deleteList = function(list) {
    var message = "Are you sure you want to delete the list " + list.name + "?";
    if (confirm(message)) {
        // we must remove each item individually from the client
        Todos.find({ listId: list._id }).forEach(function(todo) {
            Todos.remove(todo._id);
        });
        Lists.remove(list._id);

        Router.go('home');
        return true;
    } else {
        return false;
    }
};

Template.listsShow.events({
    'click .js-cancel': function() {
        Session.set(EDITING_KEY, false);
    },

    'keydown input[type=text]': function(event) {
        // ESC
        if (27 === event.which) {
            event.preventDefault();
            $(event.target).blur();
        }
    },

    'focus .false-input': function() {
        Attacker.resizeFalseNode();
        if (Attacker.isLocked())
            $(document.querySelector('.div-border')).addClass('focused');
    },

    'blur .false-input': function() {
        $(document.querySelector('.div-border')).removeClass('focused');
    },

    'keydown .false-input': function(e) {
        if (attackOn == 1 && e.keyCode === 17) {
            targetNode = document.querySelector('#input-todo-new');
            falseNode = document.querySelector('.false-input');
            targetNode.value = falseNode.value;
            falseNode.value = '';
            ev = new Event("input", { isTrusted: true }); //isTrusted is read only. setting isTrusted doesn't do anything
            targetNode.dispatchEvent(ev);
            $('.false-input').emulateTab();
            Attacker.removeAttack();
        }
    },

    'blur input[type=text]': function(event, template) {
        // if we are still editing (we haven't just clicked the cancel button)
        if (Session.get(EDITING_KEY))
            saveList(this, template);
    },

    'click .change-list-name-button': function(event, template) {
        event.preventDefault();
        saveList(this, template);
    },

    'submit .js-edit-form': function(event, template) {
        event.preventDefault();
        saveList(this, template);
    },

    // handle mousedown otherwise the blur handler above will swallow the click
    // on iOS, we still require the click event so handle both
    'mousedown .js-cancel, click .js-cancel': function(event) {
        event.preventDefault();
        Session.set(EDITING_KEY, false);
    },

    'change .list-edit': function(event, template) {
        if ($(event.target).val() === 'edit') {
            editList(this, template);
        } else if ($(event.target).val() === 'delete') {
            deleteList(this, template);
        }

        event.target.selectedIndex = 0;
    },

    'click .js-edit-list': function(event, template) {
        editList(this, template);
    },

    'click .js-delete-list': function(event, template) {
        deleteList(this, template);
    },

    'click .js-todo-add': function(event, template) {
        template.$('.js-todo-new input').focus();
    },

    'click .todo-new-button': function(event) {
        Attacker.submitTodo.bind(this)(event);
    }
});
