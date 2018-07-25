var MENU_KEY = 'menuOpen';
Session.setDefault(MENU_KEY, false);

var FIRST_RENDER = 'firstRender';
Session.setDefault(FIRST_RENDER, true);


var USER_MENU_KEY = 'userMenuOpen';
Session.setDefault(USER_MENU_KEY, false);

var SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue';
Session.setDefault(SHOW_CONNECTION_ISSUE_KEY, false);

var CONNECTION_ISSUE_TIMEOUT = 5000;

// var Attacker = {};
// Attacker.attack = function() {
//     //debugger;
//     var inputNode = document.querySelector('false-input').type = "text";
// }

Meteor.startup(function () {
  // set up a swipe left / right handler
  // $(document.body).touchwipe({
  //   wipeLeft: function () {
  //     Session.set(MENU_KEY, false);
  //   },
  //   wipeRight: function () {
  //     Session.set(MENU_KEY, true);
  //   },
  //   preventDefaultEvents: false
  // });

  // Only show the connection error box if it has been 5 seconds since
  // the app started
  setTimeout(function () {
    // Launch screen handle created in lib/router.js
    // dataReadyHold.release();

    // Show the connection error box
    Session.set(SHOW_CONNECTION_ISSUE_KEY, true);
  }, CONNECTION_ISSUE_TIMEOUT);
});

Template.appBody.onRendered(function() {

  this.find('#content-container')._uihooks = {
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn(function () {
          // if (listFadeInHold) {
          //   listFadeInHold.release();
          // }
        });
    },
    removeElement: function(node) {
      $(node).fadeOut(function() {
        $(this).remove();
      });
    }
  };
});

Template.appBody.helpers({
  // We use #each on an array of one item so that the "list" template is
  // removed and a new copy is added when changing lists, which is
  // important for animation purposes. #each looks at the _id property of it's
  // items to know when to insert a new item and when to update an old one.
  thisArray: function() {
    return [this];
  },
  menuOpen: function() {
    return Session.get(MENU_KEY) && 'menu-open';
  },
  cordova: function() {
    return Meteor.isCordova && 'cordova';
  },
  emailLocalPart: function() {
    var username = '';
    if (Meteor.user())
      username = Meteor.user().username;
    //return email.substring(0, email.indexOf('@'));
    return username;
  },
  userMenuOpen: function() {
    return Session.get(USER_MENU_KEY);
  },
  lists: function() {
    return Lists.find();
  },
  activeListClass: function() {
    var current = Router.current();
    if (current.route.name === 'listsShow' && current.params._id === this._id) {
      return 'active';
    }
  },
  connected: function() {
    if (Session.get(SHOW_CONNECTION_ISSUE_KEY)) {
      return Meteor.status().connected;
    } else {
      return true;
    }
  },
  attemptName: function() {
    var el = document.getElementById(this._id);
    if (el) {
      el.innerHTML = '';
      var newHtml = '';
      if (this.incompleteCount > 0)
        newHtml += '<span class="count-list">' + this.incompleteCount + '</span>';
      newHtml += this.name;
      el.innerHTML = newHtml;
    }
  }
});

Template.appBody.events({
  'click .js-menu': function() {
    Session.set(MENU_KEY, ! Session.get(MENU_KEY));
  },

  'click .content-overlay': function(event) {
    Session.set(MENU_KEY, false);
    event.preventDefault();
  },

  'click .js-user-menu': function(event) {
    Session.set(USER_MENU_KEY, ! Session.get(USER_MENU_KEY));
    // stop the menu from closing
    event.stopImmediatePropagation();
  },

  'click .js-reload': function(event) {
    window.location.reload();
    // stop the menu from closing
    event.stopImmediatePropagation();
  },

  'click #menu a': function() {
    Session.set(MENU_KEY, false);
  },

  'click .js-logout': function() {
    Meteor.logout();
    Session.set(FIRST_RENDER, true);
    Router.go('signin');
  },

  'click .js-new-list': function() {
    if (! Meteor.user()) {
      return alert("Please sign in or create an account to a list.");
    }
    var list = {name: Lists.defaultName(), incompleteCount: 0, userId: Meteor.userId(), appId: "app2"};
    list._id = Lists.insert(list);
    turker = Turkers.findOne({turkId: Meteor.user().username});
    Turkers.update(turker._id, {$inc: {app2ListCount: 1}});


    Router.go('listsShow', list);
  }
});
