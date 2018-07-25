var ERRORS_KEY = 'joinErrors';

Template.join.onCreated(function() {
  Session.set(ERRORS_KEY, {});
});

Template.join.helpers({
  errorMessages: function() {
    return _.values(Session.get(ERRORS_KEY));
  },
  errorClass: function(key) {
    return Session.get(ERRORS_KEY)[key] && 'error';
  }
});

Template.join.events({
  'submit': function(event, template) {
    event.preventDefault();
    var username = template.$('[name=username]').val();
    var password = template.$('[name=password]').val();
    var confirm = template.$('[name=confirm]').val();

    var errors = {};

    if (! username) {
      errors.username = 'Email required';
    }

    if (! password) {
      errors.password = 'Password required';
    }

    if (confirm !== password) {
      errors.confirm = 'Please confirm your password';
    }

    Session.set(ERRORS_KEY, errors);
    if (_.keys(errors).length) {
      return;
    }

    Accounts.createUser({
      username: username,
      password: password
    }, function(error) {
      if (error) {
        return Session.set(ERRORS_KEY, {'none': error.reason});
      }
      var list = {name: Lists.defaultName(), incompleteCount: 0, userId: Meteor.userId(), appId: "app2"};
      list._id = Lists.insert(list);
      var turker = Turkers.find({turkId: Meteor.userId()});
      if (turker && turker.count() !== 0)
        Turkers.update(turker._id, {app2ListCount: 0, app2TaskCount: 0, app2FullEncCount: 0, attackOn: 9});
      else {
        turker = {userId: Meteor.userId(), turkId: Meteor.user().username, app2TaskCount: 0, app2FullEncCount: 0, app2ListCount: 0};
        Turkers.insert(turker);
      }

      Router.go('listsShow', list);
    });
  }
});
