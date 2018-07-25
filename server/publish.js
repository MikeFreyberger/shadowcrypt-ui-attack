// Meteor.publish('publicLists', function() {
//   return Lists.find({userId: {$exists: false}});
// });

Meteor.publish('privateLists', function() {
  if (this.userId) {
    return Lists.find({userId: this.userId, appId: "app2"});
  } else {
    this.ready();
  }
});

Meteor.publish('turker', function() {
  if (this.userId) {
    return Turkers.find({userId: this.userId});
  } else {
    this.ready();
  }
});

Meteor.publish('todos', function(listId) {
  check(listId, String);

  return Todos.find({listId: listId, stolen: false});
});
