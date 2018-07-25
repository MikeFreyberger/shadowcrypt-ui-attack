var ERRORS_KEY = 'signinErrors';

Template.signin.onCreated(function() {
  Session.set(ERRORS_KEY, {});
});

Template.signin.helpers({
  errorMessages: function() {
    return _.values(Session.get(ERRORS_KEY));
  },
  errorClass: function(key) {
    return Session.get(ERRORS_KEY)[key] && 'error';
  }
});

Template.signin.events({
  'submit': function(event, template) {
    event.preventDefault();
    
    var username = template.$('[name=username]').val();
    var password = template.$('[name=password]').val();
    
    var errors = {};

    if (! username) {
      errors.username = 'Email is required';
    }

    if (! password) {
      errors.password = 'Password is required';
    }
    
    Session.set(ERRORS_KEY, errors);
    if (_.keys(errors).length) {
      return;
    }
    
    Meteor.loginWithPassword(username, password, function(error) {
      if (error) {
        return Session.set(ERRORS_KEY, {'none': error.reason});
      }
      if (Lists.find({}).count() === 0) {
        var list = {name: Lists.defaultName(), incompleteCount: 0, userId: Meteor.userId(), appId: "app2"};
        list._id = Lists.insert(list);
        Router.go('listsShow', list);
      }
      else {
        Router.go('home');
      }
      
    });
  }
});
